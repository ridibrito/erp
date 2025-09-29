const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLogoUpload() {
  try {
    console.log('=== TESTANDO UPLOAD DE LOGO ===\n');
    
    // Criar um arquivo de teste (simulando uma imagem)
    const testFile = new Blob(['fake image data'], { type: 'image/png' });
    const fileName = `logo-test-${Date.now()}.png`;
    
    console.log('Fazendo upload do arquivo de teste...');
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Erro no upload:', error);
    } else {
      console.log('✓ Upload realizado com sucesso');
      console.log('Dados do upload:', data);
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      console.log('URL pública:', publicUrl);
      
      // Limpar arquivo de teste
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);
      
      if (deleteError) {
        console.error('Erro ao deletar arquivo de teste:', deleteError);
      } else {
        console.log('✓ Arquivo de teste removido');
      }
    }
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testLogoUpload();
