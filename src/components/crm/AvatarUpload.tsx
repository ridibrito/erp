'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { useToastHelpers } from '@/components/ui/toast';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  type: 'person' | 'company';
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ 
  currentAvatar, 
  onAvatarChange, 
  type, 
  size = 'lg' 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToastHelpers();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      error('Arquivo inválido', 'Por favor, selecione apenas imagens.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Arquivo muito grande', 'A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onAvatarChange(result);
      };
      reader.readAsDataURL(file);

      // Aqui você pode implementar o upload real para o Supabase Storage
      // Por enquanto, vamos simular o upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Avatar atualizado', 'Avatar atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      error('Erro no upload', 'Não foi possível fazer upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    onAvatarChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mx-auto mb-4 relative group cursor-pointer`}>
        {preview ? (
          <img 
            src={preview} 
            alt="Avatar" 
            className="h-full w-full object-cover" 
          />
        ) : (
          <Camera className={`${iconSizes[size]} text-gray-600`} />
        )}
        
        {/* Overlay de upload */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {/* Botão de upload */}
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>

      {/* Botão de remover */}
      {preview && (
        <button
          onClick={handleRemoveAvatar}
          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
