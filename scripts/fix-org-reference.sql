-- Verificar e corrigir referência da tabela orgs
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela orgs existe
SELECT 
    schemaname, 
    tablename, 
    tableowner
FROM pg_tables 
WHERE tablename = 'orgs'
AND schemaname = 'public';

-- 2. Verificar estrutura da tabela orgs
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orgs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar registros na tabela orgs
SELECT 
    id, 
    name, 
    created_at
FROM orgs
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se o org_id específico existe
SELECT 
    id, 
    name, 
    created_at
FROM orgs
WHERE id = '9c2745cc-86e3-40ff-9052-cc9258c86fa0';

-- 5. Se não existir, criar o registro da organização (sem updated_at)
INSERT INTO orgs (id, name, created_at)
VALUES (
    '9c2745cc-86e3-40ff-9052-cc9258c86fa0',
    'ALB SOLUCOES E SERVICOS LTDA',
    now()
)
ON CONFLICT (id) DO NOTHING;

-- 6. Verificar se foi criado
SELECT 
    id, 
    name, 
    created_at
FROM orgs
WHERE id = '9c2745cc-86e3-40ff-9052-cc9258c86fa0';
