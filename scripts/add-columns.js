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

async function addMissingColumns() {
  console.log('🔧 Adicionando colunas faltantes na tabela crm_contacts...\n');
  
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
      sql: 'ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS document_type TEXT;'
    });
    
    if (docTypeError) {
      console.error('❌ Erro ao adicionar coluna document_type:', docTypeError);
    } else {
      console.log('✅ Coluna document_type adicionada!');
    }

    // 5. Adicionar coluna status
    console.log('\n📊 5. Adicionando coluna status...');
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';"
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

    // 7. Verificar estrutura final
    console.log('\n📋 7. Verificando estrutura final...');
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

    // 8. Verificar se todas as colunas necessárias existem
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

addMissingColumns();
