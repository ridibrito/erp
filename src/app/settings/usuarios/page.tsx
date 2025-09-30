"use client";
import { useState } from 'react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Mail, 
  Shield,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

export default function Page(){
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const users = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      role: 'financeiro',
      status: 'active',
      lastLogin: '2024-01-14T15:45:00Z'
    },
    {
      id: 3,
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      role: 'vendedor',
      status: 'inactive',
      lastLogin: '2024-01-10T09:20:00Z'
    },
    {
      id: 4,
      name: 'Ana Oliveira',
      email: 'ana.oliveira@empresa.com',
      role: 'operacional',
      status: 'active',
      lastLogin: '2024-01-15T14:15:00Z'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-600';
      case 'financeiro': return 'bg-green-500/10 text-green-600';
      case 'vendedor': return 'bg-blue-500/10 text-blue-600';
      case 'operacional': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-500/10 text-green-600' 
      : 'bg-gray-500/10 text-gray-600';
  };

  return (
    <div className="flex h-full">
      <SettingsSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar}
        activeSection="users"
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
              <p className="text-muted-foreground">Gerencie usuários e permissões do sistema</p>
            </div>
            <button className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Novo Usuário</span>
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  placeholder="Buscar usuários..." 
                  className="pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-input rounded-xl hover:bg-muted/50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Usuário</th>
                    <th className="text-left p-4 font-medium text-sm">Email</th>
                    <th className="text-left p-4 font-medium text-sm">Papel</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                    <th className="text-left p-4 font-medium text-sm">Último Login</th>
                    <th className="text-right p-4 font-medium text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          <Shield className="w-3 h-3" />
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.lastLogin).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
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

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                </div>
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                </div>
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inativos</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === 'inactive').length}</p>
                </div>
                <div className="w-8 h-8 bg-gray-500/10 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
