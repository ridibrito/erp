'use client';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { can } from '@/lib/authz';
import { 
  Plus, 
  Filter, 
  Search, 
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ProjetosPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const permissions = user.permissions || [];

  if (!can(permissions, 'projects:read')) {
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

  // Dados mock para demonstração
  const projects = [
    {
      id: '1',
      name: 'Sistema de Gestão ERP',
      client: 'Empresa ABC Ltda',
      status: 'active',
      progress: 75,
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      budget: 50000.00,
      spent: 37500.00,
      team: ['João Silva', 'Maria Santos', 'Pedro Costa']
    },
    {
      id: '2',
      name: 'Website Corporativo',
      client: 'João Silva',
      status: 'completed',
      progress: 100,
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      budget: 15000.00,
      spent: 15000.00,
      team: ['Ana Lima', 'Carlos Oliveira']
    },
    {
      id: '3',
      name: 'App Mobile',
      client: 'Maria Santos',
      status: 'planning',
      progress: 25,
      startDate: '2024-02-01',
      endDate: '2024-05-01',
      budget: 80000.00,
      spent: 20000.00,
      team: ['Pedro Costa', 'Ana Lima', 'João Silva']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'active':
        return 'Ativo';
      case 'planning':
        return 'Planejamento';
      case 'on-hold':
        return 'Pausado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'planning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
            <p className="text-gray-600 mt-1">Gerencie seus projetos e equipes</p>
          </div>
          <div className="flex space-x-3">
            {can(permissions, 'projects:write') && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Novo Projeto</span>
              </button>
            )}
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome do projeto ou cliente..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os status</option>
              <option value="planning">Planejamento</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="on-hold">Pausado</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orçamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prazo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.team.length} membros
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project.client}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{getStatusText(project.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(project.budget)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Gasto: {formatCurrency(project.spent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(project.endDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Início: {formatDate(project.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {can(permissions, 'projects:read') && (
                          <button className="p-2 text-muted-foreground hover:text-blue-500 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {can(permissions, 'projects:write') && (
                          <button className="p-2 text-muted-foreground hover:text-green-500 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {can(permissions, 'projects:write') && (
                          <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}