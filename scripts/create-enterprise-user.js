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

async function createEnterpriseUser() {
  try {
    console.log('🏢 Criando usuário empresarial...');
    
    // Dados da empresa (exemplo com CNPJ real)
    const companyData = {
      name: 'Tech Solutions LTDA',
      cnpj: '11.222.333/0001-81', // CNPJ de exemplo
      email: 'admin@techsolutions.com',
      password: 'TechSolutions2024!',
      user: {
        name: 'João Silva',
        email: 'joao@techsolutions.com',
        password: 'JoaoSilva2024!'
      }
    };
    
    console.log('📋 Dados da empresa:');
    console.log(`   🏢 Empresa: ${companyData.name}`);
    console.log(`   📄 CNPJ: ${companyData.cnpj}`);
    console.log(`   📧 Email empresa: ${companyData.email}`);
    console.log(`   👤 Usuário: ${companyData.user.name}`);
    console.log(`   📧 Email usuário: ${companyData.user.email}`);
    
    // Criar usuário principal da empresa
    const { data: companyUser, error: companyError } = await supabase.auth.admin.createUser({
      email: companyData.email,
      password: companyData.password,
      email_confirm: true,
      user_metadata: {
        name: companyData.name,
        type: 'company',
        cnpj: companyData.cnpj
      }
    });

    if (companyError) {
      console.error('❌ Erro ao criar usuário da empresa:', companyError);
      return;
    }

    console.log('✅ Usuário da empresa criado!');
    console.log('🆔 Company User ID:', companyUser.user.id);

    // Criar usuário individual
    const { data: individualUser, error: individualError } = await supabase.auth.admin.createUser({
      email: companyData.user.email,
      password: companyData.user.password,
      email_confirm: true,
      user_metadata: {
        name: companyData.user.name,
        type: 'individual',
        company_id: companyUser.user.id
      }
    });

    if (individualError) {
      console.error('❌ Erro ao criar usuário individual:', individualError);
      return;
    }

    console.log('✅ Usuário individual criado!');
    console.log('🆔 Individual User ID:', individualUser.user.id);

    // Criar perfis dos usuários
    const profiles = [
      {
        id: companyUser.user.id,
        email: companyData.email,
        name: companyData.name,
        role: 'admin',
        org_id: companyUser.user.id, // Usar o ID da empresa como org_id
        company_cnpj: companyData.cnpj,
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
        scopes: ['admin', 'user', 'company'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: individualUser.user.id,
        email: companyData.user.email,
        name: companyData.user.name,
        role: 'manager',
        org_id: companyUser.user.id, // Mesmo org_id da empresa
        company_cnpj: companyData.cnpj,
        permissions: [
          'dashboard.view',
          'crm.leads.view', 'crm.leads.create', 'crm.leads.edit',
          'crm.accounts.view', 'crm.accounts.create', 'crm.accounts.edit',
          'crm.deals.view', 'crm.deals.create', 'crm.deals.edit',
          'finance.invoices.view', 'finance.invoices.create',
          'projects.view', 'projects.create', 'projects.edit',
          'reports.view'
        ],
        scopes: ['user', 'manager'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const profile of profiles) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });
      
      if (profileError) {
        console.log('⚠️  Erro ao criar perfil (pode ser normal se a tabela não existir):', profileError.message);
      } else {
        console.log(`✅ Perfil criado para ${profile.name}!`);
      }
    }

    console.log('🎉 Usuários empresariais criados com sucesso!');
    console.log('✨ Credenciais de acesso:');
    console.log('');
    console.log('🏢 CONTA DA EMPRESA:');
    console.log(`   📧 Email: ${companyData.email}`);
    console.log(`   🔑 Senha: ${companyData.password}`);
    console.log(`   👤 Nome: ${companyData.name}`);
    console.log(`   📄 CNPJ: ${companyData.cnpj}`);
    console.log('');
    console.log('👤 CONTA DO USUÁRIO:');
    console.log(`   📧 Email: ${companyData.user.email}`);
    console.log(`   🔑 Senha: ${companyData.user.password}`);
    console.log(`   👤 Nome: ${companyData.user.name}`);
    console.log(`   🏢 Empresa: ${companyData.name}`);
    
  } catch (error) {
    console.error('💥 Erro ao criar usuários empresariais:', error);
  }
}

// Função para testar login
async function testLogin() {
  try {
    console.log('🔄 Testando login com usuário empresarial...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@techsolutions.com',
      password: 'TechSolutions2024!'
    });

    if (error) {
      console.error('❌ Erro no login:', error);
      return;
    }

    console.log('✅ Login empresarial realizado com sucesso!');
    console.log('🆔 User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);
    console.log('🏢 Empresa:', data.user.user_metadata?.name);

  } catch (error) {
    console.error('💥 Erro no teste de login:', error);
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Configurando usuários empresariais do Cortus ERP...');
    console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);
    
    await createEnterpriseUser();
    await testLogin();
    
    console.log('🎉 Configuração empresarial concluída!');
    console.log('✨ Agora você pode fazer login com as credenciais acima!');
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createEnterpriseUser, testLogin };
