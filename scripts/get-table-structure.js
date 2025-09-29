#!/usr/bin/env node

/**
 * Script para obter estrutura detalhada das tabelas CRM
 * Execute: node scripts/get-table-structure.js
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

async function getTableStructure() {
  try {
    console.log('🔍 Obtendo estrutura das tabelas CRM...\n');

    // Como não temos acesso direto ao information_schema via API REST,
    // vamos tentar inserir dados de teste para inferir a estrutura
    console.log('📊 Testando estrutura das tabelas...\n');

    // Teste 1: crm_accounts
    console.log('🏢 Testando crm_accounts:');
    try {
      const testAccount = {
        name: 'Empresa Teste',
        fantasy_name: 'Fantasia Teste',
        document: '12345678000199',
        email: 'teste@empresa.com',
        phone: '11999999999',
        address: {
          street: 'Rua Teste',
          number: '123',
          complement: 'Sala 1',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01234567'
        },
        status: 'active',
        org_id: '00000000-0000-0000-0000-000000000001'
      };

      const { data: accountData, error: accountError } = await supabase
        .from('crm_accounts')
        .insert(testAccount)
        .select()
        .single();

      if (accountError) {
        console.log(`   ❌ Erro ao inserir: ${accountError.message}`);
        console.log(`   📋 Código: ${accountError.code}`);
        console.log(`   🔍 Detalhes: ${accountError.details || 'N/A'}`);
        console.log(`   💡 Hint: ${accountError.hint || 'N/A'}`);
      } else {
        console.log('   ✅ Estrutura aceita! Campos suportados:');
        Object.keys(testAccount).forEach(field => {
          console.log(`      - ${field}: ${typeof testAccount[field]}`);
        });
        
        // Limpar dados de teste
        await supabase.from('crm_accounts').delete().eq('id', accountData.id);
        console.log('   🧹 Dados de teste removidos');
      }
    } catch (err) {
      console.log(`   ⚠️  Erro: ${err.message}`);
    }

    console.log('');

    // Teste 2: crm_contacts
    console.log('👤 Testando crm_contacts:');
    try {
      const testContact = {
        first_name: 'João',
        last_name: 'Silva',
        email: 'joao@email.com',
        phone: '11988888888',
        document: '12345678901',
        position: 'Gerente',
        account_id: null, // Sem empresa
        status: 'active',
        org_id: '00000000-0000-0000-0000-000000000001'
      };

      const { data: contactData, error: contactError } = await supabase
        .from('crm_contacts')
        .insert(testContact)
        .select()
        .single();

      if (contactError) {
        console.log(`   ❌ Erro ao inserir: ${contactError.message}`);
        console.log(`   📋 Código: ${contactError.code}`);
        console.log(`   🔍 Detalhes: ${contactError.details || 'N/A'}`);
        console.log(`   💡 Hint: ${contactError.hint || 'N/A'}`);
      } else {
        console.log('   ✅ Estrutura aceita! Campos suportados:');
        Object.keys(testContact).forEach(field => {
          console.log(`      - ${field}: ${typeof testContact[field]}`);
        });
        
        // Limpar dados de teste
        await supabase.from('crm_contacts').delete().eq('id', contactData.id);
        console.log('   🧹 Dados de teste removidos');
      }
    } catch (err) {
      console.log(`   ⚠️  Erro: ${err.message}`);
    }

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Se as estruturas foram aceitas, podemos refatorar o módulo');
    console.log('2. Se houve erros, precisamos ajustar os campos');
    console.log('3. Implementar a lógica: crm_accounts (empresas) + crm_contacts (pessoas)');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
getTableStructure().catch(console.error);
