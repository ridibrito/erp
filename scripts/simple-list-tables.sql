-- =====================================================
-- SCRIPT SIMPLES PARA LISTAR TABELAS NO SUPABASE SQL EDITOR
-- =====================================================

-- Listar todas as tabelas do schema public
SELECT 
    tablename as "Nome da Tabela",
    tableowner as "Proprietário",
    CASE WHEN hasindexes THEN 'Sim' ELSE 'Não' END as "Tem Índices",
    CASE WHEN hastriggers THEN 'Sim' ELSE 'Não' END as "Tem Triggers",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Contar total de tabelas
SELECT 
    COUNT(*) as "Total de Tabelas"
FROM pg_tables 
WHERE schemaname = 'public';

-- Listar tabelas CRM especificamente
SELECT 
    tablename as "Tabela CRM",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename LIKE 'crm_%'
ORDER BY tablename;
