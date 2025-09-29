const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  console.log('🔍 Verificando tabelas no Supabase...\n');
  
  try {
    // 1. Listar todas as tabelas
    console.log('📋 TODAS AS TABELAS:');
    console.log('='.repeat(50));
    const { data: allTables, error: allError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tablename,
          tableowner,
          CASE WHEN hasindexes THEN 'Sim' ELSE 'Não' END as has_indexes,
          CASE WHEN hastriggers THEN 'Sim' ELSE 'Não' END as has_triggers,
          CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as rls_enabled
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });
    
    if (allError) {
      console.error('❌ Erro ao listar tabelas:', allError);
      console.error('Detalhes do erro:', JSON.stringify(allError, null, 2));
    } else {
      console.log('Resultado da consulta:', JSON.stringify(allTables, null, 2));
      if (allTables && allTables.length > 0) {
        console.log(`\n📊 Encontradas ${allTables.length} tabelas:`);
        allTables.forEach((table, index) => {
          console.log(`${index + 1}. ${table.tablename} (RLS: ${table.rls_enabled})`);
        });
        console.table(allTables);
      } else {
        console.log('ℹ️ Nenhuma tabela encontrada no schema public.');
      }
    }

    // 2. Verificar especificamente as tabelas CRM
    console.log('\n🏢 TABELAS CRM:');
    console.log('='.repeat(50));
    const { data: crmTables, error: crmError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tablename,
          CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as rls_enabled
        FROM pg_tables 
        WHERE schemaname = 'public'
          AND tablename LIKE 'crm_%'
        ORDER BY tablename;
      `
    });
    
    if (crmError) {
      console.error('❌ Erro ao listar tabelas CRM:', crmError);
    } else {
      if (crmTables && crmTables.length > 0) {
        console.table(crmTables);
      } else {
        console.log('❌ NENHUMA TABELA CRM ENCONTRADA!');
        console.log('   Isso explica o erro "Could not find the \'address\' column of \'crm_contacts\'"');
        console.log('   As tabelas crm_contacts e crm_accounts não existem no banco.');
      }
    }

    // 3. Verificar se a tabela crm_contacts existe especificamente
    console.log('\n🔍 VERIFICAÇÃO ESPECÍFICA - crm_contacts:');
    console.log('='.repeat(50));
    const { data: contactsCheck, error: contactsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name = 'crm_contacts'
        ) as table_exists;
      `
    });
    
    if (contactsError) {
      console.error('❌ Erro ao verificar crm_contacts:', contactsError);
    } else {
      console.log('Tabela crm_contacts existe:', contactsCheck[0]?.table_exists ? '✅ SIM' : '❌ NÃO');
    }

    // 4. Verificar se a tabela crm_accounts existe especificamente
    console.log('\n🔍 VERIFICAÇÃO ESPECÍFICA - crm_accounts:');
    console.log('='.repeat(50));
    const { data: accountsCheck, error: accountsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name = 'crm_accounts'
        ) as table_exists;
      `
    });
    
    if (accountsError) {
      console.error('❌ Erro ao verificar crm_accounts:', accountsError);
    } else {
      console.log('Tabela crm_accounts existe:', accountsCheck[0]?.table_exists ? '✅ SIM' : '❌ NÃO');
    }

    // 5. Listar colunas da tabela crm_contacts (se existir)
    console.log('\n🏗️ COLUNAS DA TABELA crm_contacts (se existir):');
    console.log('='.repeat(50));
    const { data: contactsColumns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'crm_contacts'
        ORDER BY ordinal_position;
      `
    });
    
    if (columnsError) {
      console.error('❌ Erro ao listar colunas:', columnsError);
    } else {
      if (contactsColumns && contactsColumns.length > 0) {
        console.table(contactsColumns);
      } else {
        console.log('ℹ️ Tabela crm_contacts não existe ou não tem colunas.');
      }
    }

    // 6. Resumo
    console.log('\n📊 RESUMO:');
    console.log('='.repeat(50));
    const totalTables = allTables ? allTables.length : 0;
    const crmTablesCount = crmTables ? crmTables.length : 0;
    
    console.log(`Total de tabelas: ${totalTables}`);
    console.log(`Tabelas CRM: ${crmTablesCount}`);
    console.log(`crm_contacts existe: ${contactsCheck?.[0]?.table_exists ? 'SIM' : 'NÃO'}`);
    console.log(`crm_accounts existe: ${accountsCheck?.[0]?.table_exists ? 'SIM' : 'NÃO'}`);
    
    if (crmTablesCount === 0) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('   As tabelas CRM não existem no banco de dados!');
      console.log('   Por isso o erro: "Could not find the \'address\' column of \'crm_contacts\'"');
      console.log('\n💡 SOLUÇÃO:');
      console.log('   Execute o script: node scripts/create-crm-tables.js');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

checkTables();