import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { RequireScope } from '@/components/auth/RequireScope';
import { BarChart3, PieChart, TrendingUp, TrendingDown, DollarSign, Calendar, Download, Eye, Filter } from 'lucide-react';

export default async function RelatoriosFinanceirosPage() {
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'finance:read')) redirect('/403');

  const relatorios = [
    {
      id: 1,
      titulo: 'Relatório de Fluxo de Caixa',
      descricao: 'Análise detalhada do fluxo de caixa mensal',
      tipo: 'fluxo-caixa',
      periodo: 'Janeiro 2024',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-15 14:30'
    },
    {
      id: 2,
      titulo: 'Análise de Receitas e Despesas',
      descricao: 'Comparativo entre receitas e despesas por categoria',
      tipo: 'receitas-despesas',
      periodo: 'Últimos 6 meses',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-14 09:15'
    },
    {
      id: 3,
      titulo: 'Relatório de Inadimplência',
      descricao: 'Análise de contas a receber em atraso',
      tipo: 'inadimplencia',
      periodo: 'Janeiro 2024',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-15 10:45'
    },
    {
      id: 4,
      titulo: 'Projeção Financeira',
      descricao: 'Projeções de receitas e despesas para os próximos meses',
      tipo: 'projecao',
      periodo: 'Próximos 12 meses',
      status: 'gerando',
      ultimaAtualizacao: '2024-01-15 16:20'
    },
    {
      id: 5,
      titulo: 'Relatório de Fornecedores',
      descricao: 'Análise de gastos por fornecedor',
      tipo: 'fornecedores',
      periodo: '2023',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-10 11:30'
    }
  ];

  const stats = [
    { label: 'Relatórios Disponíveis', value: '12', change: '+2', icon: BarChart3 },
    { label: 'Downloads (Mês)', value: '45', change: '+15%', icon: Download },
    { label: 'Visualizações (Mês)', value: '128', change: '+8%', icon: Eye },
    { label: 'Última Atualização', value: 'Hoje', change: '14:30', icon: Calendar }
  ];

  const getTipoIcon = (tipo: string) => {
    const iconMap = {
      'fluxo-caixa': BarChart3,
      'receitas-despesas': PieChart,
      'inadimplencia': TrendingDown,
      'projecao': TrendingUp,
      'fornecedores': DollarSign
    };
    const Icon = iconMap[tipo as keyof typeof iconMap] || BarChart3;
    return <Icon className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      disponivel: { label: 'Disponível', class: 'bg-green-100 text-green-800' },
      gerando: { label: 'Gerando', class: 'bg-yellow-100 text-yellow-800' },
      erro: { label: 'Erro', class: 'bg-red-100 text-red-800' }
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
          <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Acesse e gerencie relatórios financeiros detalhados</p>
        </div>
        <RequireScope scopes={m.scopes} need="finance:write">
          <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <BarChart3 className="w-4 h-4 mr-2" />
            Gerar Relatório
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Relatórios Populares</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              • Fluxo de Caixa Mensal
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              • DRE Simplificado
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              • Análise de Inadimplência
            </button>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Filtros Rápidos</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              • Últimos 30 dias
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              • Último trimestre
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              • Ano atual
            </button>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Ações</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Exportar Todos
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Configurar Filtros
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Relatórios
            </button>
          </div>
        </div>
      </div>

      {/* Relatórios Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Relatórios Disponíveis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Relatório</th>
                <th className="text-left p-4 font-medium">Tipo</th>
                <th className="text-left p-4 font-medium">Período</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Última Atualização</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {relatorios.map((relatorio) => (
                <tr key={relatorio.id} className="border-t hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{relatorio.titulo}</p>
                      <p className="text-sm text-muted-foreground">{relatorio.descricao}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {getTipoIcon(relatorio.tipo)}
                      <span className="ml-2 capitalize">{relatorio.tipo.replace('-', ' ')}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{relatorio.periodo}</td>
                  <td className="p-4">
                    {getStatusBadge(relatorio.status)}
                  </td>
                  <td className="p-4 text-sm">{relatorio.ultimaAtualizacao}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-muted rounded" title="Visualizar">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded" title="Download">
                        <Download className="w-4 h-4" />
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
