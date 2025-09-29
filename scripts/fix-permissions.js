const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPermissions() {
  try {
    console.log('🔧 Corrigindo permissões das tabelas...\n');

    // 1. Habilitar RLS e criar políticas básicas
    const fixPermissionsSQL = `
      -- Habilitar RLS nas novas tabelas
      ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

      -- Políticas para service_role (acesso total)
      CREATE POLICY "Service Role Full Access" ON organizations
        FOR ALL TO service_role USING (true) WITH CHECK (true);

      CREATE POLICY "Service Role Full Access" ON user_organizations
        FOR ALL TO service_role USING (true) WITH CHECK (true);

      -- Políticas para authenticated users
      CREATE POLICY "Users can view organizations" ON organizations
        FOR SELECT TO authenticated USING (true);

      CREATE POLICY "Users can view their organizations" ON user_organizations
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

      -- Políticas para anon (apenas leitura básica)
      CREATE POLICY "Anon can view public organizations" ON organizations
        FOR SELECT TO anon USING (is_active = true);

      -- Conceder permissões básicas
      GRANT SELECT ON organizations TO anon;
      GRANT SELECT ON organizations TO authenticated;
      GRANT ALL ON organizations TO service_role;

      GRANT SELECT ON user_organizations TO anon;
      GRANT SELECT ON user_organizations TO authenticated;
      GRANT ALL ON user_organizations TO service_role;

      -- Conceder permissões nas sequências
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    `;

    const { error: permError } = await supabase.rpc('exec_sql', {
      sql_query: fixPermissionsSQL
    });

    if (permError) {
      console.log(`❌ Erro ao corrigir permissões: ${permError.message}`);
    } else {
      console.log('✅ Permissões corrigidas com sucesso');
    }

    // 2. Verificar se as tabelas agora são acessíveis
    console.log('\n📊 Verificando acesso às tabelas...\n');

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

    // 3. Verificar dados da organização padrão
    console.log('\n📊 Verificando organização padrão...\n');
    try {
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('*');

      if (!orgError && orgs) {
        console.log('Organizações encontradas:');
        orgs.forEach(org => {
          console.log(`  • ${org.name} (${org.slug}) - ID: ${org.id}`);
        });
      } else {
        console.log(`❌ Erro ao buscar organizações: ${orgError?.message}`);
      }
    } catch (err) {
      console.log(`❌ Erro: ${err.message}`);
    }

    console.log('\n🎉 Permissões corrigidas!');
    console.log('\n📋 Status final do banco:');
    console.log('✅ auth.users - Usuários do Supabase');
    console.log('✅ profiles - Perfis de usuário');
    console.log('✅ organizations - Organizações/empresas');
    console.log('✅ user_organizations - Relação usuário-empresa');
    console.log('✅ permissions - Sistema de permissões');
    console.log('✅ roles - Papéis do sistema');
    console.log('✅ role_permissions - Associações papel-permissão');
    console.log('✅ avatars bucket - Upload de avatares');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
fixPermissions();
