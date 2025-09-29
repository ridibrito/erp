-- =====================================================
-- SCRIPT PARA ADICIONAR COLUNAS FALTANTES NA TABELA crm_contacts
-- =====================================================

-- PROBLEMA: As colunas address, document, document_type, status e notes não existem
-- SOLUÇÃO: Adicionar essas colunas

-- 1. ADICIONAR COLUNA address (JSONB)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS address JSONB;

-- 2. ADICIONAR COLUNA document (TEXT)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS document TEXT;

-- 3. ADICIONAR COLUNA document_type (TEXT)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS document_type TEXT;

-- 4. ADICIONAR COLUNA status (TEXT)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 5. ADICIONAR COLUNA notes (TEXT)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. VERIFICAR ESTRUTURA APÓS AS ALTERAÇÕES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 7. TESTAR INSERÇÃO (comentado para não executar acidentalmente)
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
