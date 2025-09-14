const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log('🔄 Testando login com usuário admin...');
    console.log('📧 Email: admin@nexus.com');
    console.log('🔑 Senha: 123456');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@nexus.com',
      password: '123456'
    });

    if (error) {
      console.error('❌ Erro no login:', error);
      console.error('📋 Detalhes:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('🆔 User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);
    console.log('🔑 Access Token:', data.session.access_token.substring(0, 20) + '...');
    console.log('⏰ Expires At:', new Date(data.session.expires_at * 1000));

    // Testar buscar perfil
    console.log('🔄 Buscando perfil do usuário...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log('⚠️  Erro ao buscar perfil:', profileError.message);
      console.log('💡 Isso é normal se a tabela profiles não existir ainda');
    } else {
      console.log('✅ Perfil encontrado:');
      console.log('   👤 Nome:', profile.name);
      console.log('   🏷️  Role:', profile.role);
      console.log('   🏢 Org ID:', profile.org_id);
      console.log('   🔐 Permissões:', profile.permissions?.length || 0);
    }

  } catch (error) {
    console.error('💥 Erro fatal no teste:', error);
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Testando autenticação do Cortus ERP...');
    console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);
    console.log(`🔑 Usando chave anon: ${supabaseAnonKey.substring(0, 20)}...`);
    
    await testLogin();
    
    console.log('🎉 Teste concluído!');
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { testLogin };
