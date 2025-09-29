const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixStoragePolicies() {
  try {
    console.log('=== CORRIGINDO POLÍTICAS DE STORAGE ===\n');
    
    // Criar políticas para o bucket avatars
    const policies = [
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload avatars') THEN CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to view avatars') THEN CREATE POLICY "Allow authenticated users to view avatars" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update avatars') THEN CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete avatars') THEN CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars'); END IF; END $$;`
    ];
    
    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: policy });
      if (error) {
        console.error('Erro ao criar política:', policy, error);
      } else {
        console.log('✓ Política criada com sucesso');
      }
    }
    
    console.log('\n=== POLÍTICAS DE STORAGE CORRIGIDAS ===');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

fixStoragePolicies();
