-- =====================================================
-- SCRIPT PARA CORRIGIR CONSTRAINTS DA TABELA crm_contacts
-- =====================================================

-- PROBLEMA: Foreign key constraints impedem inserção de dados de teste
-- SOLUÇÃO: Remover temporariamente as constraints ou usar dados válidos

-- 1. VERIFICAR SE AS TABELAS REFERENCIADAS EXISTEM E TÊM DADOS
SELECT 'orgs' as tabela, COUNT(*) as total FROM orgs;
SELECT 'crm_accounts' as tabela, COUNT(*) as total FROM crm_accounts;

-- 2. VERIFICAR ESTRUTURA FINAL DA TABELA crm_contacts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 3. OPÇÃO 1: REMOVER TEMPORARIAMENTE AS CONSTRAINTS
-- (Execute estas linhas se quiser remover as constraints)
/*
ALTER TABLE crm_contacts DROP CONSTRAINT IF EXISTS crm_contacts_org_id_fkey;
ALTER TABLE crm_contacts DROP CONSTRAINT IF EXISTS crm_contacts_account_id_fkey;
*/

-- 4. OPÇÃO 2: USAR DADOS VÁLIDOS (se as tabelas tiverem dados)
-- Primeiro, vamos ver se existem dados válidos
SELECT id FROM orgs LIMIT 1;
SELECT id FROM crm_accounts LIMIT 1;

-- 5. TESTAR INSERÇÃO COM DADOS VÁLIDOS (substitua pelos IDs reais)
-- (Descomente e substitua pelos IDs reais das suas tabelas)
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
    'SUBSTITUA_PELO_ID_REAL_DA_TABELA_ORGS',
    'SUBSTITUA_PELO_ID_REAL_DA_TABELA_CRM_ACCOUNTS',
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

-- 6. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT * FROM crm_contacts WHERE first_name = 'João';

-- 7. LIMPAR DADOS DE TESTE
DELETE FROM crm_contacts WHERE first_name = 'João';

-- 8. RECRIAR CONSTRAINTS (se foram removidas)
-- (Descomente se necessário)
/*
ALTER TABLE crm_contacts 
ADD CONSTRAINT crm_contacts_org_id_fkey 
FOREIGN KEY (org_id) REFERENCES orgs(id);

ALTER TABLE crm_contacts 
ADD CONSTRAINT crm_contacts_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES crm_accounts(id);
*/
