-- =====================================================
-- SCRIPT SIMPLES PARA CORRIGIR A TABELA crm_contacts
-- =====================================================

-- PROBLEMA: A tabela crm_contacts não tem as colunas necessárias
-- SOLUÇÃO: Adicionar as colunas faltantes

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS FALTANTES
-- Adicionar coluna address (JSONB)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS address JSONB;

-- Adicionar coluna document (TEXT)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS document TEXT;

-- Adicionar coluna document_type (TEXT)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS document_type TEXT;

-- Adicionar coluna status (TEXT)
ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Adicionar coluna notes (TEXT)
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

-- 4. TESTAR INSERÇÃO SIMPLES
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

-- 5. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT * FROM crm_contacts WHERE first_name = 'João';

-- 6. LIMPAR DADOS DE TESTE
DELETE FROM crm_contacts WHERE first_name = 'João';
