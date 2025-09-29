#!/usr/bin/env node

/**
 * Script simples para listar tabelas do Supabase usando API REST
 * Execute: node scripts/simple-list-tables.js
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

async function listTables() {
  try {
    console.log('🔍 Listando tabelas do Supabase...\n');

    // Tentar acessar algumas tabelas conhecidas para verificar se existem
    const knownTables = [
      'orgs',
      'permissions', 
      'roles',
      'user_permissions',
      'audit_logs',
      'security_logs',
      'fin_chart_of_accounts',
      'fin_invoices',
      'fin_payments',
      'cal_calendars',
      'cal_events'
    ];

    const existingTables = [];
    const missingTables = [];

    console.log('📊 Verificando tabelas conhecidas:\n');

    for (const tableName of knownTables) {
      try {
        // Tentar fazer uma query simples para verificar se a tabela existe
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          // Tabela não existe
          missingTables.push(tableName);
          console.log(`❌ ${tableName} - Não encontrada`);
        } else if (error) {
          // Outro tipo de erro (pode ser permissão, mas a tabela existe)
          existingTables.push(tableName);
          console.log(`✅ ${tableName} - Existe (erro de permissão: ${error.message})`);
        } else {
          // Tabela existe e acessível
          existingTables.push(tableName);
          console.log(`✅ ${tableName} - Existe e acessível`);
        }
      } catch (err) {
        console.log(`⚠️  ${tableName} - Erro ao verificar: ${err.message}`);
      }
    }

    console.log('\n📈 RESUMO:');
    console.log(`✅ Tabelas encontradas: ${existingTables.length}`);
    console.log(`❌ Tabelas não encontradas: ${missingTables.length}`);

    if (existingTables.length > 0) {
      console.log('\n✅ TABELAS EXISTENTES:');
      existingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
    }

    if (missingTables.length > 0) {
      console.log('\n❌ TABELAS NÃO ENCONTRADAS:');
      missingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
    }

    // Verificar se há tabela de clientes
    console.log('\n🔍 Verificando tabela de clientes...');
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        console.log('❌ Tabela "clients" não existe - precisa ser criada');
      } else {
        console.log('✅ Tabela "clients" existe');
      }
    } catch (err) {
      console.log(`⚠️  Erro ao verificar tabela clients: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
listTables().catch(console.error);
