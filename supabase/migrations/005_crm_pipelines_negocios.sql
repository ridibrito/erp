-- =====================================================
-- NEXUS ERP - CRM: PIPELINES E NEGÓCIOS
-- Migração: 005_crm_pipelines_negocios.sql
-- Data: 2025-09-30
-- =====================================================

-- Remover tabelas existentes se necessário (apenas para desenvolvimento)
-- CUIDADO: Isso irá deletar os dados existentes
-- DROP TABLE IF EXISTS crm_negocios CASCADE;
-- DROP TABLE IF EXISTS crm_contacts CASCADE;
-- DROP TABLE IF EXISTS crm_accounts CASCADE;
-- DROP TABLE IF EXISTS crm_pipeline_stages CASCADE;
-- DROP TABLE IF EXISTS crm_pipelines CASCADE;

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
-- 2. CONTAS E CONTATOS
-- =====================================================

-- Tabela de empresas/contas
CREATE TABLE IF NOT EXISTS crm_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  fantasy_name VARCHAR(255),
  cnpj VARCHAR(18),
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'Brasil',
  industry VARCHAR(100),
  employee_count INTEGER,
  annual_revenue DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  account_id UUID REFERENCES crm_accounts(id) ON DELETE SET NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  position VARCHAR(100),
  department VARCHAR(100),
  birthday DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'Brasil',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. NEGÓCIOS/OPORTUNIDADES
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
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm_accounts(id) ON DELETE SET NULL,
  responsible VARCHAR(255),
  next_contact TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. ÍNDICES
-- =====================================================

-- Índices para crm_pipelines
CREATE INDEX IF NOT EXISTS idx_crm_pipelines_org_id ON crm_pipelines(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipelines_is_default ON crm_pipelines(org_id, is_default);

-- Índices para crm_pipeline_stages
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_pipeline_id ON crm_pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_order ON crm_pipeline_stages(pipeline_id, "order");

-- Índices para crm_accounts
CREATE INDEX IF NOT EXISTS idx_crm_accounts_org_id ON crm_accounts(org_id);
-- CREATE INDEX IF NOT EXISTS idx_crm_accounts_cnpj ON crm_accounts(cnpj); -- Descomentado se a coluna existir
CREATE INDEX IF NOT EXISTS idx_crm_accounts_status ON crm_accounts(org_id, status);

-- Índices para crm_contacts
CREATE INDEX IF NOT EXISTS idx_crm_contacts_org_id ON crm_contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_account_id ON crm_contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(org_id, status);

-- Índices para crm_negocios
CREATE INDEX IF NOT EXISTS idx_crm_negocios_org_id ON crm_negocios(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_pipeline_id ON crm_negocios(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_stage_id ON crm_negocios(stage_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_contact_id ON crm_negocios(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_company_id ON crm_negocios(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_status ON crm_negocios(org_id, status);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_negocios ENABLE ROW LEVEL SECURITY;

-- Políticas para crm_pipelines
CREATE POLICY "Users can view pipelines from their org" ON crm_pipelines
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert pipelines in their org" ON crm_pipelines
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update pipelines from their org" ON crm_pipelines
  FOR UPDATE USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete pipelines from their org" ON crm_pipelines
  FOR DELETE USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Políticas para crm_pipeline_stages
CREATE POLICY "Users can view stages from their org pipelines" ON crm_pipeline_stages
  FOR SELECT USING (pipeline_id IN (SELECT id FROM crm_pipelines WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can insert stages in their org pipelines" ON crm_pipeline_stages
  FOR INSERT WITH CHECK (pipeline_id IN (SELECT id FROM crm_pipelines WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can update stages from their org pipelines" ON crm_pipeline_stages
  FOR UPDATE USING (pipeline_id IN (SELECT id FROM crm_pipelines WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can delete stages from their org pipelines" ON crm_pipeline_stages
  FOR DELETE USING (pipeline_id IN (SELECT id FROM crm_pipelines WHERE org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid())));

-- Políticas para crm_accounts
CREATE POLICY "Users can view accounts from their org" ON crm_accounts
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert accounts in their org" ON crm_accounts
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update accounts from their org" ON crm_accounts
  FOR UPDATE USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete accounts from their org" ON crm_accounts
  FOR DELETE USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Políticas para crm_contacts
CREATE POLICY "Users can view contacts from their org" ON crm_contacts
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert contacts in their org" ON crm_contacts
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update contacts from their org" ON crm_contacts
  FOR UPDATE USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete contacts from their org" ON crm_contacts
  FOR DELETE USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Políticas para crm_negocios
CREATE POLICY "Users can view negocios from their org" ON crm_negocios
  FOR SELECT USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert negocios in their org" ON crm_negocios
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update negocios from their org" ON crm_negocios
  FOR UPDATE USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete negocios from their org" ON crm_negocios
  FOR DELETE USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

