-- =====================================================
-- NEXUS ERP - SISTEMA DE CALENDÁRIO
-- Migração: 004_calendar_system.sql
-- Data: 2024-01-XX
-- =====================================================

-- =====================================================
-- 1. CALENDÁRIOS DA ORGANIZAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS cal_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#0ea5e9',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, name)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cal_calendars_org_id ON cal_calendars(org_id);
CREATE INDEX IF NOT EXISTS idx_cal_calendars_is_default ON cal_calendars(is_default);

-- RLS
ALTER TABLE cal_calendars ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. EVENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS cal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  calendar_id UUID NOT NULL REFERENCES cal_calendars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  all_day BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  -- Recorrência simples (opcional)
  rrule TEXT,                    -- iCal RRULE opcional
  source_provider TEXT,          -- 'google_calendar' | null
  source_event_id TEXT,          -- id do provider
  kind TEXT DEFAULT 'general',   -- 'general' | 'task_due'
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cal_events_org_time ON cal_events(org_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_cal_events_calendar_id ON cal_events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_cal_events_kind ON cal_events(kind);

-- RLS
ALTER TABLE cal_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. PARTICIPANTES (USUÁRIOS/CONTATOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS cal_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES cal_events(id) ON DELETE CASCADE,
  user_id UUID,                  -- membro interno (opcional)
  contact_id UUID,               -- contato CRM (opcional)
  email TEXT,                    -- fallback externo
  role TEXT DEFAULT 'required',  -- required|optional
  response TEXT DEFAULT 'needs_action', -- needs_action|accepted|declined|tentative
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cal_event_attendees_event_id ON cal_event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_cal_event_attendees_user_id ON cal_event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_cal_event_attendees_contact_id ON cal_event_attendees(contact_id);

-- RLS
ALTER TABLE cal_event_attendees ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. VÍNCULO EVENTO ↔ TAREFA (N:N, usamos 1:1 para vencimento)
-- =====================================================

CREATE TABLE IF NOT EXISTS cal_event_tasks (
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES cal_events(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES ops_tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, task_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cal_event_tasks_event_id ON cal_event_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_cal_event_tasks_task_id ON cal_event_tasks(task_id);

-- RLS
ALTER TABLE cal_event_tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. VIEW PARA O CALENDÁRIO
-- =====================================================

-- View para o calendário (expande o título com info da tarefa quando for kind=task_due)
CREATE OR REPLACE VIEW v_calendar_events AS
SELECT
  e.*,
  t.title as task_title,
  t.status as task_status,
  t.priority as task_priority,
  t.project_id,
  p.name as project_name,
  c.name as calendar_name,
  c.color as calendar_color
FROM cal_events e
LEFT JOIN cal_calendars c ON e.calendar_id = c.id
LEFT JOIN cal_event_tasks et ON et.event_id = e.id
LEFT JOIN ops_tasks t ON t.id = et.task_id
LEFT JOIN ops_projects p ON t.project_id = p.id;

-- =====================================================
-- 6. FUNÇÕES AUXILIARES
-- =====================================================

-- Função que garante um calendário padrão por org
CREATE OR REPLACE FUNCTION cal_get_or_create_default(p_org UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE 
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM cal_calendars WHERE org_id = p_org AND is_default = true LIMIT 1;
  IF v_id IS NULL THEN
    INSERT INTO cal_calendars(org_id, name, color, is_default)
    VALUES (p_org, 'Agenda da Equipe', '#0ea5e9', true)
    RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END $$;

-- Upsert de evento de vencimento da tarefa
CREATE OR REPLACE FUNCTION cal_upsert_task_due_event(p_task UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_task RECORD;
  v_cal UUID;
  v_event UUID;
BEGIN
  SELECT * INTO v_task FROM ops_tasks WHERE id = p_task;
  IF v_task IS NULL THEN
    RETURN;
  END IF;

  -- Busca calendário default da org
  v_cal := cal_get_or_create_default(v_task.org_id);

  -- Se não tem due_date, remove evento 'task_due' existente
  IF v_task.due_date IS NULL THEN
    DELETE FROM cal_events e
    USING cal_event_tasks et
    WHERE et.task_id = v_task.id AND et.event_id = e.id AND e.kind = 'task_due';
    RETURN;
  END IF;

  -- Procura evento já vinculado
  SELECT e.id INTO v_event
  FROM cal_events e
  JOIN cal_event_tasks et ON et.event_id = e.id
  WHERE et.task_id = v_task.id AND e.kind = 'task_due'
  LIMIT 1;

  IF v_event IS NULL THEN
    -- cria evento no dia do vencimento, 09:00–10:00 (default)
    INSERT INTO cal_events(org_id, calendar_id, title, description, all_day, starts_at, ends_at, kind, created_by)
    VALUES (
      v_task.org_id, v_cal,
      CONCAT('Vencimento: ', v_task.title),
      COALESCE(v_task.description, ''),
      true,
      (v_task.due_date)::timestamptz,
      ((v_task.due_date + 1)::timestamptz), -- all_day em SQL (início do dia até início do dia seguinte)
      'task_due',
      v_task.created_by
    )
    RETURNING id INTO v_event;

    INSERT INTO cal_event_tasks(org_id, event_id, task_id)
    VALUES (v_task.org_id, v_event, v_task.id)
    ON CONFLICT DO NOTHING;
  ELSE
    -- atualiza datas/título conforme task
    UPDATE cal_events
    SET
      title = CONCAT('Vencimento: ', v_task.title),
      description = COALESCE(v_task.description, ''),
      all_day = true,
      starts_at = (v_task.due_date)::timestamptz,
      ends_at = ((v_task.due_date + 1)::timestamptz),
      updated_at = NOW()
    WHERE id = v_event;
  END IF;
END $$;

-- Função para remover eventos quando tarefa for deletada
CREATE OR REPLACE FUNCTION cal_delete_task_events()
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
BEGIN
  DELETE FROM cal_events e 
  USING cal_event_tasks et
  WHERE et.task_id = OLD.id AND et.event_id = e.id AND e.kind = 'task_due';
  RETURN OLD;
END $$;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger: sincroniza evento quando due_date mudar
DROP TRIGGER IF EXISTS trg_task_due_to_calendar ON ops_tasks;
CREATE TRIGGER trg_task_due_to_calendar
AFTER INSERT OR UPDATE OF title, description, due_date ON ops_tasks
FOR EACH ROW EXECUTE FUNCTION cal_upsert_task_due_event(NEW.id);

-- Trigger: remove evento quando tarefa for deletada
DROP TRIGGER IF EXISTS trg_task_delete_events ON ops_tasks;
CREATE TRIGGER trg_task_delete_events
AFTER DELETE ON ops_tasks
FOR EACH ROW EXECUTE FUNCTION cal_delete_task_events();

-- Trigger para updated_at
CREATE TRIGGER update_cal_calendars_updated_at BEFORE UPDATE ON cal_calendars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cal_events_updated_at BEFORE UPDATE ON cal_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir calendário padrão para organizações existentes
INSERT INTO cal_calendars (org_id, name, color, is_default)
SELECT 
  id as org_id,
  'Agenda da Equipe' as name,
  '#0ea5e9' as color,
  true as is_default
FROM orgs
WHERE id NOT IN (SELECT org_id FROM cal_calendars WHERE is_default = true);

-- =====================================================
-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE cal_calendars IS 'Calendários da organização';
COMMENT ON TABLE cal_events IS 'Eventos do calendário';
COMMENT ON TABLE cal_event_attendees IS 'Participantes dos eventos';
COMMENT ON TABLE cal_event_tasks IS 'Vínculo entre eventos e tarefas';
COMMENT ON VIEW v_calendar_events IS 'View para exibição de eventos no calendário';
COMMENT ON FUNCTION cal_get_or_create_default IS 'Garante um calendário padrão por organização';
COMMENT ON FUNCTION cal_upsert_task_due_event IS 'Cria/atualiza evento de vencimento para tarefa';
COMMENT ON FUNCTION cal_delete_task_events IS 'Remove eventos quando tarefa é deletada';
