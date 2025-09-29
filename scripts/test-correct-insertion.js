#!/usr/bin/env node

/**
 * Script para testar inserção correta nas tabelas CRM
 * Execute: node scripts/test-correct-insertion.js
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

async function testCorrectInsertion() {
  try {
    console.log('🧪 Testando inserção correta nas tabelas CRM...\n');

    // Teste 1: crm_accounts (empresa)
    console.log('🏢 Testando crm_accounts (empresa):');
    try {
      const accountData = {
        name: 'Empresa Teste Ltda',
        org_id: '00000000-0000-0000-0000-000000000001'
      };

      const { data: account, error: accountError } = await supabase
        .from('crm_accounts')
        .insert(accountData)
        .select()
        .single();

      if (accountError) {
        console.log(`   ❌ Erro: ${accountError.message}`);
      } else {
        console.log('   ✅ Empresa criada com sucesso!');
        console.log(`   📊 ID: ${account.id}`);
        console.log(`   📊 Nome: ${account.name}`);
        
        // Teste 2: crm_contacts (pessoa vinculada à empresa)
        console.log('\n👤 Testando crm_contacts (pessoa vinculada):');
        
        const contactData = {
          first_name: 'João',
          last_name: 'Silva',
          email: 'joao@empresateste.com',
          phone: '11999999999',
          position: 'Gerente',
          account_id: account.id, // Vinculado à empresa
          org_id: '00000000-0000-0000-0000-000000000001'
        };

        const { data: contact, error: contactError } = await supabase
          .from('crm_contacts')
          .insert(contactData)
          .select()
          .single();

        if (contactError) {
          console.log(`   ❌ Erro: ${contactError.message}`);
        } else {
          console.log('   ✅ Contato criado com sucesso!');
          console.log(`   📊 ID: ${contact.id}`);
          console.log(`   📊 Nome: ${contact.first_name} ${contact.last_name}`);
          console.log(`   📊 Empresa: ${contact.account_id}`);
          
          // Teste 3: crm_contacts (pessoa sem empresa)
          console.log('\n👤 Testando crm_contacts (pessoa sem empresa):');
          
          const contactData2 = {
            first_name: 'Maria',
            last_name: 'Santos',
            email: 'maria@email.com',
            phone: '11888888888',
            account_id: null, // Sem empresa
            org_id: '00000000-0000-0000-0000-000000000001'
          };

          const { data: contact2, error: contactError2 } = await supabase
            .from('crm_contacts')
            .insert(contactData2)
            .select()
            .single();

          if (contactError2) {
            console.log(`   ❌ Erro: ${contactError2.message}`);
          } else {
            console.log('   ✅ Contato sem empresa criado com sucesso!');
            console.log(`   📊 ID: ${contact2.id}`);
            console.log(`   📊 Nome: ${contact2.first_name} ${contact2.last_name}`);
            console.log(`   📊 Empresa: ${contact2.account_id || 'Nenhuma'}`);
          }
        }

        // Limpar dados de teste
        console.log('\n🧹 Limpando dados de teste...');
        await supabase.from('crm_contacts').delete().eq('account_id', account.id);
        await supabase.from('crm_contacts').delete().eq('id', contact2?.id);
        await supabase.from('crm_accounts').delete().eq('id', account.id);
        console.log('   ✅ Dados de teste removidos');
      }
    } catch (err) {
      console.log(`   ⚠️  Erro: ${err.message}`);
    }

    console.log('\n💡 ESTRUTURA CONFIRMADA:');
    console.log('🏢 crm_accounts:');
    console.log('   - name (obrigatório) - Nome da empresa');
    console.log('   - org_id (obrigatório) - Organização do usuário');
    console.log('   - Outros campos opcionais: email, phone, address, etc.');
    
    console.log('\n👤 crm_contacts:');
    console.log('   - account_id (obrigatório) - ID da empresa (pode ser null)');
    console.log('   - org_id (obrigatório) - Organização do usuário');
    console.log('   - Outros campos opcionais: first_name, last_name, email, etc.');

    console.log('\n🔄 PRÓXIMOS PASSOS:');
    console.log('1. Refatorar módulo de "Clientes" para "Contatos"');
    console.log('2. Criar interface para escolher: Pessoa Física ou Jurídica');
    console.log('3. Implementar lógica de vinculação contato ↔ empresa');
    console.log('4. Migrar dados existentes do localStorage');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
testCorrectInsertion().catch(console.error);
