import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { RequireScope } from '@/components/auth/RequireScope';
import { Plus, Search, Filter, MoreHorizontal, FolderOpen, Calendar, Users, Target, Clock, CheckCircle, AlertCircle, Pause } from 'lucide-react';

export default async function ProjetosPage() {
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'projects:read')) redirect('/403');

  // Mock data
  const projetos = [
    {
      id: 1,
      titulo: 'Implementação ERP Nexus',
      cliente: 'TechCorp Ltda',
      status: 'em_andamento',
      progresso: 75,
      dataInicio: '2024-01-01',
      dataFim: '2024-03-31',
      responsavel: 'João Silva',
      equipe: 5,
      orcamento: 150000
    },
    {
      id: 2,
      titulo: 'Desenvolvimento App Mobile',
      cliente: 'StartupXYZ',
      status: 'concluido',
      progresso: 100,
      dataInicio: '2023-10-01',
      dataFim: '2023-12-31',
      responsavel: 'Maria Santos',
      equipe: 3,
      orcamento: 85000
    },
    {
      id: 3,
      titulo: 'Consultoria Marketing Digital',
      cliente: 'InnovationLab',
      status: 'pausado',
      progresso: 45,
      dataInicio: '2024-01-15',
      dataFim: '2024-04-15',
      responsavel: 'Carlos Oliveira',
      equipe: 2,
      orcamento: 45000
    },
    {
      id: 4,
      titulo: 'Migração de Dados',
      cliente: 'DataFlow Solutions',
      status: 'planejamento',
      progresso: 10,
      dataInicio: '2024-02-01',
      dataFim: '2024-05-31',
      responsavel: 'Ana Costa',
      equipe: 4,
      orcamento: 65000
    }
  ];

  const stats = [
    { label: 'Projetos Ativos', value: '8', change: '+2', icon: Target },
    { label: 'Concluídos (Mês)', value: '3', change: '+1', icon: CheckCircle },
    { label: 'Em Atraso', value: '2', change: '-1', icon: AlertCircle },
    { label: 'Valor Total', value: 'R$ 1.2M', change: '+15%', icon: FolderOpen }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planejamento: { label: 'Planejamento', class: 'bg-blue-100 text-blue-800' },
      em_andamento: { label: 'Em Andamento', class: 'bg-green-100 text-green-800' },
      pausado: { label: 'Pausado', class: 'bg-yellow-100 text-yellow-800' },
      concluido: { label: 'Concluído', class: 'bg-gray-100 text-gray-800' },
      cancelado: { label: 'Cancelado', class: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    const iconMap = {
      planejamento: Clock,
      em_andamento: Target,
      pausado: Pause,
      concluido: CheckCircle,
      cancelado: AlertCircle
    };
    const Icon = iconMap[status as keyof typeof iconMap] || Target;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-muted-foreground">Gerencie todos os projetos da empresa</p>
        </div>
        <RequireScope scopes={m.scopes} need="projects:write">
          <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
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

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
        <select className="px-4 py-2 border rounded-md bg-background">
          <option value="">Todos os status</option>
          <option value="planejamento">Planejamento</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="pausado">Pausado</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-muted transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Projetos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projetos.map((projeto) => (
          <div key={projeto.id} className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getStatusIcon(projeto.status)}
                <span className="ml-2 text-sm text-muted-foreground">#{projeto.id}</span>
              </div>
              {getStatusBadge(projeto.status)}
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{projeto.titulo}</h3>
            <p className="text-sm text-muted-foreground mb-4">{projeto.cliente}</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{projeto.progresso}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${projeto.progresso}%` }}
                ></div>
              </div>
            </div>
            
            {/* Project Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{projeto.dataInicio} - {projeto.dataFim}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{projeto.equipe} membros</span>
              </div>
              <div className="flex items-center text-sm">
                <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{projeto.responsavel}</span>
              </div>
            </div>
            
            {/* Budget */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Orçamento</span>
              <span className="font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(projeto.orcamento)}
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 text-sm border rounded-md hover:bg-muted transition-colors">
                Ver Detalhes
              </button>
              <button className="p-2 border rounded-md hover:bg-muted transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Projetos Table (Alternative View) */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Lista de Projetos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Projeto</th>
                <th className="text-left p-4 font-medium">Cliente</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Progresso</th>
                <th className="text-left p-4 font-medium">Responsável</th>
                <th className="text-left p-4 font-medium">Orçamento</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((projeto) => (
                <tr key={projeto.id} className="border-t hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{projeto.titulo}</p>
                      <p className="text-sm text-muted-foreground">#{projeto.id}</p>
                    </div>
                  </td>
                  <td className="p-4">{projeto.cliente}</td>
                  <td className="p-4">
                    {getStatusBadge(projeto.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-20 bg-muted rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${projeto.progresso}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{projeto.progresso}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      {projeto.responsavel}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(projeto.orcamento)}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
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