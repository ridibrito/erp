#!/usr/bin/env node

/**
 * Script para listar todas as tabelas do Supabase
 * Execute: node scripts/list-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllTables() {
  try {
    console.log('🔍 Listando todas as tabelas do Supabase...\n');

    // Query para listar todas as tabelas do schema public
    const { data: tables, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          tableowner,
          hasindexes,
          hasrules,
          hastriggers
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });

    if (error) {
      console.error('❌ Erro ao executar query:', error);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('📭 Nenhuma tabela encontrada no schema public');
      return;
    }

    console.log('📊 TABELAS ENCONTRADAS:\n');
    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ Tabela                          │ Owner    │ Indexes │ Rules │ Triggers │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');

    tables.forEach(table => {
      const name = table.tablename.padEnd(30);
      const owner = (table.tableowner || '').padEnd(8);
      const indexes = table.hasindexes ? '✓' : '✗';
      const rules = table.hasrules ? '✓' : '✗';
      const triggers = table.hastriggers ? '✓' : '✗';
      
      console.log(`│ ${name} │ ${owner} │   ${indexes}    │  ${rules}   │    ${triggers}    │`);
    });

    console.log('└─────────────────────────────────────────────────────────────────────────────┘');
    console.log(`\n📈 Total: ${tables.length} tabelas encontradas`);

    // Agrupar por tipo de tabela
    const tableTypes = {
      'orgs': 'Organizações',
      'fin_': 'Financeiro',
      'cal_': 'Calendário',
      'audit_': 'Auditoria',
      'security_': 'Segurança',
      'data_': 'LGPD',
      'user_': 'Usuários',
      'role_': 'Permissões',
      'tenant_': 'Configurações',
      'oauth_': 'Integrações',
      'api_': 'API'
    };

    console.log('\n📋 TABELAS POR CATEGORIA:\n');
    
    Object.entries(tableTypes).forEach(([prefix, category]) => {
      const categoryTables = tables.filter(t => t.tablename.startsWith(prefix));
      if (categoryTables.length > 0) {
        console.log(`🔹 ${category}:`);
        categoryTables.forEach(table => {
          console.log(`   - ${table.tablename}`);
        });
        console.log('');
      }
    });

    // Tabelas não categorizadas
    const uncategorized = tables.filter(t => 
      !Object.keys(tableTypes).some(prefix => t.tablename.startsWith(prefix))
    );
    
    if (uncategorized.length > 0) {
      console.log('🔹 Outras:');
      uncategorized.forEach(table => {
        console.log(`   - ${table.tablename}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao listar tabelas:', error.message);
  }
}

async function getTableDetails(tableName) {
  try {
    console.log(`\n🔍 Detalhes da tabela: ${tableName}\n`);

    // Query para obter colunas da tabela
    const { data: columns, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      console.error('❌ Erro ao obter colunas:', error);
      return;
    }

    if (!columns || columns.length === 0) {
      console.log('📭 Nenhuma coluna encontrada');
      return;
    }

    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ Coluna                         │ Tipo        │ Null │ Default │ Max Length │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');

    columns.forEach(col => {
      const name = col.column_name.padEnd(30);
      const type = (col.data_type || '').padEnd(11);
      const nullable = col.is_nullable === 'YES' ? '✓' : '✗';
      const defaultVal = (col.column_default || '').substring(0, 8).padEnd(8);
      const maxLength = (col.character_maximum_length || '').toString().padEnd(11);
      
      console.log(`│ ${name} │ ${type} │  ${nullable}  │ ${defaultVal} │ ${maxLength} │`);
    });

    console.log('└─────────────────────────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Erro ao obter detalhes da tabela:', error.message);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Se foi passado um nome de tabela, mostrar detalhes
    await getTableDetails(args[0]);
  } else {
    // Caso contrário, listar todas as tabelas
    await listAllTables();
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { listAllTables, getTableDetails };
