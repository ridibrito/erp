import { supabase } from './supabase';
import { User } from './auth-enhanced';

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Função para atualizar dados do perfil
export async function updateProfile(userId: string, data: ProfileUpdateData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Atualizando perfil:', data);
    
    // Atualizar user_metadata no Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar
      }
    });

    // Também atualizar na tabela user_sessions
    if (data.name || data.phone || data.avatar) {
      // Primeiro buscar os dados atuais
      const { data: currentSession } = await supabase
        .from('user_sessions')
        .select('device_info')
        .eq('user_id', userId)
        .single();

      const currentDeviceInfo = currentSession?.device_info || {};
      
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .update({
          device_info: {
            ...currentDeviceInfo,
            ...(data.name && { name: data.name }),
            ...(data.phone && { phone: data.phone }),
            ...(data.avatar && { avatar: data.avatar })
          },
          updated_at: new Date()
        })
        .eq('user_id', userId);

      if (sessionError) {
        console.error('Erro ao atualizar sessão:', sessionError);
        return { success: false, error: sessionError.message };
      }
    }

    if (authError) {
      console.error('Erro ao atualizar perfil no auth:', authError);
      return { success: false, error: authError.message };
    }

    console.log('Perfil atualizado com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// Função para alterar senha
export async function changePassword(data: PasswordChangeData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Alterando senha...');
    
    // Verificar se as senhas coincidem
    if (data.newPassword !== data.confirmPassword) {
      return { success: false, error: 'As senhas não coincidem' };
    }

    // Verificar se a nova senha tem pelo menos 6 caracteres
    if (data.newPassword.length < 6) {
      return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres' };
    }

    // Atualizar senha diretamente (Supabase Auth gerencia a verificação)
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword
    });

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('Senha alterada com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// Função para fazer upload de avatar
export async function uploadAvatar(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('Fazendo upload para:', filePath);

    // Fazer upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    console.log('Upload realizado com sucesso:', publicUrl);
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// Função para deletar avatar antigo
export async function deleteAvatar(userId: string, currentAvatarUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extrair nome do arquivo da URL
    const fileName = currentAvatarUrl.split('/').pop();
    if (!fileName) {
      return { success: false, error: 'URL do avatar inválida' };
    }

    const filePath = `${userId}/${fileName}`;
    console.log('Deletando avatar:', filePath);

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar avatar:', error);
      return { success: false, error: error.message };
    }

    console.log('Avatar deletado com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar avatar:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// Função para obter dados completos do perfil
export async function getProfileData(userId: string): Promise<{ profile: Partial<User> | null; error?: string }> {
  try {
    console.log('Obtendo dados do perfil para userId:', userId);
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Erro ao obter usuário:', error);
      return { profile: null, error: 'Usuário não encontrado' };
    }

    console.log('Dados do usuário obtidos:', user);

    // Buscar dados da sessão também
    const { data: userSession } = await supabase
      .from('user_sessions')
      .select('device_info')
      .eq('user_id', userId)
      .single();

    const profile: Partial<User> = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || userSession?.device_info?.name || 'Usuário',
      phone: user.user_metadata?.phone || userSession?.device_info?.phone || '',
      avatar: user.user_metadata?.avatar || userSession?.device_info?.avatar || '',
      createdAt: new Date(user.created_at),
      updatedAt: new Date()
    };

    console.log('Perfil formatado:', profile);
    return { profile, error: undefined };
  } catch (error) {
    console.error('Erro ao obter dados do perfil:', error);
    return { profile: null, error: 'Erro interno do servidor' };
  }
}
