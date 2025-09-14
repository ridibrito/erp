const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createProfilesTable() {
  try {
    console.log('🔄 Criando tabela profiles...');
    
    // Verificar se a tabela já existe
    const { data: existingTable, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.log('📋 Tabela profiles não existe, criando...');
      
      // Como não podemos executar SQL diretamente, vamos criar um perfil de teste
      // para forçar a criação da tabela
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          org_id: 'default-org',
          permissions: ['dashboard.view'],
          scopes: ['user'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.log('⚠️  Erro ao criar tabela (normal se não tiver permissões):', insertError.message);
        console.log('📝 Você precisa criar a tabela manualmente no Supabase Studio:');
        console.log(`
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'user',
  org_id UUID NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  scopes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
        `);
      } else {
        console.log('✅ Tabela profiles criada!');
        
        // Deletar o registro de teste
        await supabase
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } else {
      console.log('✅ Tabela profiles já existe!');
    }

    // Agora vamos criar o perfil do usuário admin
    console.log('🔄 Criando perfil do usuário admin...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: '5425d8b2-a27f-4406-b1f7-8b12e7b2d2ed',
        email: 'admin@nexus.com',
        name: 'Administrador Nexus',
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
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('❌ Erro ao criar perfil do admin:', profileError);
    } else {
      console.log('✅ Perfil do admin criado com sucesso!');
    }

  } catch (error) {
    console.error('💥 Erro ao criar tabela profiles:', error);
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Configurando tabela profiles...');
    console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);
    
    await createProfilesTable();
    
    console.log('🎉 Configuração concluída!');
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createProfilesTable };
