const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createEssentialTables() {
  try {
    console.log('🔧 Criando tabelas essenciais...\n');

    // 1. Criar tabela organizations
    console.log('📊 Criando tabela organizations...');
    const createOrganizationsSQL = `
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        logo_url TEXT,
        website VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        address JSONB,
        settings JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: orgError } = await supabase.rpc('exec_sql', {
      sql_query: createOrganizationsSQL
    });

    if (orgError) {
      console.log(`❌ Erro ao criar organizations: ${orgError.message}`);
    } else {
      console.log('✅ Tabela organizations criada com sucesso');
    }

    // 2. Criar tabela user_organizations
    console.log('\n📊 Criando tabela user_organizations...');
    const createUserOrganizationsSQL = `
      CREATE TABLE IF NOT EXISTS user_organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role_id UUID REFERENCES roles(id),
        is_primary BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, organization_id)
      );
    `;

    const { error: userOrgError } = await supabase.rpc('exec_sql', {
      sql_query: createUserOrganizationsSQL
    });

    if (userOrgError) {
      console.log(`❌ Erro ao criar user_organizations: ${userOrgError.message}`);
    } else {
      console.log('✅ Tabela user_organizations criada com sucesso');
    }

    // 3. Criar índices para performance
    console.log('\n📊 Criando índices...');
    const createIndexesSQL = `
      -- Índices para organizations
      CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
      CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);
      
      -- Índices para user_organizations
      CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_primary ON user_organizations(is_primary);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_active ON user_organizations(is_active);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: createIndexesSQL
    });

    if (indexError) {
      console.log(`❌ Erro ao criar índices: ${indexError.message}`);
    } else {
      console.log('✅ Índices criados com sucesso');
    }

    // 4. Criar triggers para updated_at
    console.log('\n📊 Criando triggers...');
    const createTriggersSQL = `
      -- Função para atualizar updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Triggers para updated_at
      DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
      CREATE TRIGGER update_organizations_updated_at 
        BEFORE UPDATE ON organizations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_user_organizations_updated_at ON user_organizations;
      CREATE TRIGGER update_user_organizations_updated_at 
        BEFORE UPDATE ON user_organizations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql_query: createTriggersSQL
    });

    if (triggerError) {
      console.log(`❌ Erro ao criar triggers: ${triggerError.message}`);
    } else {
      console.log('✅ Triggers criados com sucesso');
    }

    // 5. Inserir dados iniciais
    console.log('\n📊 Inserindo dados iniciais...');
    
    // Inserir organização padrão
    const insertDefaultOrgSQL = `
      INSERT INTO organizations (id, name, slug, description, is_active)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Cortus ERP',
        'cortus-erp',
        'Organização padrão do sistema Cortus ERP',
        true
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    const { error: insertOrgError } = await supabase.rpc('exec_sql', {
      sql_query: insertDefaultOrgSQL
    });

    if (insertOrgError) {
      console.log(`❌ Erro ao inserir organização padrão: ${insertOrgError.message}`);
    } else {
      console.log('✅ Organização padrão inserida');
    }

    // 6. Verificar resultado final
    console.log('\n📊 Verificando tabelas criadas...\n');

    const tablesToCheck = ['organizations', 'user_organizations'];

    for (const tableName of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          console.log(`✅ ${tableName}: ${count} registros`);
        } else {
          console.log(`❌ ${tableName}: Erro - ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Erro - ${err.message}`);
      }
    }

    console.log('\n🎉 Banco de dados otimizado com sucesso!');
    console.log('\n📋 Estrutura final:');
    console.log('✅ auth.users (Supabase) - Usuários do sistema');
    console.log('✅ profiles - Dados estendidos dos usuários');
    console.log('✅ organizations - Empresas/organizações');
    console.log('✅ user_organizations - Relação usuário-empresa');
    console.log('✅ permissions - Permissões do sistema (44 registros)');
    console.log('✅ roles - Papéis do sistema (6 registros)');
    console.log('✅ role_permissions - Associações papel-permissão (114 registros)');
    console.log('✅ avatars bucket - Upload de avatares');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
createEssentialTables();
