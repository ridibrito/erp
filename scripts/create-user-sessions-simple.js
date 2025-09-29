const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUserSessionsTable() {
  try {
    console.log('Criando tabela user_sessions...');
    
    // Criar tabela
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql_query: `CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        session_token TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        device_info JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    });
    
    if (createError) {
      console.error('Erro ao criar tabela:', createError);
      return;
    }
    
    console.log('✓ Tabela user_sessions criada');
    
    // Habilitar RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql_query: 'ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.error('Erro ao habilitar RLS:', rlsError);
    } else {
      console.log('✓ RLS habilitado');
    }
    
    // Criar política para service_role
    const { error: policyError } = await supabase.rpc('exec_sql', { 
      sql_query: 'CREATE POLICY "Service role full access" ON user_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);'
    });
    
    if (policyError) {
      console.error('Erro ao criar política:', policyError);
    } else {
      console.log('✓ Política RLS criada');
    }
    
    console.log('Tabela user_sessions configurada com sucesso!');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

createUserSessionsTable();
