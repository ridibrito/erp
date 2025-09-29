-- =====================================================
-- SCRIPT PARA CORRIGIR A TABELA crm_contacts
-- =====================================================

-- PROBLEMA IDENTIFICADO:
-- A tabela crm_contacts existe mas não tem as colunas necessárias:
-- - address (JSONB)
-- - document (text)
-- - document_type (text)
-- - position (text) - já existe como 'title'
-- - status (text)
-- - notes (text)

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS FALTANTES
-- Adicionar coluna address (JSONB)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS address JSONB;

-- Adicionar coluna document (text)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS document TEXT;

-- Adicionar coluna document_type (text com constraint)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS document_type TEXT 
CHECK (document_type IN ('cpf', 'cnpj'));

-- Renomear title para position (se necessário)
-- ALTER TABLE crm_contacts RENAME COLUMN title TO position;

-- Adicionar coluna status (text com constraint)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS status TEXT 
DEFAULT 'active' 
CHECK (status IN ('active', 'inactive', 'prospect'));

-- Adicionar coluna notes (text)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. VERIFICAR ESTRUTURA APÓS AS ALTERAÇÕES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_crm_contacts_org_id ON crm_contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_account_id ON crm_contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_document ON crm_contacts(document);

-- 5. HABILITAR RLS (Row Level Security) se não estiver habilitado
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS (remover se existirem e recriar)
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can insert contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can update contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can delete contacts in their org" ON crm_contacts;

-- Política para SELECT
CREATE POLICY "Users can view contacts in their org" ON crm_contacts
    FOR SELECT USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Política para INSERT
CREATE POLICY "Users can insert contacts in their org" ON crm_contacts
    FOR INSERT WITH CHECK (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Política para UPDATE
CREATE POLICY "Users can update contacts in their org" ON crm_contacts
    FOR UPDATE USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Política para DELETE
CREATE POLICY "Users can delete contacts in their org" ON crm_contacts
    FOR DELETE USING (org_id = (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- 7. CRIAR TRIGGER PARA updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger se não existir
DROP TRIGGER IF EXISTS update_crm_contacts_updated_at ON crm_contacts;
CREATE TRIGGER update_crm_contacts_updated_at 
    BEFORE UPDATE ON crm_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. TESTAR INSERÇÃO (comentado para não executar acidentalmente)
/*
INSERT INTO crm_contacts (
    org_id,
    account_id,
    first_name,
    last_name,
    email,
    phone,
    title,
    address,
    document,
    document_type,
    status,
    notes
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'João',
    'Silva',
    'joao@teste.com',
    '(11) 99999-9999',
    'Gerente',
    '{"street": "Rua Teste", "number": "123", "city": "São Paulo", "state": "SP"}',
    '12345678901',
    'cpf',
    'active',
    'Cliente teste'
);
*/
