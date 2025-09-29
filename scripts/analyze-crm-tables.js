#!/usr/bin/env node

/**
 * Script para analisar estrutura das tabelas CRM
 * Execute: node scripts/analyze-crm-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeCRMTables() {
  try {
    console.log('🔍 Analisando estrutura das tabelas CRM...\n');

    // 1. Verificar se as tabelas existem
    console.log('📊 VERIFICAÇÃO DE EXISTÊNCIA:\n');
    
    const tables = ['crm_accounts', 'crm_contacts'];
    const tableStatus = {};

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          tableStatus[tableName] = { exists: false, error: 'Tabela não existe' };
          console.log(`❌ ${tableName} - Não existe`);
        } else if (error) {
          tableStatus[tableName] = { exists: true, error: error.message };
          console.log(`✅ ${tableName} - Existe (erro de acesso: ${error.message})`);
        } else {
          tableStatus[tableName] = { exists: true, error: null };
          console.log(`✅ ${tableName} - Existe e acessível`);
        }
      } catch (err) {
        tableStatus[tableName] = { exists: false, error: err.message };
        console.log(`⚠️  ${tableName} - Erro: ${err.message}`);
      }
    }

    // 2. Tentar obter estrutura das tabelas (se existirem)
    console.log('\n📋 ESTRUTURA DAS TABELAS:\n');

    for (const tableName of tables) {
      if (tableStatus[tableName].exists) {
        console.log(`🔹 ${tableName.toUpperCase()}:`);
        
        try {
          // Tentar obter uma amostra de dados para inferir a estrutura
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (error) {
            console.log(`   ⚠️  Erro ao acessar dados: ${error.message}`);
          } else if (data && data.length > 0) {
            console.log('   📊 Campos encontrados:');
            Object.keys(data[0]).forEach(field => {
              const value = data[0][field];
              const type = typeof value;
              const nullable = value === null ? ' (nullable)' : '';
              console.log(`      - ${field}: ${type}${nullable}`);
            });
          } else {
            console.log('   📭 Tabela vazia');
          }
        } catch (err) {
          console.log(`   ❌ Erro ao analisar: ${err.message}`);
        }
        console.log('');
      }
    }

    // 3. Verificar relacionamentos
    console.log('🔗 ANÁLISE DE RELACIONAMENTOS:\n');
    
    if (tableStatus.crm_accounts.exists && tableStatus.crm_contacts.exists) {
      try {
        // Verificar se crm_contacts tem campo account_id
        const { data: contacts, error: contactsError } = await supabase
          .from('crm_contacts')
          .select('*')
          .limit(1);

        if (!contactsError && contacts && contacts.length > 0) {
          const hasAccountId = 'account_id' in contacts[0];
          console.log(`📌 crm_contacts tem campo account_id: ${hasAccountId ? '✅ Sim' : '❌ Não'}`);
          
          if (hasAccountId) {
            console.log('   🔗 Relacionamento: crm_contacts.account_id → crm_accounts.id');
          }
        }
      } catch (err) {
        console.log(`⚠️  Erro ao verificar relacionamentos: ${err.message}`);
      }
    }

    // 4. Sugestões de implementação
    console.log('\n💡 SUGESTÕES DE IMPLEMENTAÇÃO:\n');
    
    if (!tableStatus.crm_accounts.exists && !tableStatus.crm_contacts.exists) {
      console.log('🔧 Ambas as tabelas não existem. Sugestões:');
      console.log('   1. Criar migração para crm_accounts (empresas)');
      console.log('   2. Criar migração para crm_contacts (pessoas)');
      console.log('   3. Estabelecer relacionamento: crm_contacts.account_id → crm_accounts.id');
    } else if (tableStatus.crm_accounts.exists && !tableStatus.crm_contacts.exists) {
      console.log('🔧 crm_accounts existe, mas crm_contacts não. Sugestões:');
      console.log('   1. Criar migração para crm_contacts');
      console.log('   2. Estabelecer relacionamento com crm_accounts existente');
    } else if (!tableStatus.crm_accounts.exists && tableStatus.crm_contacts.exists) {
      console.log('🔧 crm_contacts existe, mas crm_accounts não. Sugestões:');
      console.log('   1. Criar migração para crm_accounts');
      console.log('   2. Atualizar crm_contacts para referenciar crm_accounts');
    } else {
      console.log('✅ Ambas as tabelas existem!');
      console.log('   🔄 Refatorar módulo de clientes para usar crm_contacts');
      console.log('   🏢 Usar crm_accounts para empresas');
      console.log('   👤 Usar crm_contacts para pessoas (com/sem empresa)');
    }

    // 5. Estrutura proposta
    console.log('\n📐 ESTRUTURA PROPOSTA:\n');
    console.log('🏢 crm_accounts (Empresas):');
    console.log('   - id (UUID, PK)');
    console.log('   - name (VARCHAR) - Nome da empresa');
    console.log('   - fantasy_name (VARCHAR) - Nome fantasia');
    console.log('   - document (VARCHAR) - CNPJ');
    console.log('   - email (VARCHAR) - Email da empresa');
    console.log('   - phone (VARCHAR) - Telefone da empresa');
    console.log('   - address (JSONB) - Endereço completo');
    console.log('   - status (VARCHAR) - active, inactive, prospect');
    console.log('   - org_id (UUID, FK) - Organização do usuário');
    console.log('   - created_at, updated_at (TIMESTAMP)');
    
    console.log('\n👤 crm_contacts (Pessoas):');
    console.log('   - id (UUID, PK)');
    console.log('   - first_name (VARCHAR) - Nome');
    console.log('   - last_name (VARCHAR) - Sobrenome');
    console.log('   - email (VARCHAR) - Email pessoal');
    console.log('   - phone (VARCHAR) - Telefone pessoal');
    console.log('   - document (VARCHAR) - CPF');
    console.log('   - position (VARCHAR) - Cargo na empresa');
    console.log('   - account_id (UUID, FK) - Empresa (opcional)');
    console.log('   - status (VARCHAR) - active, inactive, prospect');
    console.log('   - org_id (UUID, FK) - Organização do usuário');
    console.log('   - created_at, updated_at (TIMESTAMP)');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
analyzeCRMTables().catch(console.error);
