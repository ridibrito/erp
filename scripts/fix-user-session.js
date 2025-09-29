const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixUserSession() {
  try {
    console.log('=== CORRIGINDO SESSÃO DO USUÁRIO ===\n');
    
    const userId = '0f45e1b0-3a0a-467f-bddf-9dde3d4088a1';
    
    // 1. Criar tabela users se não existir
    console.log('1. Verificando/criando tabela users...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });
    
    if (createError) {
      console.error('Erro ao criar tabela users:', createError);
      return;
    }
    
    console.log('✓ Tabela users verificada/criada');
    
    // 2. Inserir usuário na tabela users
    console.log('2. Inserindo usuário na tabela users...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'financeiro@coruss.com.br',
        name: 'Ricardo Albuquerque',
        phone: '(61) 98355-5195',
        is_active: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Erro ao inserir usuário:', insertError);
      return;
    }
    
    console.log('✓ Usuário inserido/atualizado na tabela users');
    console.log('User ID:', newUser.id);
    console.log('Email:', newUser.email);
    
    // 3. Criar sessão do usuário
    console.log('3. Criando sessão do usuário...');
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .upsert({
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
      return;
    }
    
    console.log('✓ Sessão criada com sucesso');
    console.log('Session ID:', session.id);
    console.log('User ID:', session.user_id);
    console.log('Org ID:', session.org_id);
    console.log('Is Admin:', session.device_info?.is_admin);
    console.log('Organization:', session.device_info?.organization);
    
    console.log('\n=== CORREÇÃO CONCLUÍDA ===');
    console.log('O usuário agora deve conseguir fazer login normalmente.');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

fixUserSession();
