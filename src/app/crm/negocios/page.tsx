import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { RequireScope } from '@/components/auth/RequireScope';
import { Plus, Search, Filter, MoreHorizontal, TrendingUp, Calendar, DollarSign, User } from 'lucide-react';

export default async function NegociosPage() {
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'crm:read')) redirect('/403');

  // Mock data
  const negocios = [
    {
      id: 1,
      titulo: 'Implementação de ERP',
      cliente: 'TechCorp Ltda',
      valor: 150000,
      probabilidade: 80,
      etapa: 'Proposta',
      proximoContato: '2024-01-15',
      responsavel: 'João Silva',
      status: 'ativo'
    },
    {
      id: 2,
      titulo: 'Consultoria em Marketing Digital',
      cliente: 'StartupXYZ',
      valor: 45000,
      probabilidade: 60,
      etapa: 'Negociação',
      proximoContato: '2024-01-20',
      responsavel: 'Maria Santos',
      status: 'ativo'
    },
    {
      id: 3,
      titulo: 'Desenvolvimento de App Mobile',
      cliente: 'InnovationLab',
      valor: 85000,
      probabilidade: 90,
      etapa: 'Fechamento',
      proximoContato: '2024-01-10',
      responsavel: 'Carlos Oliveira',
      status: 'ativo'
    }
  ];

  const stats = [
    { label: 'Total de Negócios', value: '24', change: '+12%', icon: TrendingUp },
    { label: 'Valor Total', value: 'R$ 2.4M', change: '+8%', icon: DollarSign },
    { label: 'Taxa de Conversão', value: '68%', change: '+5%', icon: TrendingUp },
    { label: 'Tempo Médio', value: '45 dias', change: '-3 dias', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Negócios</h1>
          <p className="text-muted-foreground">Gerencie seus negócios e oportunidades de venda</p>
        </div>
        <RequireScope scopes={m.scopes} need="crm:write">
          <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Novo Negócio
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
            placeholder="Buscar negócios..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-muted transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Negócios Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Negócios Ativos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Negócio</th>
                <th className="text-left p-4 font-medium">Cliente</th>
                <th className="text-left p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Probabilidade</th>
                <th className="text-left p-4 font-medium">Etapa</th>
                <th className="text-left p-4 font-medium">Próximo Contato</th>
                <th className="text-left p-4 font-medium">Responsável</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {negocios.map((negocio) => (
                <tr key={negocio.id} className="border-t hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{negocio.titulo}</p>
                      <p className="text-sm text-muted-foreground">#{negocio.id}</p>
                    </div>
                  </td>
                  <td className="p-4">{negocio.cliente}</td>
                  <td className="p-4">
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(negocio.valor)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-muted rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${negocio.probabilidade}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{negocio.probabilidade}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {negocio.etapa}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{negocio.proximoContato}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      {negocio.responsavel}
                    </div>
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
