-- Script completo para criar todas as tabelas de pipelines
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar tabela crm_pipelines se não existir
CREATE TABLE IF NOT EXISTS crm_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar colunas se não existirem
ALTER TABLE crm_pipelines 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE crm_pipelines 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- 3. Criar tabela crm_pipeline_stages se não existir
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    "order" INTEGER NOT NULL,
    is_won BOOLEAN DEFAULT FALSE,
    is_lost BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela crm_negocios se não existir
CREATE TABLE IF NOT EXISTS crm_negocios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    value DECIMAL(15,2) NOT NULL DEFAULT 0,
    probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    stage_id UUID NOT NULL REFERENCES crm_pipeline_stages(id) ON DELETE RESTRICT,
    pipeline_id UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    next_contact DATE,
    responsible VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost')),
    description TEXT,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES crm_accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Remover RLS temporariamente
ALTER TABLE crm_pipelines DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_negocios DISABLE ROW LEVEL SECURITY;

-- 6. Conceder permissões
GRANT ALL ON crm_pipelines TO anon, authenticated;
GRANT ALL ON crm_pipeline_stages TO anon, authenticated;
GRANT ALL ON crm_negocios TO anon, authenticated;

-- 7. Verificar estrutura das tabelas
SELECT 'crm_pipelines' as tabela, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_pipelines' 
ORDER BY ordinal_position;

SELECT 'crm_pipeline_stages' as tabela, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_pipeline_stages' 
ORDER BY ordinal_position;

SELECT 'crm_negocios' as tabela, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_negocios' 
ORDER BY ordinal_position;
