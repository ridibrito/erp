-- =====================================================
-- SCRIPT FINAL PARA CORRIGIR A TABELA crm_contacts
-- =====================================================

-- PROBLEMA: Foreign key constraint violada
-- SOLUÇÃO: Usar um org_id válido ou remover a constraint temporariamente

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

-- 2. VERIFICAR SE A TABELA orgs EXISTE E TEM DADOS
SELECT 
    'orgs' as tabela,
    COUNT(*) as total_registros
FROM orgs;

-- 3. VERIFICAR CONSTRAINTS DA TABELA crm_contacts
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'crm_contacts'
    AND tc.table_schema = 'public';

-- 4. OPÇÃO 1: USAR UM ORG_ID VÁLIDO (se existir)
-- Primeiro, vamos ver se existe algum org_id válido
SELECT id, name FROM orgs LIMIT 5;

-- 5. OPÇÃO 2: REMOVER TEMPORARIAMENTE A CONSTRAINT
-- (Descomente as linhas abaixo se necessário)
/*
-- Remover constraint de foreign key
ALTER TABLE crm_contacts 
DROP CONSTRAINT IF EXISTS crm_contacts_org_id_fkey;

-- Remover constraint de account_id também (se existir)
ALTER TABLE crm_contacts 
DROP CONSTRAINT IF EXISTS crm_contacts_account_id_fkey;
*/

-- 6. TESTAR INSERÇÃO SEM CONSTRAINT (usando org_id fictício)
-- (Descomente para testar)
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

-- 7. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT * FROM crm_contacts WHERE first_name = 'João';

-- 8. LIMPAR DADOS DE TESTE
DELETE FROM crm_contacts WHERE first_name = 'João';

-- 9. RECRIAR CONSTRAINTS (se foram removidas)
-- (Descomente se necessário)
/*
-- Recriar constraint para org_id
ALTER TABLE crm_contacts 
ADD CONSTRAINT crm_contacts_org_id_fkey 
FOREIGN KEY (org_id) REFERENCES orgs(id);

-- Recriar constraint para account_id (se a tabela crm_accounts existir)
ALTER TABLE crm_contacts 
ADD CONSTRAINT crm_contacts_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES crm_accounts(id);
*/
