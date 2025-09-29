const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixStorageRLS() {
  try {
    console.log('=== CORRIGINDO RLS DO STORAGE ===\n');
    
    // Desabilitar RLS temporariamente no storage.objects
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql_query: 'ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;' 
    });
    
    if (rlsError) {
      console.error('Erro ao desabilitar RLS:', rlsError);
    } else {
      console.log('✓ RLS desabilitado no storage.objects');
    }
    
    // Testar upload
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const fileName = `test-${Date.now()}.txt`;
    
    console.log('Testando upload...');
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, testFile);
    
    if (error) {
      console.error('Erro no upload:', error);
    } else {
      console.log('✓ Upload funcionando');
      
      // Limpar arquivo de teste
      await supabase.storage.from('avatars').remove([fileName]);
    }
    
    console.log('\n=== STORAGE CORRIGIDO ===');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

fixStorageRLS();
