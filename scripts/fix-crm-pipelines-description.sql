-- Adicionar coluna description se não existir
DO $$ 
BEGIN
    -- Verificar se a coluna description existe na tabela crm_pipelines
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'crm_pipelines' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE crm_pipelines ADD COLUMN description TEXT;
        RAISE NOTICE 'Coluna description adicionada à tabela crm_pipelines';
    ELSE
        RAISE NOTICE 'Coluna description já existe na tabela crm_pipelines';
    END IF;
END $$;

-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_pipelines' 
ORDER BY ordinal_position;
