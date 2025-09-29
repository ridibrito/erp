-- =====================================================
-- SCRIPT PARA LISTAR TODAS AS TABELAS DO SUPABASE
-- =====================================================

-- 1. TODAS AS TABELAS DO SCHEMA PUBLIC
SELECT 
    tablename as "Nome da Tabela",
    tableowner as "Proprietário",
    CASE WHEN hasindexes THEN 'Sim' ELSE 'Não' END as "Tem Índices",
    CASE WHEN hastriggers THEN 'Sim' ELSE 'Não' END as "Tem Triggers",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. CONTAR TOTAL DE TABELAS
SELECT 
    COUNT(*) as "Total de Tabelas"
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. LISTAR TODAS AS TABELAS (APENAS NOMES)
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 4. TABELAS COM INFORMAÇÕES DE TAMANHO
SELECT 
    t.table_name,
    pg_size_pretty(pg_total_relation_size(c.oid)) as "Tamanho"
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 5. ESTATÍSTICAS DAS TABELAS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "Inserts",
    n_tup_upd as "Updates", 
    n_tup_del as "Deletes",
    n_live_tup as "Registros Vivos",
    n_dead_tup as "Registros Mortos"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 6. VERIFICAR TABELAS CRM ESPECIFICAMENTE
SELECT 
    tablename as "Tabela CRM",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename LIKE 'crm_%'
ORDER BY tablename;

-- 7. VERIFICAR TABELAS FINANCEIRAS
SELECT 
    tablename as "Tabela Financeira",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename LIKE 'fin_%'
ORDER BY tablename;

-- 8. VERIFICAR TABELAS DE AUDITORIA
SELECT 
    tablename as "Tabela de Auditoria",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
    AND (tablename LIKE '%audit%' OR tablename LIKE '%log%')
ORDER BY tablename;

-- 9. VERIFICAR TABELAS DE USUÁRIOS E PERMISSÕES
SELECT 
    tablename as "Tabela de Usuários/Permissões",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
    AND (tablename LIKE '%user%' OR tablename LIKE '%role%' OR tablename LIKE '%permission%')
ORDER BY tablename;

-- 10. VERIFICAR TABELAS DE ORGANIZAÇÃO
SELECT 
    tablename as "Tabela de Organização",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
    AND (tablename LIKE '%org%' OR tablename LIKE '%tenant%')
ORDER BY tablename;
