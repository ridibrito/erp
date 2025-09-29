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

// Função para testar registro de usuário
async function testSignUp() {
  try {
    console.log('🔍 Testando registro de usuário...');
    
    const testEmail = `test-${Date.now()}@gmail.com`;
    const testPassword = 'test123456';
    const testName = 'Usuário Teste';

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName
        }
      }
    });

    if (error) {
      console.log('❌ Erro no registro:', error.message);
      return false;
    }

    if (data.user) {
      console.log('✅ Usuário registrado com sucesso!');
      console.log(`  ID: ${data.user.id}`);
      console.log(`  Email: ${data.user.email}`);
      console.log(`  Nome: ${data.user.user_metadata?.name}`);
      return data.user;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro no teste de registro:', error.message);
    return false;
  }
}

// Função para testar login
async function testSignIn(email, password) {
  try {
    console.log('🔍 Testando login...');
    
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
      console.log(`  Expira em: ${new Date(data.session.expires_at * 1000)}`);
      return data.session;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro no teste de login:', error.message);
    return false;
  }
}

// Função para testar logout
async function testSignOut() {
  try {
    console.log('🔍 Testando logout...');
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log('❌ Erro no logout:', error.message);
      return false;
    }

    console.log('✅ Logout realizado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de logout:', error.message);
    return false;
  }
}

// Função para testar obtenção de usuário atual
async function testGetCurrentUser() {
  try {
    console.log('🔍 Testando obtenção de usuário atual...');
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('❌ Erro ao obter usuário:', error.message);
      return false;
    }

    if (user) {
      console.log('✅ Usuário atual obtido com sucesso!');
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Nome: ${user.user_metadata?.name}`);
      return user;
    } else {
      console.log('ℹ️  Nenhum usuário autenticado');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro no teste de obtenção de usuário:', error.message);
    return false;
  }
}

// Função para testar renovação de sessão
async function testRefreshSession() {
  try {
    console.log('🔍 Testando renovação de sessão...');
    
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.log('❌ Erro na renovação:', error.message);
      return false;
    }

    if (data.session) {
      console.log('✅ Sessão renovada com sucesso!');
      console.log(`  Novo token: ${data.session.access_token.substring(0, 20)}...`);
      return data.session;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro no teste de renovação:', error.message);
    return false;
  }
}

// Função para testar permissões
async function testPermissions() {
  try {
    console.log('🔍 Testando permissões...');
    
    // Testar acesso às tabelas de permissões
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('name, module, action, resource')
      .limit(5);

    if (permError) {
      console.log('❌ Erro ao buscar permissões:', permError.message);
      return false;
    }

    console.log('✅ Permissões acessíveis:');
    permissions?.forEach(perm => {
      console.log(`  - ${perm.name} (${perm.module}.${perm.action})`);
    });

    return true;
  } catch (error) {
    console.error('❌ Erro no teste de permissões:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Teste de autenticação do Cortus ERP...');
  console.log('📡 Conectando ao Supabase:', supabaseUrl);

  try {
    // 1. Testar registro
    const user = await testSignUp();
    if (!user) {
      console.log('❌ Teste de registro falhou');
      process.exit(1);
    }

    console.log('');

    // 2. Testar login
    const session = await testSignIn(user.email, 'test123456');
    if (!session) {
      console.log('❌ Teste de login falhou');
      process.exit(1);
    }

    console.log('');

    // 3. Testar obtenção de usuário atual
    const currentUser = await testGetCurrentUser();
    if (!currentUser) {
      console.log('❌ Teste de obtenção de usuário falhou');
      process.exit(1);
    }

    console.log('');

    // 4. Testar renovação de sessão
    const refreshedSession = await testRefreshSession();
    if (!refreshedSession) {
      console.log('❌ Teste de renovação falhou');
      process.exit(1);
    }

    console.log('');

    // 5. Testar permissões
    const permissionsOk = await testPermissions();
    if (!permissionsOk) {
      console.log('❌ Teste de permissões falhou');
      process.exit(1);
    }

    console.log('');

    // 6. Testar logout
    const logoutOk = await testSignOut();
    if (!logoutOk) {
      console.log('❌ Teste de logout falhou');
      process.exit(1);
    }

    console.log('');
    console.log('🎉 Todos os testes de autenticação passaram!');
    console.log('✅ Sistema de autenticação funcionando corretamente');
    console.log('🔗 Pronto para uso em desenvolvimento');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);
