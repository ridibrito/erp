-- SQL para executar diretamente no Supabase
-- Adicionar coluna description se não existir

-- 1. Adicionar colunas à tabela crm_pipelines
ALTER TABLE crm_pipelines 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE crm_pipelines 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- 2. Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_pipelines' 
ORDER BY ordinal_position;

-- 3. Se as tabelas não existirem, criar todas as tabelas necessárias
CREATE TABLE IF NOT EXISTS crm_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 4. Remover RLS temporariamente
ALTER TABLE crm_pipelines DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_negocios DISABLE ROW LEVEL SECURITY;

-- 5. Conceder permissões
GRANT ALL ON crm_pipelines TO anon, authenticated;
GRANT ALL ON crm_pipeline_stages TO anon, authenticated;
GRANT ALL ON crm_negocios TO anon, authenticated;

-- 6. Criar pipeline padrão se não existir
INSERT INTO crm_pipelines (id, name, description, org_id, is_default) 
SELECT 
    gen_random_uuid(),
    'Pipeline de Vendas',
    'Pipeline padrão para gerenciamento de vendas',
    id,
    true
FROM orgs 
WHERE NOT EXISTS (
    SELECT 1 FROM crm_pipelines WHERE org_id = orgs.id
);

-- 7. Criar etapas padrão
INSERT INTO crm_pipeline_stages (pipeline_id, name, color, "order", is_won, is_lost)
SELECT 
    p.id,
    stage_data.name,
    stage_data.color,
    stage_data."order",
    stage_data.is_won,
    stage_data.is_lost
FROM crm_pipelines p
CROSS JOIN (
    VALUES 
        ('Prospecting', '#3B82F6', 1, false, false),
        ('Qualification', '#8B5CF6', 2, false, false),
        ('Proposal', '#F59E0B', 3, false, false),
        ('Negotiation', '#EF4444', 4, false, false),
        ('Closed Won', '#10B981', 5, true, false),
        ('Closed Lost', '#6B7280', 6, false, true)
) AS stage_data(name, color, "order", is_won, is_lost)
WHERE p.is_default = true
AND NOT EXISTS (
    SELECT 1 FROM crm_pipeline_stages WHERE pipeline_id = p.id
);

-- 8. Verificar se tudo foi criado corretamente
SELECT 'Pipelines criados:' as info, COUNT(*) as total FROM crm_pipelines;
SELECT 'Etapas criadas:' as info, COUNT(*) as total FROM crm_pipeline_stages;
