const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyTables() {
  console.log('🔍 Verificando tabelas...\n');
  
  try {
    // Método 1: Usar query direta
    console.log('📋 MÉTODO 1 - Query direta:');
    const { data: directQuery, error: directError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (directError) {
      console.error('❌ Erro na query direta:', directError);
    } else {
      console.log('Tabelas encontradas:', directQuery?.length || 0);
      if (directQuery && directQuery.length > 0) {
        directQuery.forEach((table, index) => {
          console.log(`${index + 1}. ${table.table_name}`);
        });
      }
    }

    // Método 2: Usar RPC exec_sql
    console.log('\n📋 MÉTODO 2 - RPC exec_sql:');
    const { data: rpcQuery, error: rpcError } = await supabase.rpc('exec_sql', {
      sql: "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
    });
    
    if (rpcError) {
      console.error('❌ Erro no RPC:', rpcError);
    } else {
      console.log('Resultado RPC:', JSON.stringify(rpcQuery, null, 2));
      if (rpcQuery && rpcQuery.length > 0) {
        console.log('Tabelas encontradas:', rpcQuery.length);
        rpcQuery.forEach((table, index) => {
          console.log(`${index + 1}. ${table.tablename}`);
        });
      }
    }

    // Método 3: Verificar especificamente crm_contacts
    console.log('\n🔍 VERIFICAÇÃO ESPECÍFICA - crm_contacts:');
    const { data: contactsData, error: contactsError } = await supabase
      .from('crm_contacts')
      .select('*')
      .limit(1);
    
    if (contactsError) {
      console.error('❌ Erro ao acessar crm_contacts:', contactsError.message);
      console.error('Código do erro:', contactsError.code);
    } else {
      console.log('✅ Tabela crm_contacts existe e é acessível!');
      console.log('Dados de exemplo:', contactsData);
    }

    // Método 4: Verificar estrutura da tabela
    console.log('\n🏗️ ESTRUTURA DA TABELA crm_contacts:');
    const { data: structureData, error: structureError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError);
    } else {
      console.log('Colunas da tabela crm_contacts:');
      if (structureData && structureData.length > 0) {
        structureData.forEach((col, index) => {
          console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - NULL: ${col.is_nullable}`);
        });
      } else {
        console.log('Nenhuma coluna encontrada ou tabela não existe.');
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

verifyTables();