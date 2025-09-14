-- =====================================================
-- CORREÇÃO DA TABELA API_KEYS
-- =====================================================

-- Verificar se a tabela api_keys existe e sua estrutura
DO $$
BEGIN
    -- Se a tabela não existe, criar
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        CREATE TABLE api_keys (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            key_hash VARCHAR(255) UNIQUE NOT NULL,
            scopes TEXT[] NOT NULL,
            expires_at TIMESTAMP,
            last_used_at TIMESTAMP,
            is_active BOOLEAN DEFAULT true,
            created_by UUID,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela api_keys criada com sucesso';
    ELSE
        -- Se a tabela existe, verificar se a coluna key_hash existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'key_hash') THEN
            -- Adicionar a coluna key_hash se não existir
            ALTER TABLE api_keys ADD COLUMN key_hash VARCHAR(255);
            RAISE NOTICE 'Coluna key_hash adicionada à tabela api_keys';
            
            -- Se existir uma coluna 'key' antiga, migrar os dados
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'key') THEN
                UPDATE api_keys SET key_hash = key WHERE key_hash IS NULL;
                ALTER TABLE api_keys DROP COLUMN IF EXISTS key;
                RAISE NOTICE 'Dados migrados da coluna key para key_hash';
            END IF;
            
            -- Adicionar constraint UNIQUE se não existir
            IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_name = 'api_keys' AND constraint_name = 'api_keys_key_hash_key') THEN
                ALTER TABLE api_keys ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);
                RAISE NOTICE 'Constraint UNIQUE adicionada à coluna key_hash';
            END IF;
        END IF;
        
        -- Verificar e adicionar outras colunas se necessário
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'scopes') THEN
            ALTER TABLE api_keys ADD COLUMN scopes TEXT[];
            RAISE NOTICE 'Coluna scopes adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'expires_at') THEN
            ALTER TABLE api_keys ADD COLUMN expires_at TIMESTAMP;
            RAISE NOTICE 'Coluna expires_at adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'last_used_at') THEN
            ALTER TABLE api_keys ADD COLUMN last_used_at TIMESTAMP;
            RAISE NOTICE 'Coluna last_used_at adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'is_active') THEN
            ALTER TABLE api_keys ADD COLUMN is_active BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna is_active adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'created_by') THEN
            ALTER TABLE api_keys ADD COLUMN created_by UUID;
            RAISE NOTICE 'Coluna created_by adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'created_at') THEN
            ALTER TABLE api_keys ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
            RAISE NOTICE 'Coluna created_at adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'updated_at') THEN
            ALTER TABLE api_keys ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
            RAISE NOTICE 'Coluna updated_at adicionada';
        END IF;
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Adicionar trigger para updated_at se não existir
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'api_keys' 
ORDER BY ordinal_position;
