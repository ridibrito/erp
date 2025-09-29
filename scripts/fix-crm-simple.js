// Script simples para corrigir a tabela crm_contacts
// Execute com: node scripts/fix-crm-simple.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixCRMContacts() {
  console.log('🔧 Corrigindo tabela crm_contacts...\n');
  
  try {
    // 1. Adicionar coluna address
    console.log('🏠 Adicionando coluna address...');
    const { error: addressError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS address JSONB;'
    });
    
    if (addressError) {
      console.error('❌ Erro ao adicionar address:', addressError.message);
    } else {
      console.log('✅ Coluna address adicionada!');
    }

    // 2. Adicionar coluna document
    console.log('📄 Adicionando coluna document...');
    const { error: documentError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS document TEXT;'
    });
    
    if (documentError) {
      console.error('❌ Erro ao adicionar document:', documentError.message);
    } else {
      console.log('✅ Coluna document adicionada!');
    }

    // 3. Adicionar coluna document_type
    console.log('📋 Adicionando coluna document_type...');
    const { error: docTypeError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS document_type TEXT;'
    });
    
    if (docTypeError) {
      console.error('❌ Erro ao adicionar document_type:', docTypeError.message);
    } else {
      console.log('✅ Coluna document_type adicionada!');
    }

    // 4. Adicionar coluna status
    console.log('📊 Adicionando coluna status...');
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';"
    });
    
    if (statusError) {
      console.error('❌ Erro ao adicionar status:', statusError.message);
    } else {
      console.log('✅ Coluna status adicionada!');
    }

    // 5. Adicionar coluna notes
    console.log('📝 Adicionando coluna notes...');
    const { error: notesError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS notes TEXT;'
    });
    
    if (notesError) {
      console.error('❌ Erro ao adicionar notes:', notesError.message);
    } else {
      console.log('✅ Coluna notes adicionada!');
    }

    // 6. Verificar estrutura final
    console.log('\n📋 Verificando estrutura final...');
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
      console.error('❌ Erro ao verificar estrutura:', finalError.message);
    } else {
      console.log('Estrutura final da tabela crm_contacts:');
      console.table(finalStructure);
    }

    // 7. Verificar se todas as colunas necessárias existem
    const requiredColumns = ['address', 'document', 'document_type', 'status', 'notes'];
    const existingColumns = finalStructure.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('\n🎉 SUCESSO! Todas as colunas necessárias foram adicionadas!');
      console.log('✅ A tabela crm_contacts agora tem todas as colunas necessárias.');
      console.log('✅ O formulário de criação de contatos deve funcionar agora.');
    } else {
      console.log('\n❌ Ainda faltam colunas:', missingColumns);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

fixCRMContacts();
