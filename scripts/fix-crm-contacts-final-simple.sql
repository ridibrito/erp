-- =====================================================
-- SCRIPT FINAL SIMPLES PARA CORRIGIR crm_contacts
-- =====================================================

-- Execute este script no Supabase SQL Editor

-- 1. ADICIONAR COLUNAS FALTANTES
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. VERIFICAR ESTRUTURA FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 3. TESTAR SE AS COLUNAS FORAM ADICIONADAS
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'crm_contacts' 
            AND column_name = 'address'
        ) 
        THEN '✅ address - OK' 
        ELSE '❌ address - FALTANDO' 
    END as status_address,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'crm_contacts' 
            AND column_name = 'document'
        ) 
        THEN '✅ document - OK' 
        ELSE '❌ document - FALTANDO' 
    END as status_document,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'crm_contacts' 
            AND column_name = 'document_type'
        ) 
        THEN '✅ document_type - OK' 
        ELSE '❌ document_type - FALTANDO' 
    END as status_document_type,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'crm_contacts' 
            AND column_name = 'status'
        ) 
        THEN '✅ status - OK' 
        ELSE '❌ status - FALTANDO' 
    END as status_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'crm_contacts' 
            AND column_name = 'notes'
        ) 
        THEN '✅ notes - OK' 
        ELSE '❌ notes - FALTANDO' 
    END as status_notes;
