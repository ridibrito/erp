-- Criar tabelas para sistema de pipelines de negócios

-- Tabela de pipelines
CREATE TABLE IF NOT EXISTS crm_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de etapas dos pipelines
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280', -- Cor em hex
    "order" INTEGER NOT NULL,
    is_won BOOLEAN DEFAULT FALSE,
    is_lost BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de negócios
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_crm_pipelines_org_id ON crm_pipelines(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_pipeline_id ON crm_pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_order ON crm_pipeline_stages(pipeline_id, "order");
CREATE INDEX IF NOT EXISTS idx_crm_negocios_org_id ON crm_negocios(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_pipeline_id ON crm_negocios(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_stage_id ON crm_negocios(stage_id);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_status ON crm_negocios(status);
CREATE INDEX IF NOT EXISTS idx_crm_negocios_created_at ON crm_negocios(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_crm_pipelines_updated_at 
    BEFORE UPDATE ON crm_pipelines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_pipeline_stages_updated_at 
    BEFORE UPDATE ON crm_pipeline_stages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_negocios_updated_at 
    BEFORE UPDATE ON crm_negocios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Remover RLS temporariamente para facilitar desenvolvimento
ALTER TABLE crm_pipelines DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_negocios DISABLE ROW LEVEL SECURITY;

-- Conceder permissões
GRANT ALL ON crm_pipelines TO anon, authenticated;
GRANT ALL ON crm_pipeline_stages TO anon, authenticated;
GRANT ALL ON crm_negocios TO anon, authenticated;

-- Inserir pipeline padrão
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

-- Inserir etapas padrão para o pipeline
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

-- Comentários nas tabelas
COMMENT ON TABLE crm_pipelines IS 'Pipelines de vendas customizáveis por organização';
COMMENT ON TABLE crm_pipeline_stages IS 'Etapas dos pipelines de vendas';
COMMENT ON TABLE crm_negocios IS 'Negócios e oportunidades de venda';

COMMENT ON COLUMN crm_pipelines.is_default IS 'Indica se é o pipeline padrão da organização';
COMMENT ON COLUMN crm_pipeline_stages.color IS 'Cor da etapa em formato hexadecimal';
COMMENT ON COLUMN crm_pipeline_stages."order" IS 'Ordem de exibição da etapa no pipeline';
COMMENT ON COLUMN crm_pipeline_stages.is_won IS 'Indica se esta etapa representa um negócio ganho';
COMMENT ON COLUMN crm_pipeline_stages.is_lost IS 'Indica se esta etapa representa um negócio perdido';
COMMENT ON COLUMN crm_negocios.probability IS 'Probabilidade de fechamento (0-100%)';
COMMENT ON COLUMN crm_negocios.value IS 'Valor do negócio em reais';
COMMENT ON COLUMN crm_negocios.status IS 'Status atual do negócio';
COMMENT ON COLUMN crm_negocios.next_contact IS 'Data do próximo contato';
COMMENT ON COLUMN crm_negocios.contact_id IS 'ID do contato relacionado (opcional)';
COMMENT ON COLUMN crm_negocios.company_id IS 'ID da empresa relacionada (opcional)';
