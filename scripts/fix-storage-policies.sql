-- Configurar políticas RLS para o bucket avatars
-- Permitir que usuários autenticados façam upload de seus próprios avatars

-- Política para permitir upload de avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir visualização de avatars
CREATE POLICY "Users can view avatars" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- Política para permitir atualização de avatars próprios
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir exclusão de avatars próprios
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Habilitar RLS no storage.objects se não estiver habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
