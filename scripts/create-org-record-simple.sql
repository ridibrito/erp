-- Criar registro da organização de forma simples
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela orgs
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orgs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se o registro já existe
SELECT 
    id, 
    name
FROM orgs
WHERE id = '9c2745cc-86e3-40ff-9052-cc9258c86fa0';

-- 3. Criar o registro apenas com as colunas que existem
INSERT INTO orgs (id, name)
VALUES (
    '9c2745cc-86e3-40ff-9052-cc9258c86fa0',
    'ALB SOLUCOES E SERVICOS LTDA'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar se foi criado
SELECT 
    id, 
    name
FROM orgs
WHERE id = '9c2745cc-86e3-40ff-9052-cc9258c86fa0';
