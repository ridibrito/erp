#!/usr/bin/env node

/**
 * Script para descobrir campos existentes nas tabelas CRM
 * Execute: node scripts/discover-table-fields.js
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

async function discoverTableFields() {
  try {
    console.log('🔍 Descobrindo campos das tabelas CRM...\n');

    const tables = ['crm_accounts', 'crm_contacts'];
    
    for (const tableName of tables) {
      console.log(`📊 Analisando ${tableName.toUpperCase()}:`);
      
      // Tentar diferentes combinações de campos comuns
      const commonFields = [
        'id', 'name', 'title', 'email', 'phone', 'address', 'status',
        'created_at', 'updated_at', 'org_id', 'user_id', 'account_id',
        'first_name', 'last_name', 'company', 'position', 'document',
        'fantasy_name', 'cnpj', 'cpf', 'zipcode', 'city', 'state'
      ];

      const validFields = [];
      const invalidFields = [];

      for (const field of commonFields) {
        try {
          // Tentar fazer um select com o campo
          const { data, error } = await supabase
            .from(tableName)
            .select(field)
            .limit(1);

          if (error && error.code === 'PGRST116') {
            // Campo não existe
            invalidFields.push(field);
          } else if (error) {
            // Outro tipo de erro (pode ser permissão, etc.)
            validFields.push(field);
          } else {
            // Campo existe
            validFields.push(field);
          }
        } catch (err) {
          invalidFields.push(field);
        }
      }

      console.log(`   ✅ Campos válidos (${validFields.length}):`);
      validFields.forEach(field => {
        console.log(`      - ${field}`);
      });

      if (invalidFields.length > 0) {
        console.log(`   ❌ Campos inválidos (${invalidFields.length}):`);
        invalidFields.forEach(field => {
          console.log(`      - ${field}`);
        });
      }

      // Tentar inserir um registro mínimo para descobrir campos obrigatórios
      console.log(`   🧪 Testando inserção mínima...`);
      
      const minimalData = { org_id: '00000000-0000-0000-0000-000000000001' };
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert(minimalData)
          .select()
          .single();

        if (error) {
          console.log(`      ❌ Erro: ${error.message}`);
          console.log(`      📋 Código: ${error.code}`);
        } else {
          console.log(`      ✅ Inserção bem-sucedida!`);
          console.log(`      📊 Dados retornados:`, data);
          
          // Limpar dados de teste
          await supabase.from(tableName).delete().eq('id', data.id);
          console.log(`      🧹 Dados de teste removidos`);
        }
      } catch (err) {
        console.log(`      ⚠️  Erro na inserção: ${err.message}`);
      }

      console.log('');
    }

    // Sugestões baseadas nos campos encontrados
    console.log('💡 SUGESTÕES DE IMPLEMENTAÇÃO:\n');
    
    console.log('🔄 REFATORAÇÃO DO MÓDULO DE CLIENTES:');
    console.log('1. Renomear "Clientes" para "Contatos"');
    console.log('2. Criar duas opções:');
    console.log('   - Pessoa Física (crm_contacts)');
    console.log('   - Pessoa Jurídica (crm_accounts)');
    console.log('3. Permitir vincular contatos a empresas');
    console.log('4. Manter compatibilidade com dados existentes');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
discoverTableFields().catch(console.error);
