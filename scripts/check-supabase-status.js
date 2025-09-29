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

// Função para testar conexão com auth.users
async function testAuthConnection() {
  try {
    console.log('🔍 Testando conexão com auth.users...');
    
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Erro na conexão auth:', error.message);
      return false;
    } else {
      console.log('✅ Conexão auth funcionando!');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro na conexão auth:', error.message);
    return false;
  }
}

// Função para testar RPC
async function testRPC() {
  try {
    console.log('🔍 Testando RPC...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT 1 as test'
    });
    
    if (error) {
      console.log('❌ Erro no RPC:', error.message);
      return false;
    } else {
      console.log('✅ RPC funcionando!');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro no RPC:', error.message);
    return false;
  }
}

// Função para testar tabela auth.users
async function testAuthUsers() {
  try {
    console.log('🔍 Testando tabela auth.users...');
    
    const { data, error } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na tabela auth.users:', error.message);
      return false;
    } else {
      console.log('✅ Tabela auth.users acessível!');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro na tabela auth.users:', error.message);
    return false;
  }
}

// Função para testar tabela public.permissions
async function testPermissionsTable() {
  try {
    console.log('🔍 Testando tabela public.permissions...');
    
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na tabela permissions:', error.message);
      return false;
    } else {
      console.log('✅ Tabela permissions acessível!');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro na tabela permissions:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Verificação de status do Supabase...');
  console.log('📡 URL:', supabaseUrl);
  console.log('🔑 Service Key:', supabaseServiceKey ? 'Configurada' : 'Não configurada');

  try {
    // 1. Testar conexão auth
    const authOk = await testAuthConnection();
    console.log('');

    // 2. Testar RPC
    const rpcOk = await testRPC();
    console.log('');

    // 3. Testar tabela auth.users
    const authUsersOk = await testAuthUsers();
    console.log('');

    // 4. Testar tabela public.permissions
    const permissionsOk = await testPermissionsTable();
    console.log('');

    // Resumo
    console.log('📊 Resumo dos testes:');
    console.log(`  Auth: ${authOk ? '✅' : '❌'}`);
    console.log(`  RPC: ${rpcOk ? '✅' : '❌'}`);
    console.log(`  auth.users: ${authUsersOk ? '✅' : '❌'}`);
    console.log(`  public.permissions: ${permissionsOk ? '✅' : '❌'}`);

    if (permissionsOk) {
      console.log('');
      console.log('🎉 Banco de dados funcionando!');
    } else {
      console.log('');
      console.log('❌ Problemas de permissão detectados');
      console.log('💡 Execute o SQL de correção de permissões novamente');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
main().catch(console.error);
