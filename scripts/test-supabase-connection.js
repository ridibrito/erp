const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testando conexão com Supabase...');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Anon Key (primeiros 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Teste 1: Verificar se consegue acessar a API
    console.log('\n🧪 Teste 1: Verificando acesso à API...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message.includes('Invalid API key')) {
      console.error('❌ Chave API inválida!');
      return;
    }
    
    console.log('✅ Conexão com API estabelecida');
    
    // Teste 2: Tentar criar um usuário de teste
    console.log('\n🧪 Teste 2: Testando criação de usuário...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = '123456';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Usuário Teste'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Erro ao criar usuário:', signUpError.message);
      console.error('📋 Detalhes:', signUpError);
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log('🆔 User ID:', signUpData.user?.id);
      
      // Limpar usuário de teste
      if (signUpData.user) {
        console.log('🧹 Limpando usuário de teste...');
        // Nota: Não podemos deletar usuários com anon key, apenas com service role
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testConnection();
