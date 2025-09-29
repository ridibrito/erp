-- Solução definitiva para acesso às tabelas CRM
-- Execute este script no Supabase SQL Editor

-- 1. Remover TODAS as políticas existentes
DO $$ 
DECLARE
    policy_name text;
BEGIN
    -- Remover políticas de crm_accounts
    FOR policy_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'crm_accounts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON crm_accounts', policy_name);
        RAISE NOTICE 'Removida política: % de crm_accounts', policy_name;
    END LOOP;
    
    -- Remover políticas de crm_contacts
    FOR policy_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'crm_contacts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON crm_contacts', policy_name);
        RAISE NOTICE 'Removida política: % de crm_contacts', policy_name;
    END LOOP;
END $$;

-- 2. Desabilitar RLS completamente
ALTER TABLE crm_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts DISABLE ROW LEVEL SECURITY;

-- 3. Garantir permissões para o usuário anônimo
GRANT ALL ON crm_accounts TO anon;
GRANT ALL ON crm_contacts TO anon;
GRANT ALL ON crm_accounts TO authenticated;
GRANT ALL ON crm_contacts TO authenticated;

-- 4. Verificar status final
SELECT 
    'crm_accounts' as tabela,
    rowsecurity as "RLS Enabled",
    (SELECT count(*) FROM pg_policies WHERE tablename = 'crm_accounts' AND schemaname = 'public') as "Políticas Ativas"
FROM pg_tables 
WHERE tablename = 'crm_accounts' AND schemaname = 'public'

UNION ALL

SELECT 
    'crm_contacts' as tabela,
    rowsecurity as "RLS Enabled",
    (SELECT count(*) FROM pg_policies WHERE tablename = 'crm_contacts' AND schemaname = 'public') as "Políticas Ativas"
FROM pg_tables 
WHERE tablename = 'crm_contacts' AND schemaname = 'public';

-- 5. Teste de acesso (opcional - descomente se necessário)
-- INSERT INTO crm_accounts (id, organization_id, name, created_at, updated_at) 
-- VALUES (gen_random_uuid(), '9c2745cc-86e3-40ff-9052-cc9258c86fa0', 'Teste', now(), now())
-- ON CONFLICT DO NOTHING;
