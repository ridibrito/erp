-- Verificar políticas atuais
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('crm_accounts', 'crm_contacts')
AND schemaname = 'public'
ORDER BY tablename, policyname;
