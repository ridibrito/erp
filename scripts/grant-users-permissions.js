const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function grantUsersPermissions() {
  try {
    console.log('=== CONCEDENDO PERMISSÕES PARA TABELA USERS ===\n');
    
    const grantSQL = `
      -- Conceder permissões na tabela users
      GRANT ALL PRIVILEGES ON TABLE users TO service_role;
      GRANT ALL PRIVILEGES ON TABLE users TO anon;
      GRANT ALL PRIVILEGES ON TABLE users TO authenticated;
      
      -- Desabilitar RLS temporariamente
      ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    `;
    
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: grantSQL
    });
    
    if (error) {
      console.error('Erro ao conceder permissões:', error);
    } else {
      console.log('✓ Permissões concedidas com sucesso');
      
      // Agora tentar inserir o usuário
      console.log('\n=== INSERINDO USUÁRIO ===');
      const userId = '0f45e1b0-3a0a-467f-bddf-9dde3d4088a1';
      
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'financeiro@coruss.com.br',
          name: 'Ricardo Albuquerque',
          phone: '(61) 98355-5195',
          is_active: true
        })
        .select();
      
      if (insertError) {
        console.error('Erro ao inserir usuário:', insertError);
      } else {
        console.log('✓ Usuário inserido com sucesso');
        console.log('Data:', data);
      }
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

grantUsersPermissions();
