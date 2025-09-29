-- =====================================================
-- SCRIPT PARA LISTAR TODAS AS TABELAS DO SUPABASE
-- =====================================================

-- 1. Listar todas as tabelas do schema public
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Listar tabelas com informações mais detalhadas
SELECT 
    t.table_schema,
    t.table_name,
    t.table_type,
    obj_description(c.oid) as table_comment,
    pg_size_pretty(pg_total_relation_size(c.oid)) as table_size
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 3. Listar tabelas com contagem de registros
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 4. Listar tabelas com suas colunas
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 5. Listar tabelas com chaves estrangeiras
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 6. Listar tabelas com índices
SELECT
    t.table_name,
    i.indexname,
    i.indexdef,
    pg_size_pretty(pg_relation_size(i.indexrelid)) as index_size
FROM information_schema.tables t
LEFT JOIN pg_indexes i ON t.table_name = i.tablename
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, i.indexname;

-- 7. Listar tabelas com políticas RLS (Row Level Security)
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = pg_tables.schemaname AND tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 8. Resumo geral das tabelas
SELECT 
    'Total de tabelas' as metric,
    count(*) as value
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Tabelas com RLS habilitado' as metric,
    count(*) as value
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true

UNION ALL

SELECT 
    'Tabelas com triggers' as metric,
    count(*) as value
FROM pg_tables 
WHERE schemaname = 'public' AND hastriggers = true

UNION ALL

SELECT 
    'Tabelas com índices' as metric,
    count(*) as value
FROM pg_tables 
WHERE schemaname = 'public' AND hasindexes = true;