const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testando signup com chave anon atualizada...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  try {
    const testEmail = `teste-${Date.now()}@gmail.com`;
    const testPassword = '123456';
    const testName = 'Usuário Teste';
    
    console.log('📧 Email de teste:', testEmail);
    
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
      console.error('❌ Erro ao criar usuário:', error.message);
      console.error('📋 Código:', error.code);
      console.error('📋 Status:', error.status);
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log('🆔 User ID:', data.user?.id);
      console.log('📧 Email:', data.user?.email);
      console.log('📧 Email confirmado:', data.user?.email_confirmed_at ? 'Sim' : 'Não');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSignup();
