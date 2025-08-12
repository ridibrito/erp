import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { RequireScope } from '@/components/auth/RequireScope';
import { Plus, Search, Filter, MoreHorizontal, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, CreditCard, Banknote } from 'lucide-react';

export default async function MovimentacaoPage() {
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'finance:read')) redirect('/403');

  // Mock data
  const movimentacoes = [
    {
      id: 1,
      descricao: 'Recebimento - Fatura #001',
      tipo: 'receita',
      valor: 15000,
      data: '2024-01-15',
      categoria: 'Vendas',
      conta: 'Banco Principal',
      status: 'confirmado'
    },
    {
      id: 2,
      descricao: 'Pagamento - Fornecedor ABC',
      tipo: 'despesa',
      valor: 8500,
      data: '2024-01-14',
      categoria: 'Fornecedores',
      conta: 'Banco Principal',
      status: 'confirmado'
    },
    {
      id: 3,
      descricao: 'Transferência entre contas',
      tipo: 'transferencia',
      valor: 5000,
      data: '2024-01-13',
      categoria: 'Transferência',
      conta: 'Banco Principal → Caixa',
      status: 'confirmado'
    },
    {
      id: 4,
      descricao: 'Recebimento - Cliente XYZ',
      tipo: 'receita',
      valor: 25000,
      data: '2024-01-12',
      categoria: 'Vendas',
      conta: 'Banco Principal',
      status: 'pendente'
    },
    {
      id: 5,
      descricao: 'Pagamento - Aluguel',
      tipo: 'despesa',
      valor: 12000,
      data: '2024-01-11',
      categoria: 'Despesas Operacionais',
      conta: 'Banco Principal',
      status: 'confirmado'
    }
  ];

  const stats = [
    { label: 'Receitas (Mês)', value: 'R$ 125K', change: '+15%', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Despesas (Mês)', value: 'R$ 89K', change: '+8%', icon: TrendingDown, color: 'text-red-600' },
    { label: 'Saldo Atual', value: 'R$ 456K', change: '+7%', icon: DollarSign, color: 'text-blue-600' },
    { label: 'Transações (Mês)', value: '156', change: '+12%', icon: Calendar, color: 'text-purple-600' }
  ];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'receita':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'despesa':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case 'transferencia':
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmado: { label: 'Confirmado', class: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
      cancelado: { label: 'Cancelado', class: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
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
          <h1 className="text-2xl font-bold">Movimentação Financeira</h1>
          <p className="text-muted-foreground">Acompanhe todas as entradas e saídas financeiras</p>
        </div>
        <RequireScope scopes={m.scopes} need="finance:write">
          <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
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
                <Icon className={`w-8 h-8 ${stat.color}/20`} />
              </div>
              <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
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
            placeholder="Buscar movimentações..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-muted transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Movimentações Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Histórico de Movimentações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Descrição</th>
                <th className="text-left p-4 font-medium">Tipo</th>
                <th className="text-left p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Data</th>
                <th className="text-left p-4 font-medium">Categoria</th>
                <th className="text-left p-4 font-medium">Conta</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((mov) => (
                <tr key={mov.id} className="border-t hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{mov.descricao}</p>
                      <p className="text-sm text-muted-foreground">#{mov.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {getTipoIcon(mov.tipo)}
                      <span className="ml-2 capitalize">{mov.tipo}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${
                      mov.tipo === 'receita' ? 'text-green-600' : 
                      mov.tipo === 'despesa' ? 'text-red-600' : 
                      'text-blue-600'
                    }`}>
                      {mov.tipo === 'despesa' ? '-' : ''}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(mov.valor)}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{mov.data}</td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {mov.categoria}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Banknote className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{mov.conta}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(mov.status)}
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
