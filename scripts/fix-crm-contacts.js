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

async function fixCRMContactsTable() {
  console.log('🔧 Corrigindo tabela crm_contacts...\n');
  
  try {
    // 1. Verificar estrutura atual
    console.log('📋 1. Verificando estrutura atual...');
    const { data: currentStructure, error: structureError } = await supabase.rpc('exec_sql', {
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
    
    console.log('Estrutura atual:');
    console.table(currentStructure);

    // 2. Adicionar coluna address
    console.log('\n🏠 2. Adicionando coluna address...');
    const { error: addressError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS address JSONB;'
    });
    
    if (addressError) {
      console.error('❌ Erro ao adicionar coluna address:', addressError);
    } else {
      console.log('✅ Coluna address adicionada!');
    }

    // 3. Adicionar coluna document
    console.log('\n📄 3. Adicionando coluna document...');
    const { error: documentError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS document TEXT;'
    });
    
    if (documentError) {
      console.error('❌ Erro ao adicionar coluna document:', documentError);
    } else {
      console.log('✅ Coluna document adicionada!');
    }

    // 4. Adicionar coluna document_type
    console.log('\n📋 4. Adicionando coluna document_type...');
    const { error: docTypeError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE crm_contacts 
            ADD COLUMN IF NOT EXISTS document_type TEXT 
            CHECK (document_type IN ('cpf', 'cnpj'));`
    });
    
    if (docTypeError) {
      console.error('❌ Erro ao adicionar coluna document_type:', docTypeError);
    } else {
      console.log('✅ Coluna document_type adicionada!');
    }

    // 5. Adicionar coluna status
    console.log('\n📊 5. Adicionando coluna status...');
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE crm_contacts 
            ADD COLUMN IF NOT EXISTS status TEXT 
            DEFAULT 'active' 
            CHECK (status IN ('active', 'inactive', 'prospect'));`
    });
    
    if (statusError) {
      console.error('❌ Erro ao adicionar coluna status:', statusError);
    } else {
      console.log('✅ Coluna status adicionada!');
    }

    // 6. Adicionar coluna notes
    console.log('\n📝 6. Adicionando coluna notes...');
    const { error: notesError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS notes TEXT;'
    });
    
    if (notesError) {
      console.error('❌ Erro ao adicionar coluna notes:', notesError);
    } else {
      console.log('✅ Coluna notes adicionada!');
    }

    // 7. Criar índices
    console.log('\n📇 7. Criando índices...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_crm_contacts_org_id ON crm_contacts(org_id);',
      'CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);',
      'CREATE INDEX IF NOT EXISTS idx_crm_contacts_account_id ON crm_contacts(account_id);',
      'CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status);',
      'CREATE INDEX IF NOT EXISTS idx_crm_contacts_document ON crm_contacts(document);'
    ];

    for (const indexSQL of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL });
      if (indexError) {
        console.error('❌ Erro ao criar índice:', indexError);
      }
    }
    console.log('✅ Índices criados!');

    // 8. Habilitar RLS (opcional - pode causar problemas se não configurado corretamente)
    console.log('\n🔒 8. Habilitando RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.error('⚠️ Erro ao habilitar RLS (pode ser normal):', rlsError.message);
      console.log('ℹ️ Continuando sem RLS...');
    } else {
      console.log('✅ RLS habilitado!');
    }

    // 9. Verificar estrutura final
    console.log('\n📋 9. Verificando estrutura final...');
    const { data: finalStructure, error: finalError } = await supabase.rpc('exec_sql', {
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
    
    if (finalError) {
      console.error('❌ Erro ao verificar estrutura final:', finalError);
    } else {
      console.log('Estrutura final:');
      console.table(finalStructure);
    }

    // 10. Testar inserção
    console.log('\n🧪 10. Testando inserção...');
    const { data: testData, error: testError } = await supabase
      .from('crm_contacts')
      .insert({
        org_id: '00000000-0000-0000-0000-000000000001',
        account_id: '00000000-0000-0000-0000-000000000002',
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
      console.error('❌ Erro no teste de inserção:', testError);
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

    console.log('\n🎉 Correção da tabela crm_contacts concluída com sucesso!');

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

fixCRMContactsTable();
