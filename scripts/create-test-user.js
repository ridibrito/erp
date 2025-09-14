const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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

async function createTestUser() {
  try {
    console.log('🔄 Criando usuário de teste...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@nexus.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        name: 'Administrador Cortus'
      }
    });

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email: admin@nexus.com');
    console.log('🔑 Senha: 123456');
    console.log('🆔 ID:', data.user.id);

    // Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: 'admin@nexus.com',
        name: 'Administrador Cortus',
        role: 'admin',
        org_id: 'default-org',
        permissions: [
          'dashboard.view',
          'users.view', 'users.create', 'users.edit', 'users.delete',
          'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.delete',
          'crm.accounts.view', 'crm.accounts.create', 'crm.accounts.edit', 'crm.accounts.delete',
          'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.deals.delete',
          'finance.invoices.view', 'finance.invoices.create', 'finance.invoices.edit', 'finance.invoices.delete',
          'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
          'reports.view',
          'settings.view', 'settings.edit',
          'system.admin'
        ],
        scopes: ['admin', 'user'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.log('⚠️  Erro ao criar perfil (pode ser normal se a tabela não existir):', profileError.message);
    } else {
      console.log('✅ Perfil do usuário criado!');
    }

  } catch (error) {
    console.error('💥 Erro fatal:', error);
  }
}

// Função para testar login
async function testLogin() {
  try {
    console.log('🔄 Testando login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@nexus.com',
      password: '123456'
    });

    if (error) {
      console.error('❌ Erro no login:', error);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('🆔 User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);

  } catch (error) {
    console.error('💥 Erro no teste de login:', error);
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Configurando usuário de teste do Cortus ERP...');
    console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);
    
    await createTestUser();
    await testLogin();
    
    console.log('🎉 Configuração concluída!');
    console.log('✨ Agora você pode fazer login com:');
    console.log('   📧 Email: admin@nexus.com');
    console.log('   🔑 Senha: 123456');
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createTestUser, testLogin };
