const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para confirmar usuário manualmente
async function confirmUser(email) {
  try {
    console.log(`🔍 Confirmando usuário: ${email}...`);
    
    // Buscar usuário pelo email
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      console.error('❌ Erro ao buscar usuários:', searchError.message);
      return false;
    }

    const user = users.users.find(u => u.email === email);
    if (!user) {
      console.error('❌ Usuário não encontrado');
      return false;
    }

    // Confirmar usuário
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });

    if (error) {
      console.error('❌ Erro ao confirmar usuário:', error.message);
      return false;
    }

    console.log('✅ Usuário confirmado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao confirmar usuário:', error.message);
    return false;
  }
}

// Função para testar login após confirmação
async function testLoginAfterConfirmation(email, password) {
  try {
    console.log('🔍 Testando login após confirmação...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('❌ Erro no login:', error.message);
      return false;
    }

    if (data.session && data.user) {
      console.log('✅ Login realizado com sucesso!');
      console.log(`  Token: ${data.session.access_token.substring(0, 20)}...`);
      return data.session;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro no teste de login:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Confirmando usuário para teste...');
  
  const testEmail = 'test-1758968787531@gmail.com';
  const testPassword = 'test123456';

  try {
    // 1. Confirmar usuário
    const confirmed = await confirmUser(testEmail);
    if (!confirmed) {
      console.log('❌ Falha ao confirmar usuário');
      process.exit(1);
    }

    console.log('');

    // 2. Testar login
    const session = await testLoginAfterConfirmation(testEmail, testPassword);
    if (!session) {
      console.log('❌ Falha no login após confirmação');
      process.exit(1);
    }

    console.log('');
    console.log('🎉 Usuário confirmado e login funcionando!');
    console.log('✅ Autenticação pronta para desenvolvimento');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);
