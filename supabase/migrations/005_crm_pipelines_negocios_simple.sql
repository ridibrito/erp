-- =====================================================
-- NEXUS ERP - CRM: PIPELINES E NEGÓCIOS (Simplificado)
-- Migração: 005_crm_pipelines_negocios_simple.sql
-- Data: 2025-09-30
-- =====================================================

-- =====================================================
-- 1. PIPELINES DE VENDAS
-- =====================================================

-- Tabela de pipelines
CREATE TABLE IF NOT EXISTS crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, name)
);

-- Tabela de etapas do pipeline
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  "order" INTEGER NOT NULL DEFAULT 0,
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pipeline_id, "order")
);

-- =====================================================
-- 2. NEGÓCIOS/OPORTUNIDADES
-- =====================================================

-- Tabela de negócios
CREATE TABLE IF NOT EXISTS crm_negocios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  pipeline_id UUID REFERENCES crm_pipelines(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES crm_pipeline_stages(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  client VARCHAR(255),
  value DECIMAL(15,2) DEFAULT 0,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  contact_id UUID,
  company_id UUID,
  responsible VARCHAR(255),
  next_contact TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. ÍNDICES
-- =====================================================

-- Índices para crm_pipelines
CREATE INDEX IF NOT EXISTS idx_crm_pipelines_org_id ON crm_pipelines(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipelines_is_default ON crm_pipelines(org_id, is_default);

-- Índices para crm_pipeline_stages
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_pipeline_id ON crm_pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_order ON crm_pipeline_stages(pipeline_id, "order");

-- Índices para crm_negocios
CREATE INDEX IF NOT EXISTS idx_crm_negocios_org_id ON crm_negocios(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_pipeline_id ON crm_negocios(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_stage_id ON crm_negocios(stage_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_status ON crm_negocios(org_id, status);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_negocios ENABLE ROW LEVEL SECURITY;

-- Políticas para crm_pipelines
DROP POLICY IF EXISTS "Users can view pipelines from their org" ON crm_pipelines;
CREATE POLICY "Users can view pipelines from their org" ON crm_pipelines
  FOR SELECT USING (org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Users can insert pipelines in their org" ON crm_pipelines;
CREATE POLICY "Users can insert pipelines in their org" ON crm_pipelines
  FOR INSERT WITH CHECK (org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Users can update pipelines from their org" ON crm_pipelines;
CREATE POLICY "Users can update pipelines from their org" ON crm_pipelines
  FOR UPDATE USING (org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Users can delete pipelines from their org" ON crm_pipelines;
CREATE POLICY "Users can delete pipelines from their org" ON crm_pipelines
  FOR DELETE USING (org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text));

-- Políticas para crm_pipeline_stages
DROP POLICY IF EXISTS "Users can view stages from their org pipelines" ON crm_pipeline_stages;
CREATE POLICY "Users can view stages from their org pipelines" ON crm_pipeline_stages
  FOR SELECT USING (pipeline_id IN (SELECT id FROM crm_pipelines WHERE org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text)));

DROP POLICY IF EXISTS "Users can insert stages in their org pipelines" ON crm_pipeline_stages;
CREATE POLICY "Users can insert stages in their org pipelines" ON crm_pipeline_stages
  FOR INSERT WITH CHECK (pipeline_id IN (SELECT id FROM crm_pipelines WHERE org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text)));

DROP POLICY IF EXISTS "Users can update stages from their org pipelines" ON crm_pipeline_stages;
CREATE POLICY "Users can update stages from their org pipelines" ON crm_pipeline_stages
  FOR UPDATE USING (pipeline_id IN (SELECT id FROM crm_pipelines WHERE org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text)));

DROP POLICY IF EXISTS "Users can delete stages from their org pipelines" ON crm_pipeline_stages;
CREATE POLICY "Users can delete stages from their org pipelines" ON crm_pipeline_stages
  FOR DELETE USING (pipeline_id IN (SELECT id FROM crm_pipelines WHERE org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text)));

-- Políticas para crm_negocios
DROP POLICY IF EXISTS "Users can view negocios from their org" ON crm_negocios;
CREATE POLICY "Users can view negocios from their org" ON crm_negocios
  FOR SELECT USING (org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Users can insert negocios in their org" ON crm_negocios;
CREATE POLICY "Users can insert negocios in their org" ON crm_negocios
  FOR INSERT WITH CHECK (org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Users can update negocios from their org" ON crm_negocios;
CREATE POLICY "Users can update negocios from their org" ON crm_negocios
  FOR UPDATE USING (org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text));

DROP POLICY IF EXISTS "Users can delete negocios from their org" ON crm_negocios;
CREATE POLICY "Users can delete negocios from their org" ON crm_negocios
  FOR DELETE USING (org_id::text IN (SELECT org_id::text FROM public.profiles WHERE id::text = auth.uid()::text));

