const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testCRMContacts() {
  console.log('🧪 Testando tabela crm_contacts...\n');
  
  try {
    // 1. Verificar estrutura da tabela
    console.log('📋 1. Verificando estrutura da tabela...');
    const { data: structure, error: structureError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'crm_contacts'
        ORDER BY ordinal_position;
      `
    });
    
    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError);
      return;
    }
    
    console.log('Estrutura da tabela crm_contacts:');
    console.table(structure);

    // 2. Verificar se as colunas necessárias existem
    const requiredColumns = ['address', 'document', 'document_type', 'status', 'notes'];
    const existingColumns = structure.map(col => col.column_name);
    
    console.log('\n🔍 2. Verificando colunas necessárias...');
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Colunas faltantes:', missingColumns);
      console.log('Execute o script fix-crm-contacts-simple.sql para adicionar as colunas.');
      return;
    } else {
      console.log('✅ Todas as colunas necessárias existem!');
    }

    // 3. Verificar constraints
    console.log('\n🔗 3. Verificando constraints...');
    const { data: constraints, error: constraintsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'crm_contacts'
          AND tc.table_schema = 'public';
      `
    });
    
    if (constraintsError) {
      console.error('❌ Erro ao verificar constraints:', constraintsError);
    } else {
      console.log('Constraints encontradas:');
      console.table(constraints);
    }

    // 4. Verificar se as tabelas referenciadas existem
    console.log('\n📊 4. Verificando tabelas referenciadas...');
    
    // Verificar tabela orgs
    const { data: orgsData, error: orgsError } = await supabase
      .from('orgs')
      .select('id')
      .limit(1);
    
    if (orgsError) {
      console.log('⚠️ Tabela orgs não existe ou não é acessível:', orgsError.message);
    } else {
      console.log('✅ Tabela orgs existe e tem', orgsData?.length || 0, 'registros');
    }

    // Verificar tabela crm_accounts
    const { data: accountsData, error: accountsError } = await supabase
      .from('crm_accounts')
      .select('id')
      .limit(1);
    
    if (accountsError) {
      console.log('⚠️ Tabela crm_accounts não existe ou não é acessível:', accountsError.message);
    } else {
      console.log('✅ Tabela crm_accounts existe e tem', accountsData?.length || 0, 'registros');
    }

    // 5. Testar inserção simples (sem constraints)
    console.log('\n🧪 5. Testando inserção simples...');
    
    // Primeiro, vamos tentar inserir sem as colunas que têm constraints
    const { data: testData, error: testError } = await supabase
      .from('crm_contacts')
      .insert({
        first_name: 'Teste',
        last_name: 'Usuario',
        email: 'teste@teste.com',
        phone: '(11) 99999-9999',
        title: 'Teste',
        address: {
          street: 'Rua Teste',
          number: '123',
          city: 'São Paulo',
          state: 'SP'
        },
        document: '12345678901',
        document_type: 'cpf',
        status: 'active',
        notes: 'Cliente de teste'
      })
      .select()
      .single();

    if (testError) {
      console.error('❌ Erro no teste de inserção:', testError.message);
      console.error('Código do erro:', testError.code);
      
      if (testError.code === '23503') {
        console.log('\n💡 SOLUÇÃO:');
        console.log('O erro é de foreign key constraint.');
        console.log('Execute o script fix-constraints.sql para resolver.');
      }
    } else {
      console.log('✅ Teste de inserção bem-sucedido!');
      console.log('Dados inseridos:', testData);
      
      // Limpar dados de teste
      await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', testData.id);
      console.log('🧹 Dados de teste removidos.');
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

testCRMContacts();
