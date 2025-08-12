"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { SectionTabs } from '@/components/settings/SectionTabs';
import { 
  Building2, 
  Users, 
  Zap, 
  CreditCard, 
  Bell, 
  Palette,
  Shield,
  Mail,
  Key,
  Globe,
  FileText,
  Database,
  Workflow,
  Layers,
  Wrench,
  Tag,
  MessageSquare,
  Target,
  FolderOpen,
  Wallet,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Banknote,
  CreditCardIcon,
  DollarSign,
  Building,
  Package
} from 'lucide-react';

export default function Page(){
  const searchParams = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [activeTab, setActiveTab] = useState('empresa');

  // Definir seção inicial baseada no parâmetro da URL
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
      // Define a primeira tab como padrão para cada seção
      const defaultTabs = {
        general: 'empresa',
        users: 'usuarios',
        integrations: 'integracoes',
        finance: 'contas-bancarias',
        workflow: 'pipelines',
        services: 'servicos',
        communications: 'modelos-email'
      };
      setActiveTab(defaultTabs[section as keyof typeof defaultTabs] || 'empresa');
    }
  }, [searchParams]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    // Define a primeira tab como padrão para cada seção
    const defaultTabs = {
      general: 'empresa',
      users: 'usuarios',
      integrations: 'integracoes',
      finance: 'contas-bancarias',
      workflow: 'pipelines',
      services: 'servicos',
      communications: 'modelos-email'
    };
    setActiveTab(defaultTabs[sectionId as keyof typeof defaultTabs] || 'empresa');
  };

  const getTabContent = (section: string, tabId: string) => {
    switch (section) {
      case 'general':
        switch (tabId) {
          case 'empresa':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Perfil da Empresa</h2>
                  <p className="text-muted-foreground mb-6">Configure as informações básicas da sua empresa</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                        placeholder="Digite o nome da empresa"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">CNPJ</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                        placeholder="contato@empresa.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefone</label>
                      <input 
                        type="tel" 
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Endereço</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                        rows={3}
                        placeholder="Digite o endereço completo"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo da Empresa</label>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
                        <Building2 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Clique para fazer upload da logo</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors">
                    Cancelar
                  </button>
                  <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            );
            
          case 'preferencias':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Preferências</h2>
                  <p className="text-muted-foreground mb-6">Personalize a aparência e comportamento do sistema</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tema</label>
                      <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                        <option>Claro</option>
                        <option>Escuro</option>
                        <option>Sistema</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Idioma</label>
                      <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                        <option>Português (Brasil)</option>
                        <option>English</option>
                        <option>Español</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Fuso Horário</label>
                      <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                        <option>America/Sao_Paulo (UTC-3)</option>
                        <option>UTC</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Moeda Padrão</label>
                      <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                        <option>Real (R$)</option>
                        <option>Dólar ($)</option>
                        <option>Euro (€)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Formato de Data</label>
                      <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                        <option>DD/MM/AAAA</option>
                        <option>MM/DD/AAAA</option>
                        <option>AAAA-MM-DD</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="compact-mode" className="rounded" />
                      <label htmlFor="compact-mode" className="text-sm">Modo compacto</label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors">
                    Cancelar
                  </button>
                  <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            );
            
          case 'notificacoes':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Notificações</h2>
                  <p className="text-muted-foreground mb-6">Configure como e quando receber notificações</p>
                </div>
                
                <div className="space-y-6">
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Notificações por Email</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Relatórios semanais</p>
                          <p className="text-xs text-muted-foreground">Receba relatórios de performance toda semana</p>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Alertas de pagamento</p>
                          <p className="text-xs text-muted-foreground">Notificações sobre contas a pagar e receber</p>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Novos usuários</p>
                          <p className="text-xs text-muted-foreground">Notificações quando novos usuários se registrarem</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Notificações no Sistema</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Notificações push</p>
                          <p className="text-xs text-muted-foreground">Receba notificações em tempo real</p>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Sons de notificação</p>
                          <p className="text-xs text-muted-foreground">Reproduzir sons para notificações importantes</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors">
                    Cancelar
                  </button>
                  <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            );
            
          case 'departamentos':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Departamentos</h2>
                  <p className="text-muted-foreground mb-6">Gerencie estrutura organizacional</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Departamentos</p>
                        <p className="text-2xl font-bold">6</p>
                      </div>
                      <FolderOpen className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Funcionários</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gerentes</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <Shield className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Departments List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Departamentos da Empresa</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Departamento</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Vendas', employees: 8, manager: 'João Silva', budget: 'R$ 150.000' },
                        { name: 'Marketing', employees: 5, manager: 'Maria Santos', budget: 'R$ 80.000' },
                        { name: 'TI', employees: 6, manager: 'Pedro Costa', budget: 'R$ 120.000' },
                        { name: 'Financeiro', employees: 3, manager: 'Ana Oliveira', budget: 'R$ 60.000' },
                        { name: 'RH', employees: 2, manager: 'Carlos Lima', budget: 'R$ 40.000' }
                      ].map((dept, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FolderOpen className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium">{dept.name}</p>
                              <p className="text-sm text-muted-foreground">{dept.manager}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{dept.employees} funcionários</span>
                            <span className="text-sm font-medium">{dept.budget}</span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          case 'configuracoes-gerais':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Configurações Gerais</h2>
                  <p className="text-muted-foreground mb-6">Configure parâmetros gerais do sistema</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Configurações</p>
                        <p className="text-2xl font-bold">18</p>
                      </div>
                      <Settings className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                        <p className="text-2xl font-bold">15</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                        <p className="text-2xl font-bold">2h atrás</p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* General Settings */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-medium">Configurações do Sistema</h3>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                            defaultValue="Nexus ERP"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">CNPJ</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                            defaultValue="12.345.678/0001-90"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Email de Contato</label>
                          <input 
                            type="email" 
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                            defaultValue="contato@nexus.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Telefone</label>
                          <input 
                            type="tel" 
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                            defaultValue="(11) 99999-9999"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Fuso Horário</label>
                          <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                            <option>America/Sao_Paulo (UTC-3)</option>
                            <option>UTC</option>
                            <option>America/New_York (UTC-5)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Idioma</label>
                          <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                            <option>Português (Brasil)</option>
                            <option>English</option>
                            <option>Español</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Moeda Padrão</label>
                          <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                            <option>Real (R$)</option>
                            <option>Dólar ($)</option>
                            <option>Euro (€)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Formato de Data</label>
                          <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                            <option>DD/MM/AAAA</option>
                            <option>MM/DD/AAAA</option>
                            <option>AAAA-MM-DD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <button className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors">
                        Cancelar
                      </button>
                      <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Salvar Configurações
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
            
          default:
            return <div>Tab não encontrada</div>;
        }
        
      case 'users':
        switch (tabId) {
          case 'usuarios':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Usuários</h2>
                  <p className="text-muted-foreground mb-6">Gerencie usuários e permissões do sistema</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                        <p className="text-2xl font-bold">10</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <Shield className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                {/* User List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Lista de Usuários</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Usuário</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'João Silva', email: 'joao@empresa.com', role: 'Admin', status: 'Ativo' },
                        { name: 'Maria Santos', email: 'maria@empresa.com', role: 'Gerente', status: 'Ativo' },
                        { name: 'Pedro Costa', email: 'pedro@empresa.com', role: 'Usuário', status: 'Inativo' },
                        { name: 'Ana Oliveira', email: 'ana@empresa.com', role: 'Usuário', status: 'Ativo' }
                      ].map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.status}
                            </span>
                            <span className="text-sm text-muted-foreground">{user.role}</span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          case 'papeis':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Papéis e Permissões</h2>
                  <p className="text-muted-foreground mb-6">Configure papéis e permissões de acesso</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Papéis Criados</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <Shield className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Permissões</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <Key className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Usuários com Papéis</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <Users className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                {/* Roles List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Papéis do Sistema</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Papel</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Administrador', users: 3, permissions: 24, description: 'Acesso total ao sistema' },
                        { name: 'Gerente', users: 2, permissions: 18, description: 'Acesso gerencial limitado' },
                        { name: 'Usuário', users: 7, permissions: 12, description: 'Acesso básico ao sistema' },
                        { name: 'Financeiro', users: 2, permissions: 15, description: 'Acesso ao módulo financeiro' }
                      ].map((role, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Shield className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{role.name}</p>
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{role.users} usuários</span>
                            <span className="text-sm text-muted-foreground">{role.permissions} permissões</span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          case 'convites':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Convites</h2>
                  <p className="text-muted-foreground mb-6">Gerencie convites para novos usuários</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Convites Enviados</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Aceitos</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <Clock className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                {/* Invites List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Convites Pendentes</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Convite</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { email: 'carlos@empresa.com', role: 'Usuário', sent: '2024-01-15', status: 'Pendente' },
                        { email: 'julia@empresa.com', role: 'Gerente', sent: '2024-01-14', status: 'Pendente' },
                        { email: 'roberto@empresa.com', role: 'Financeiro', sent: '2024-01-13', status: 'Pendente' }
                      ].map((invite, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Mail className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">{invite.email}</p>
                              <p className="text-sm text-muted-foreground">Enviado em {invite.sent}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{invite.role}</span>
                            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                              {invite.status}
                            </span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          default:
            return <div>Tab não encontrada</div>;
        }
        
      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Integrações</h2>
              <p className="text-muted-foreground mb-6">Conecte seus serviços favoritos</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Serviços Conectados</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">API Keys Ativas</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Key className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Webhooks Configurados</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <Globe className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="text-center py-8">
              <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Acesse a página completa de integrações para ver todas as opções disponíveis</p>
              <a 
                href="/settings/integracoes" 
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ver Todas as Integrações
              </a>
            </div>
          </div>
        );
        
      case 'finance':
        switch (tabId) {
          case 'contas-bancarias':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Contas Bancárias</h2>
                  <p className="text-muted-foreground mb-6">Gerencie suas contas bancárias e verifique saldos</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contas Ativas</p>
                        <p className="text-2xl font-bold">4</p>
                      </div>
                      <Banknote className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                        <p className="text-2xl font-bold">R$ 125.430,00</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Última Sincronização</p>
                        <p className="text-2xl font-bold">2h atrás</p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <Banknote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Conteúdo da seção de contas bancárias será exibido aqui</p>
                </div>
              </div>
            );
            
          case 'meios-pagamento':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Meios de Pagamento</h2>
                  <p className="text-muted-foreground mb-6">Configure formas de pagamento disponíveis</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Meios Ativos</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <CreditCardIcon className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Cartões de Crédito</p>
                        <p className="text-2xl font-bold">4</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Transferências</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <Banknote className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <CreditCardIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Conteúdo da seção de meios de pagamento será exibido aqui</p>
                </div>
              </div>
            );
            
          case 'meios-recebimento':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Meios de Recebimento</h2>
                  <p className="text-muted-foreground mb-6">Configure formas de recebimento disponíveis</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Meios Ativos</p>
                        <p className="text-2xl font-bold">6</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">PIX</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                      <Zap className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Boleto</p>
                        <p className="text-2xl font-bold">1</p>
                      </div>
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Conteúdo da seção de meios de recebimento será exibido aqui</p>
                </div>
              </div>
            );
            
          case 'centro-custos':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Centro de Custos</h2>
                  <p className="text-muted-foreground mb-6">Gerencie centros de custos para controle financeiro</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Centros Ativos</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <Target className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Departamentos</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <FolderOpen className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Projetos</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <Workflow className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Conteúdo da seção de centro de custos será exibido aqui</p>
                </div>
              </div>
            );
            
          case 'fornecedores':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Fornecedores</h2>
                  <p className="text-muted-foreground mb-6">Gerencie fornecedores e parceiros comerciais</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total de Fornecedores</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <Building className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                        <p className="text-2xl font-bold">18</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Inativos</p>
                        <p className="text-2xl font-bold">6</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Conteúdo da seção de fornecedores será exibido aqui</p>
                </div>
              </div>
            );
            
          case 'configuracoes-fiscais':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Configurações Fiscais</h2>
                  <p className="text-muted-foreground mb-6">Configure impostos e configurações fiscais</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Impostos Configurados</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Regime Tributário</p>
                        <p className="text-2xl font-bold">Simples</p>
                      </div>
                      <Shield className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Alíquotas</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <Database className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Conteúdo da seção de configurações fiscais será exibido aqui</p>
                </div>
              </div>
            );
            
          case 'moedas':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Moedas</h2>
                  <p className="text-muted-foreground mb-6">Configure moedas e taxas de câmbio</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Moedas Ativas</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <Database className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Moeda Padrão</p>
                        <p className="text-2xl font-bold">BRL</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                        <p className="text-2xl font-bold">1h atrás</p>
                      </div>
                      <Clock className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Conteúdo da seção de moedas será exibido aqui</p>
                </div>
              </div>
            );
            
          default:
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Configurações Financeiras</h2>
                  <p className="text-muted-foreground mb-6">Configure contas bancárias e impostos</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contas Bancárias</p>
                        <p className="text-2xl font-bold">4</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Moedas Configuradas</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <Database className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Configurações Fiscais</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Conteúdo da seção financeira será exibido aqui</p>
                </div>
              </div>
            );
        }
        
      case 'workflow':
        switch (tabId) {
          case 'pipelines':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Pipelines</h2>
                  <p className="text-muted-foreground mb-6">Configure pipelines de vendas e processos</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pipelines Ativos</p>
                        <p className="text-2xl font-bold">6</p>
                      </div>
                      <Workflow className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total de Etapas</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <Layers className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Negócios Ativos</p>
                        <p className="text-2xl font-bold">45</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Pipelines List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Pipelines do Sistema</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Pipeline</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Vendas B2B', stages: 5, deals: 12, conversion: '68%' },
                        { name: 'Vendas B2C', stages: 4, deals: 18, conversion: '72%' },
                        { name: 'Onboarding', stages: 3, deals: 8, conversion: '85%' },
                        { name: 'Suporte', stages: 4, deals: 7, conversion: '92%' }
                      ].map((pipeline, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Workflow className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{pipeline.name}</p>
                              <p className="text-sm text-muted-foreground">{pipeline.stages} etapas</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{pipeline.deals} negócios</span>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              {pipeline.conversion}
                            </span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          case 'etapas':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Etapas</h2>
                  <p className="text-muted-foreground mb-6">Configure etapas dos pipelines</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total de Etapas</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <Layers className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Etapas Ativas</p>
                        <p className="text-2xl font-bold">20</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Média de Conversão</p>
                        <p className="text-2xl font-bold">75%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Stages List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Etapas dos Pipelines</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Nova Etapa</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Prospecção', pipeline: 'Vendas B2B', deals: 8, conversion: '60%' },
                        { name: 'Qualificação', pipeline: 'Vendas B2B', deals: 5, conversion: '75%' },
                        { name: 'Proposta', pipeline: 'Vendas B2B', deals: 3, conversion: '80%' },
                        { name: 'Negociação', pipeline: 'Vendas B2B', deals: 2, conversion: '85%' },
                        { name: 'Fechamento', pipeline: 'Vendas B2B', deals: 1, conversion: '90%' }
                      ].map((stage, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Layers className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">{stage.name}</p>
                              <p className="text-sm text-muted-foreground">{stage.pipeline}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{stage.deals} negócios</span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              {stage.conversion}
                            </span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          case 'templates':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Templates</h2>
                  <p className="text-muted-foreground mb-6">Gerencie templates de documentos e processos</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Templates Ativos</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                        <p className="text-2xl font-bold">4</p>
                      </div>
                      <Tag className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Usos este Mês</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Templates List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Templates Disponíveis</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Template</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Proposta Comercial', category: 'Vendas', uses: 45, lastUsed: '2 dias atrás' },
                        { name: 'Contrato Padrão', category: 'Legal', uses: 23, lastUsed: '1 semana atrás' },
                        { name: 'Relatório Mensal', category: 'Relatórios', uses: 12, lastUsed: '3 dias atrás' },
                        { name: 'Orçamento', category: 'Financeiro', uses: 67, lastUsed: '1 dia atrás' }
                      ].map((template, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground">{template.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{template.uses} usos</span>
                            <span className="text-sm text-muted-foreground">{template.lastUsed}</span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          default:
            return <div>Tab não encontrada</div>;
        }

      case 'services':
        switch (tabId) {
          case 'servicos':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Serviços</h2>
                  <p className="text-muted-foreground mb-6">Gerencie serviços oferecidos pela empresa</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Serviços Ativos</p>
                        <p className="text-2xl font-bold">18</p>
                      </div>
                      <Wrench className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <Tag className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                        <p className="text-2xl font-bold">R$ 45.200</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Services List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Serviços Cadastrados</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Serviço</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Desenvolvimento Web', category: 'Tecnologia', price: 'R$ 5.000', status: 'Ativo' },
                        { name: 'Consultoria Empresarial', category: 'Consultoria', price: 'R$ 3.500', status: 'Ativo' },
                        { name: 'Design Gráfico', category: 'Design', price: 'R$ 2.800', status: 'Ativo' },
                        { name: 'Marketing Digital', category: 'Marketing', price: 'R$ 4.200', status: 'Inativo' }
                      ].map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Wrench className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground">{service.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium">{service.price}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              service.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {service.status}
                            </span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          case 'categorias':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Categorias</h2>
                  <p className="text-muted-foreground mb-6">Gerencie categorias de produtos e serviços</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Categorias Ativas</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <Tag className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <Package className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Serviços</p>
                        <p className="text-2xl font-bold">18</p>
                      </div>
                      <Wrench className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Categories List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Categorias do Sistema</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Nova Categoria</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Tecnologia', items: 8, color: 'blue', description: 'Produtos e serviços de TI' },
                        { name: 'Marketing', items: 5, color: 'green', description: 'Serviços de marketing digital' },
                        { name: 'Consultoria', items: 3, color: 'purple', description: 'Serviços de consultoria' },
                        { name: 'Design', items: 4, color: 'orange', description: 'Serviços de design gráfico' }
                      ].map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 bg-${category.color}-100 rounded-full flex items-center justify-center`}>
                              <Tag className={`w-4 h-4 text-${category.color}-600`} />
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{category.items} itens</span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          default:
            return <div>Tab não encontrada</div>;
        }

      case 'communications':
        switch (tabId) {
          case 'modelos-email':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Modelos de Email</h2>
                  <p className="text-muted-foreground mb-6">Gerencie templates de email para comunicação</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Modelos Ativos</p>
                        <p className="text-2xl font-bold">15</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Enviados este Mês</p>
                        <p className="text-2xl font-bold">1.247</p>
                      </div>
                      <Mail className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Taxa de Abertura</p>
                        <p className="text-2xl font-bold">68%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Email Templates List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Modelos de Email</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Modelo</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Boas-vindas', category: 'Onboarding', sent: 156, openRate: '72%' },
                        { name: 'Recuperação de Senha', category: 'Segurança', sent: 89, openRate: '45%' },
                        { name: 'Confirmação de Pedido', category: 'Vendas', sent: 234, openRate: '85%' },
                        { name: 'Relatório Mensal', category: 'Relatórios', sent: 67, openRate: '68%' }
                      ].map((template, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground">{template.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{template.sent} enviados</span>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              {template.openRate}
                            </span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          case 'notificacoes':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Notificações</h2>
                  <p className="text-muted-foreground mb-6">Configure notificações do sistema</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Notificações Ativas</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <Bell className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Enviadas Hoje</p>
                        <p className="text-2xl font-bold">89</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Taxa de Leitura</p>
                        <p className="text-2xl font-bold">92%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Notifications List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Configurações de Notificação</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Nova Notificação</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'Novo Cliente', type: 'Email + Push', status: 'Ativo', frequency: 'Imediato' },
                        { name: 'Pagamento Recebido', type: 'Email', status: 'Ativo', frequency: 'Imediato' },
                        { name: 'Relatório Semanal', type: 'Email', status: 'Ativo', frequency: 'Semanal' },
                        { name: 'Backup Completo', type: 'Push', status: 'Inativo', frequency: 'Diário' }
                      ].map((notification, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Bell className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">{notification.name}</p>
                              <p className="text-sm text-muted-foreground">{notification.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{notification.frequency}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              notification.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {notification.status}
                            </span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          case 'templates-comunicacao':
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Templates de Comunicação</h2>
                  <p className="text-muted-foreground mb-6">Gerencie templates para diferentes canais</p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Templates Ativos</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Canais</p>
                        <p className="text-2xl font-bold">4</p>
                      </div>
                      <Globe className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Usos este Mês</p>
                        <p className="text-2xl font-bold">342</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Communication Templates List */}
                <div className="rounded-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Templates de Comunicação</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Novo Template</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {[
                        { name: 'WhatsApp - Boas-vindas', channel: 'WhatsApp', uses: 89, lastUsed: '2 dias atrás' },
                        { name: 'SMS - Confirmação', channel: 'SMS', uses: 156, lastUsed: '1 dia atrás' },
                        { name: 'Push - Promoção', channel: 'Push', uses: 234, lastUsed: '3 dias atrás' },
                        { name: 'Email - Newsletter', channel: 'Email', uses: 67, lastUsed: '1 semana atrás' }
                      ].map((template, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground">{template.channel}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">{template.uses} usos</span>
                            <span className="text-sm text-muted-foreground">{template.lastUsed}</span>
                            <button className="p-1 hover:bg-muted rounded">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            
          default:
            return <div>Tab não encontrada</div>;
        }
        
      default:
        return <div>Seção não encontrada</div>;
    }
  };

  return (
    <div className="flex h-full">
      <SettingsSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h1>
            <p className="text-muted-foreground">Gerencie todas as configurações do seu sistema</p>
          </div>
          
          <SectionTabs 
            section={activeSection}
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <div className="mt-6">
            {getTabContent(activeSection, activeTab)}
          </div>
        </div>
      </div>
    </div>
  );
}
