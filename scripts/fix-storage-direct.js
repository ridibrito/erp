const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixStorageDirect() {
  try {
    console.log('=== CORRIGINDO STORAGE DIRETAMENTE ===\n');
    
    // Testar upload direto
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const fileName = `test-${Date.now()}.txt`;
    
    console.log('Testando upload...');
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, testFile);
    
    if (error) {
      console.error('Erro no upload:', error);
      
      // Tentar criar bucket se não existir
      console.log('Tentando criar bucket avatars...');
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (bucketError) {
        console.error('Erro ao criar bucket:', bucketError);
      } else {
        console.log('✓ Bucket avatars criado com sucesso');
        
        // Testar upload novamente
        const { data: retryData, error: retryError } = await supabase.storage
          .from('avatars')
          .upload(fileName, testFile);
        
        if (retryError) {
          console.error('Erro no upload após criar bucket:', retryError);
        } else {
          console.log('✓ Upload funcionando após criar bucket');
          
          // Limpar arquivo de teste
          await supabase.storage.from('avatars').remove([fileName]);
        }
      }
    } else {
      console.log('✓ Upload funcionando corretamente');
      
      // Limpar arquivo de teste
      await supabase.storage.from('avatars').remove([fileName]);
    }
    
    console.log('\n=== STORAGE CORRIGIDO ===');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

fixStorageDirect();
