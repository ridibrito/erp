const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixForeignKey() {
  try {
    console.log('=== CORRIGINDO FOREIGN KEY ===\n');
    
    // 1. Remover a foreign key existente
    console.log('1. Removendo foreign key existente...');
    const dropFKSQL = `
      ALTER TABLE user_sessions 
      DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: dropFKSQL
    });
    
    if (dropError) {
      console.error('Erro ao remover foreign key:', dropError);
    } else {
      console.log('✓ Foreign key removida');
    }
    
    // 2. Recriar a foreign key apontando para a tabela users
    console.log('2. Recriando foreign key...');
    const createFKSQL = `
      ALTER TABLE user_sessions 
      ADD CONSTRAINT user_sessions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: createFKSQL
    });
    
    if (createError) {
      console.error('Erro ao criar foreign key:', createError);
    } else {
      console.log('✓ Foreign key recriada');
    }
    
    // 3. Tentar criar a sessão novamente
    console.log('3. Criando sessão do usuário...');
    const userId = '0f45e1b0-3a0a-467f-bddf-9dde3d4088a1';
    
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        org_id: '00000000-0000-0000-0000-000000000001',
        session_token: 'temp',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        device_info: {
          name: 'Ricardo Albuquerque',
          email: 'financeiro@coruss.com.br',
          phone: '(61) 98355-5195',
          organization: 'Coruss',
          cnpj: '11222333000181',
          is_admin: true
        },
        is_active: true
      })
      .select()
      .single();
    
    if (sessionError) {
      console.error('Erro ao criar sessão:', sessionError);
    } else {
      console.log('✓ Sessão criada com sucesso');
      console.log('Session ID:', session.id);
      console.log('User ID:', session.user_id);
      console.log('Org ID:', session.org_id);
      console.log('Is Admin:', session.device_info?.is_admin);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

fixForeignKey();
