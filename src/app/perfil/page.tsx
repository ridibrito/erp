"use client";
import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Key, 
  Bell, 
  Palette, 
  Globe,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Smartphone,
  Building2,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Trash2,
  FileText
} from 'lucide-react';

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dados do usuário (simulados)
  const [userData, setUserData] = useState({
    nome: 'João Silva',
    email: 'joao.silva@empresa.com',
    telefone: '+55 (11) 99999-9999',
    cargo: 'Gerente de Vendas',
    departamento: 'Vendas',
    dataNascimento: '1985-03-15',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    bio: 'Gerente de vendas com mais de 10 anos de experiência em gestão de equipes e relacionamento com clientes.',
    avatar: null
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: true,
    lastLogin: '2024-01-15 14:30',
    lastPasswordChange: '2023-12-01',
    activeSessions: 2
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weeklyReport: true,
    monthlyReport: true,
    systemUpdates: true,
    marketing: false
  });

  const handleSave = () => {
    setIsEditing(false);
    // Aqui você faria a chamada para salvar os dados
    console.log('Dados salvos:', userData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Resetar dados para os valores originais
  };

  const handlePasswordChange = () => {
    // Lógica para alterar senha
    console.log('Senha alterada');
  };

  const handleTwoFactorToggle = () => {
    setSecurityData(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'preferencias', label: 'Preferências', icon: Settings }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações da conta</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'perfil' && (
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  {userData.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{userData.nome}</h2>
                <p className="text-muted-foreground">{userData.cargo}</p>
                <p className="text-sm text-muted-foreground">{userData.departamento}</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={userData.nome}
                    onChange={(e) => setUserData(prev => ({ ...prev, nome: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted"
                    />
                    <Mail className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={userData.telefone}
                      onChange={(e) => setUserData(prev => ({ ...prev, telefone: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted"
                    />
                    <Phone className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    value={userData.dataNascimento}
                    onChange={(e) => setUserData(prev => ({ ...prev, dataNascimento: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Profissionais</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Cargo</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userData.cargo}
                      onChange={(e) => setUserData(prev => ({ ...prev, cargo: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted"
                    />
                    <Briefcase className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Departamento</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userData.departamento}
                      onChange={(e) => setUserData(prev => ({ ...prev, departamento: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted"
                    />
                    <Building2 className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Endereço</label>
                  <div className="relative">
                    <textarea
                      value={userData.endereco}
                      onChange={(e) => setUserData(prev => ({ ...prev, endereco: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted resize-none"
                    />
                    <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Biografia</label>
                  <textarea
                    value={userData.bio}
                    onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted resize-none"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-border">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'seguranca' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
            
            {/* Password Change */}
            <div className="rounded-lg border border-border p-6">
              <h4 className="text-md font-semibold mb-4">Alterar Senha</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Digite a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirmar Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Confirme a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>Alterar Senha</span>
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-semibold">Autenticação em Duas Etapas</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <button
                  onClick={handleTwoFactorToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    securityData.twoFactorEnabled
                      ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {securityData.twoFactorEnabled ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Ativado</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Ativar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Security Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border p-6">
                <h4 className="text-md font-semibold mb-4">Informações de Segurança</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Último Login:</span>
                    <span className="text-sm">{securityData.lastLogin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Última alteração de senha:</span>
                    <span className="text-sm">{securityData.lastPasswordChange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sessões ativas:</span>
                    <span className="text-sm">{securityData.activeSessions}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-6">
                <h4 className="text-md font-semibold mb-4">Ações de Segurança</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-input rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm">Gerenciar Sessões</span>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-input rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm">Histórico de Login</span>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-input rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm">Dispositivos Confiáveis</span>
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notificacoes' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Configurações de Notificações</h3>
            
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">
                      {key === 'email' && 'Notificações por Email'}
                      {key === 'push' && 'Notificações Push'}
                      {key === 'sms' && 'Notificações por SMS'}
                      {key === 'weeklyReport' && 'Relatório Semanal'}
                      {key === 'monthlyReport' && 'Relatório Mensal'}
                      {key === 'systemUpdates' && 'Atualizações do Sistema'}
                      {key === 'marketing' && 'Emails de Marketing'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {key === 'email' && 'Receba notificações importantes por email'}
                      {key === 'push' && 'Receba notificações em tempo real no navegador'}
                      {key === 'sms' && 'Receba notificações críticas por SMS'}
                      {key === 'weeklyReport' && 'Receba relatórios semanais de atividades'}
                      {key === 'monthlyReport' && 'Receba relatórios mensais de performance'}
                      {key === 'systemUpdates' && 'Seja notificado sobre atualizações do sistema'}
                      {key === 'marketing' && 'Receba ofertas e novidades da empresa'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferencias' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Preferências da Conta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border p-6">
                <h4 className="text-md font-semibold mb-4">Aparência</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tema</label>
                    <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Idioma</label>
                    <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fuso Horário</label>
                    <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">London (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-6">
                <h4 className="text-md font-semibold mb-4">Ações da Conta</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-input rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm">Exportar Dados</span>
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-input rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm">Download de Relatórios</span>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-input rounded-lg hover:bg-muted transition-colors text-red-600">
                    <span className="text-sm">Sair de Todas as Sessões</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                    <span className="text-sm">Excluir Conta</span>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
