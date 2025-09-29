'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { can } from '@/lib/authz';
import { useToastHelpers } from '@/components/ui/toast';
import { CRMService, Company } from '@/services/crmService';
import { AvatarUpload } from '@/components/crm/AvatarUpload';
import { EditForm } from '@/components/crm/EditForm';
import { 
  ArrowLeft, 
  FileText,
  Building2,
  Users,
  MessageCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  FileText as DocumentIcon,
  TrendingUp,
  UserPlus,
  Clock,
  Eye,
  MessageSquare,
  Upload,
  Plus,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface Interaction {
  id: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'task';
  title: string;
  content: string;
  user: {
    name: string;
    avatar?: string;
  };
  date: string;
  contacts?: string[];
  attachments?: string[];
  status?: 'completed' | 'pending' | 'cancelled';
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
}

interface Business {
  id: string;
  name: string;
  value: number;
  status: 'prospect' | 'negotiation' | 'closed' | 'lost';
  probability: number;
  expectedCloseDate: string;
}

interface Proposal {
  id: string;
  title: string;
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  sentDate: string;
  validUntil: string;
}

interface Sale {
  id: string;
  product: string;
  value: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToastHelpers();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newInteraction, setNewInteraction] = useState('');
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      if (!user?.orgId) return;
      
      try {
        setLoading(true);
        const companies = await CRMService.getCompanies(user.orgId);
        const foundCompany = companies.find((c: Company) => c.id === params.id);
        
        if (foundCompany) {
          setCompany(foundCompany);
          const savedAvatar = localStorage.getItem(`company_avatar_${foundCompany.id}`);
          if (savedAvatar) {
            setAvatar(savedAvatar);
          }
        } else {
          router.push('/crm/clientes');
        }
      } catch (err) {
        console.error('Erro ao carregar empresa:', err);
        error('Erro ao carregar', 'Não foi possível carregar os dados da empresa.');
        router.push('/crm/clientes');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [params.id, router, user?.orgId, error]);

  // Carregar dados mock das funcionalidades
  useEffect(() => {
    if (company) {
      // Mock data para interações
      const mockInteractions: Interaction[] = [
        {
          id: '1',
          type: 'email',
          title: 'E-mail',
          content: 'Sua fatura Coruss chegou! Olá **' + (company.fantasy_name || company.name) + '**, Sua fatura referente ao mês **09/2025** já está disponível. Abaixo você encontra todos os detalhes para se organizar com tranquilidade...',
          user: {
            name: 'Ricardo Albuquerque',
            avatar: ''
          },
          date: '2024-09-24T19:30:00Z',
          contacts: [company.fantasy_name || company.name]
        },
        {
          id: '2',
          type: 'phone',
          title: 'Ligação',
          content: 'Ligação realizada para esclarecimento sobre novos produtos e serviços. Cliente demonstrou interesse em seguro empresarial.',
          user: {
            name: 'Ricardo Albuquerque',
            avatar: ''
          },
          date: '2024-09-17T08:42:00Z',
          contacts: [company.fantasy_name || company.name]
        }
      ];
      setInteractions(mockInteractions);

      // Mock data para tarefas
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Enviar proposta comercial',
          description: 'Preparar e enviar proposta para campanha de marketing digital',
          dueDate: '2024-09-30',
          status: 'pending',
          priority: 'high',
          assignedTo: 'Ricardo Albuquerque'
        }
      ];
      setTasks(mockTasks);

      // Mock data para negócios
      const mockBusinesses: Business[] = [
        {
          id: '1',
          name: 'Campanha Marketing Digital',
          value: 50000,
          status: 'negotiation',
          probability: 75,
          expectedCloseDate: '2024-10-15'
        }
      ];
      setBusinesses(mockBusinesses);

      // Mock data para propostas
      const mockProposals: Proposal[] = [
        {
          id: '1',
          title: 'Proposta Campanha Q4 2024',
          value: 45000,
          status: 'sent',
          sentDate: '2024-09-20',
          validUntil: '2024-10-20'
        }
      ];
      setProposals(mockProposals);

      // Mock data para vendas
      const mockSales: Sale[] = [
        {
          id: '1',
          product: 'Gestão de Redes Sociais',
          value: 15000,
          date: '2024-08-15',
          status: 'completed'
        }
      ];
      setSales(mockSales);

      // Mock data para contatos vinculados
      const mockContacts = [
        {
          id: '1',
          name: 'João Silva',
          position: 'Diretor de Marketing',
          email: 'joao@empresa.com',
          phone: '(11) 99999-9999'
        }
      ];
      setContacts(mockContacts);
    }
  }, [company]);

  if (!user) {
    return null;
  }

  const permissions = user.permissions || [];
  if (!can(permissions, 'crm.clients.view')) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!company) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h2>
            <p className="text-gray-600">A empresa solicitada não foi encontrada.</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const getDisplayName = () => {
    return company.fantasy_name || company.name || 'Empresa sem nome';
  };

  const getSubtitle = () => {
    return company.name || 'Pessoa Jurídica';
  };

  const handleEdit = () => {
    if (company) {
      setEditingData({ ...company });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingData(null);
  };

  const handleSaveEdit = async (updatedData: Company) => {
    if (!company) return;
    
    try {
      await CRMService.updateCompany(company.id, updatedData);
      setCompany(updatedData);
      setIsEditing(false);
      setEditingData(null);
      success('Empresa atualizada', 'Dados da empresa foram atualizados com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar empresa:', err);
      throw err;
    }
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setAvatar(avatarUrl);
    if (company) {
      localStorage.setItem(`company_avatar_${company.id}`, avatarUrl);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'draft':
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiation':
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      active: 'Ativo',
      inactive: 'Inativo',
      prospect: 'Prospect',
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      negotiation: 'Em Negociação',
      closed: 'Fechado',
      lost: 'Perdido',
      draft: 'Rascunho',
      sent: 'Enviado',
      accepted: 'Aceito',
      rejected: 'Rejeitado'
    };
    return labels[status] || status;
  };

  const handleAddInteraction = () => {
    if (newInteraction.trim()) {
      const interaction: Interaction = {
        id: Date.now().toString(),
        type: 'note',
        title: 'Anotação',
        content: newInteraction,
        user: {
          name: user?.name || 'Usuário',
          avatar: ''
        },
        date: new Date().toISOString(),
        contacts: [company?.fantasy_name || company?.name || '']
      };
      setInteractions([interaction, ...interactions]);
      setNewInteraction('');
      setShowInteractionForm(false);
      success('Interação adicionada', 'Nova interação foi registrada com sucesso!');
    }
  };

  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-gray-50">
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <AvatarUpload
                currentAvatar={avatar}
                onAvatarChange={handleAvatarChange}
                type="company"
                size="lg"
              />
              <h1 className="text-xl font-semibold text-gray-900">{getDisplayName()}</h1>
              <p className="text-sm text-gray-500">{getSubtitle()}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  DADOS BÁSICOS
                </h3>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Editar
                  </button>
                )}
              </div>
              {isEditing && editingData ? (
                <EditForm
                  data={editingData}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  type="company"
                />
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Nome Fantasia</label>
                    <p className="text-sm text-gray-900">{getDisplayName()}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Razão Social</label>
                    <p className="text-sm text-gray-900">{company.name}</p>
                  </div>
                  
                  {company.document && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">CNPJ</label>
                      <p className="text-sm text-gray-900">{company.document}</p>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Telefones</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-900">{company.phone}</p>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">W</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">E-mail</label>
                    <p className="text-sm text-gray-900">{company.email}</p>
                  </div>
                  
                  {company.address && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Endereço</label>
                      <p className="text-sm text-gray-900">
                        {company.address.street}, {company.address.number}
                        {company.address.complement && `, ${company.address.complement}`}
                        <br />
                        {company.address.neighborhood} - {company.address.city}/{company.address.state}
                        <br />
                        CEP: {company.address.zipcode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                OUTRAS INFORMAÇÕES
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : company.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {company.status === 'active' ? 'Ativo' : 
                     company.status === 'inactive' ? 'Inativo' : 'Prospect'}
                  </span>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Responsável</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <p className="text-sm text-gray-900">Ricardo Albuquerque</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Header com abas */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/crm/clientes')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">{getDisplayName()}</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                    Opções
                  </button>
                </div>
              </div>
            </div>
            
            {/* Abas */}
            <div className="px-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'timeline', label: 'Linha do tempo', count: null },
                  { id: 'contacts', label: 'Pessoas', count: contacts.length },
                  { id: 'businesses', label: 'Negócios', count: businesses.length },
                  { id: 'proposals', label: 'Propostas', count: proposals.length },
                  { id: 'sales', label: 'Vendas', count: sales.length },
                  { id: 'tasks', label: 'Tarefas', count: tasks.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Conteúdo das abas */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                {/* Ações rápidas */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <button 
                      onClick={() => setShowInteractionForm(!showInteractionForm)}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Registrar interação</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      <Calendar className="h-4 w-4" />
                      <span>Agendar tarefa</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      <Mail className="h-4 w-4" />
                      <span>Enviar e-mail</span>
                    </button>
                  </div>
                  
                  {showInteractionForm && (
                    <div className="space-y-3 mb-4">
                      <textarea
                        value={newInteraction}
                        onChange={(e) => setNewInteraction(e.target.value)}
                        placeholder="Descreva a interação com o cliente..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleAddInteraction}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setShowInteractionForm(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tarefas em aberto */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tarefas em aberto</h3>
                  {tasks.filter(task => task.status === 'pending').length > 0 ? (
                    <div className="space-y-3">
                      {tasks.filter(task => task.status === 'pending').map((task) => (
                        <div key={task.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                            <p className="text-xs text-gray-500">Vence em: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-gray-400" />
                      </div>
                      <p>Nenhuma tarefa agendada. Clique aqui para criar.</p>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-4">
                      <button className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        Histórico completo
                      </button>
                      <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-sm">
                        Interações
                      </button>
                      <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-sm">
                        Modificações
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-sm">
                        Filtrar
                      </button>
                      <button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-sm">
                        Todas as atividades
                      </button>
                    </div>
                  </div>

                  {/* Lista de interações */}
                  <div className="space-y-6">
                    {interactions.map((interaction) => (
                      <div key={interaction.id} className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs font-bold">R</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{interaction.user.name}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{formatDate(interaction.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-600">{interaction.title}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{interaction.content}</p>
                          {interaction.contacts && (
                            <div className="flex items-center space-x-2 mb-3">
                              {interaction.contacts.map((contactName, index) => (
                                <div key={index} className="flex items-center space-x-1">
                                  <div className="h-4 w-4 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 text-xs">🏢</span>
                                  </div>
                                  <span className="text-xs text-gray-600">{contactName}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
                              <Eye className="h-4 w-4" />
                              <span>Visualizar</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
                              <MessageSquare className="h-4 w-4" />
                              <span>0</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(interaction.date).toLocaleDateString('pt-BR')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Pessoas vinculadas</h3>
                  <button className="flex items-center space-x-2 px-3 py-1 text-sm text-primary hover:text-primary/80">
                    <UserPlus className="h-4 w-4" />
                    <span>Adicionar contato</span>
                  </button>
                </div>
                {contacts.length > 0 ? (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {contact.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{contact.email}</p>
                          <p className="text-xs text-gray-500">{contact.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <p>Nenhum contato vinculado a esta empresa.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'businesses' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Negócios</h3>
                  <button className="flex items-center space-x-2 px-3 py-1 text-sm text-primary hover:text-primary/80">
                    <Plus className="h-4 w-4" />
                    <span>Novo negócio</span>
                  </button>
                </div>
                {businesses.length > 0 ? (
                  <div className="space-y-3">
                    {businesses.map((business) => (
                      <div key={business.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{business.name}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(business.status)}`}>
                            {getStatusLabel(business.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Valor:</span>
                            <p className="font-medium">{formatCurrency(business.value)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Probabilidade:</span>
                            <p className="font-medium">{business.probability}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Previsão:</span>
                            <p className="font-medium">{new Date(business.expectedCloseDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-gray-400" />
                    </div>
                    <p>Nenhum negócio encontrado para esta empresa.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'proposals' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Propostas</h3>
                  <button className="flex items-center space-x-2 px-3 py-1 text-sm text-primary hover:text-primary/80">
                    <Plus className="h-4 w-4" />
                    <span>Nova proposta</span>
                  </button>
                </div>
                {proposals.length > 0 ? (
                  <div className="space-y-3">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{proposal.title}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                            {getStatusLabel(proposal.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Valor:</span>
                            <p className="font-medium">{formatCurrency(proposal.value)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Enviada em:</span>
                            <p className="font-medium">{new Date(proposal.sentDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Válida até:</span>
                            <p className="font-medium">{new Date(proposal.validUntil).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DocumentIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p>Nenhuma proposta encontrada para esta empresa.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Vendas</h3>
                  <button className="flex items-center space-x-2 px-3 py-1 text-sm text-primary hover:text-primary/80">
                    <Plus className="h-4 w-4" />
                    <span>Nova venda</span>
                  </button>
                </div>
                {sales.length > 0 ? (
                  <div className="space-y-3">
                    {sales.map((sale) => (
                      <div key={sale.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{sale.product}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                            {getStatusLabel(sale.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Valor:</span>
                            <p className="font-medium">{formatCurrency(sale.value)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Data:</span>
                            <p className="font-medium">{new Date(sale.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="h-6 w-6 text-gray-400" />
                    </div>
                    <p>Nenhuma venda encontrada para esta empresa.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Tarefas</h3>
                  <button className="flex items-center space-x-2 px-3 py-1 text-sm text-primary hover:text-primary/80">
                    <Plus className="h-4 w-4" />
                    <span>Nova tarefa</span>
                  </button>
                </div>
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Vence em:</span>
                            <p className="font-medium">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Prioridade:</span>
                            <p className="font-medium">{task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Responsável:</span>
                            <p className="font-medium">{task.assignedTo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <p>Nenhuma tarefa encontrada para esta empresa.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}