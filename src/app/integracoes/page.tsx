import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { RequireScope } from '@/components/auth/RequireScope';
import { Plus, Search, Filter, MoreHorizontal, Zap, CheckCircle, XCircle, Clock, Settings, ExternalLink, RefreshCw } from 'lucide-react';

export default async function IntegracoesPage() {
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'integrations:manage')) redirect('/403');

  // Mock data
  const integracoes = [
    {
      id: 1,
      nome: 'WhatsApp Business',
      categoria: 'comunicacao',
      status: 'ativa',
      ultimaSincronizacao: '2024-01-15 14:30',
      proximaSincronizacao: '2024-01-15 15:30',
      tipo: 'api',
      descricao: 'Integração com WhatsApp Business para envio de mensagens'
    },
    {
      id: 2,
      nome: 'Google Calendar',
      categoria: 'produtividade',
      status: 'ativa',
      ultimaSincronizacao: '2024-01-15 13:45',
      proximaSincronizacao: '2024-01-15 14:45',
      tipo: 'oauth',
      descricao: 'Sincronização de eventos e compromissos'
    },
    {
      id: 3,
      nome: 'Banco Inter',
      categoria: 'financeiro',
      status: 'configurando',
      ultimaSincronizacao: null,
      proximaSincronizacao: null,
      tipo: 'api',
      descricao: 'Integração bancária para pagamentos e recebimentos'
    },
    {
      id: 4,
      nome: 'Asaas',
      categoria: 'financeiro',
      status: 'inativa',
      ultimaSincronizacao: '2024-01-10 09:15',
      proximaSincronizacao: null,
      tipo: 'webhook',
      descricao: 'Processamento de pagamentos e cobranças'
    },
    {
      id: 5,
      nome: 'Clicksign',
      categoria: 'documentos',
      status: 'ativa',
      ultimaSincronizacao: '2024-01-15 12:00',
      proximaSincronizacao: '2024-01-15 13:00',
      tipo: 'api',
      descricao: 'Assinatura digital de documentos'
    },
    {
      id: 6,
      nome: 'Mailchimp',
      categoria: 'marketing',
      status: 'erro',
      ultimaSincronizacao: '2024-01-14 16:20',
      proximaSincronizacao: '2024-01-15 16:20',
      tipo: 'api',
      descricao: 'Automação de email marketing'
    }
  ];

  const stats = [
    { label: 'Integrações Ativas', value: '8', change: '+2', icon: CheckCircle },
    { label: 'Com Erro', value: '1', change: '-1', icon: XCircle },
    { label: 'Sincronizações (Hoje)', value: '156', change: '+12%', icon: RefreshCw },
    { label: 'Tempo Médio', value: '2.3s', change: '-0.5s', icon: Clock }
  ];

  const categorias = [
    { id: 'comunicacao', label: 'Comunicação', count: 3 },
    { id: 'financeiro', label: 'Financeiro', count: 2 },
    { id: 'produtividade', label: 'Produtividade', count: 2 },
    { id: 'marketing', label: 'Marketing', count: 1 },
    { id: 'documentos', label: 'Documentos', count: 1 }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativa: { label: 'Ativa', class: 'bg-green-100 text-green-800' },
      inativa: { label: 'Inativa', class: 'bg-gray-100 text-gray-800' },
      configurando: { label: 'Configurando', class: 'bg-yellow-100 text-yellow-800' },
      erro: { label: 'Erro', class: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      api: { label: 'API', class: 'bg-blue-100 text-blue-800' },
      oauth: { label: 'OAuth', class: 'bg-purple-100 text-purple-800' },
      webhook: { label: 'Webhook', class: 'bg-orange-100 text-orange-800' }
    };
    const config = tipoConfig[tipo as keyof typeof tipoConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrações</h1>
          <p className="text-muted-foreground">Gerencie as integrações com serviços externos</p>
        </div>
        <RequireScope scopes={m.scopes} need="integrations:manage">
          <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nova Integração
          </button>
        </RequireScope>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-primary/20" />
              </div>
              <p className="text-xs text-green-600 mt-1">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Categorias */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Categorias de Integrações</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">{categoria.label}</p>
              <p className="text-xs text-muted-foreground">{categoria.count} integrações</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar integrações..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
        <select className="px-4 py-2 border rounded-md bg-background">
          <option value="">Todos os status</option>
          <option value="ativa">Ativa</option>
          <option value="inativa">Inativa</option>
          <option value="configurando">Configurando</option>
          <option value="erro">Erro</option>
        </select>
        <button className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-muted transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Integrações Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integracoes.map((integracao) => (
          <div key={integracao.id} className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">#{integracao.id}</span>
              </div>
              {getStatusBadge(integracao.status)}
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{integracao.nome}</h3>
            <p className="text-sm text-muted-foreground mb-4">{integracao.descricao}</p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                {getTipoBadge(integracao.tipo)}
              </div>
              
              {integracao.ultimaSincronizacao && (
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Última: {integracao.ultimaSincronizacao}</span>
                </div>
              )}
              
              {integracao.proximaSincronizacao && (
                <div className="flex items-center text-sm">
                  <RefreshCw className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Próxima: {integracao.proximaSincronizacao}</span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 text-sm border rounded-md hover:bg-muted transition-colors flex items-center justify-center">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </button>
              <button className="p-2 border rounded-md hover:bg-muted transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integrações Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Todas as Integrações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Integração</th>
                <th className="text-left p-4 font-medium">Categoria</th>
                <th className="text-left p-4 font-medium">Tipo</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Última Sincronização</th>
                <th className="text-left p-4 font-medium">Próxima Sincronização</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {integracoes.map((integracao) => (
                <tr key={integracao.id} className="border-t hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{integracao.nome}</p>
                      <p className="text-sm text-muted-foreground">{integracao.descricao}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize">{integracao.categoria}</span>
                  </td>
                  <td className="p-4">
                    {getTipoBadge(integracao.tipo)}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(integracao.status)}
                  </td>
                  <td className="p-4 text-sm">
                    {integracao.ultimaSincronizacao || '-'}
                  </td>
                  <td className="p-4 text-sm">
                    {integracao.proximaSincronizacao || '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-muted rounded" title="Configurar">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded" title="Sincronizar">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded" title="Mais opções">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
