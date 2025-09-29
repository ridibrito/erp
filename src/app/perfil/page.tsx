"use client";
import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Key, 
  Edit3,
  Save,
  X,
  CheckCircle,
  Eye,
  EyeOff,
  Upload,
  Loader2
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { updateProfile, changePassword, uploadAvatar, deleteAvatar, getProfileData, ProfileUpdateData, PasswordChangeData } from '@/lib/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PerfilPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dados do usuário
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });

  // Dados de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // Função para salvar alterações do perfil
  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const updateData: ProfileUpdateData = {
        name: userData.name,
        phone: userData.phone,
        avatar: userData.avatar,
      };

      const result = await updateProfile(user.id, updateData);

          if (result.success) {
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setIsEditing(false);
            
            // Aguardar um pouco antes de recarregar para garantir que a atualização foi processada
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil' });
          }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' });
    } finally {
      setLoading(false);
    }
  };

  // Função para alterar senha
  const handleChangePassword = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await changePassword(passwordData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao alterar senha' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' });
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer upload do avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione apenas arquivos de imagem' });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'O arquivo deve ter no máximo 5MB' });
      return;
    }

    setUploadingAvatar(true);
    setMessage(null);

    try {
      // Deletar avatar antigo se existir
      if (userData.avatar) {
        await deleteAvatar(user.id, userData.avatar);
      }

      // Fazer upload do novo avatar
      const result = await uploadAvatar(user.id, file);

          if (result.success && result.url) {
            // Atualizar o avatar no perfil também
            const updateResult = await updateProfile(user.id, { avatar: result.url });
            
            if (updateResult.success) {
              setUserData(prev => ({ ...prev, avatar: result.url! }));
              setMessage({ type: 'success', text: 'Avatar atualizado com sucesso!' });
              
              // Aguardar um pouco antes de recarregar para garantir que a atualização foi processada
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              setMessage({ type: 'error', text: updateResult.error || 'Erro ao salvar avatar' });
            }
          } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao fazer upload do avatar' });
          }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações da conta</p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Mensagens */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Foto do Perfil</CardTitle>
            <CardDescription>Adicione uma foto para personalizar seu perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  {userData.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {userData.avatar ? 'Alterar Foto' : 'Adicionar Foto'}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou GIF. Máximo 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Gerencie suas informações básicas</CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} size="sm" disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O email não pode ser alterado
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button onClick={handleChangePassword} disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Segurança</CardTitle>
            <CardDescription>Dados sobre a segurança da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Conta Ativa</p>
                  <p className="text-sm text-muted-foreground">Sua conta está ativa e segura</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Último Login</p>
                  <p className="text-sm text-muted-foreground">Hoje às 14:30</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </ProtectedLayout>
);
}