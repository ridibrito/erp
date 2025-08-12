import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { RequireScope } from '@/components/auth/RequireScope';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Download, Eye, Filter, FileText, Target, Activity, Building2 } from 'lucide-react';

export default async function OutrosRelatoriosPage() {
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'reports:view')) redirect('/403');

  const relatorios = [
    {
      id: 1,
      titulo: 'Relatório de Performance de Vendas',
      descricao: 'Análise de performance por vendedor e região',
      categoria: 'vendas',
      periodo: 'Janeiro 2024',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-15 14:30'
    },
    {
      id: 2,
      titulo: 'Análise de Clientes',
      descricao: 'Segmentação e comportamento dos clientes',
      categoria: 'crm',
      periodo: 'Últimos 3 meses',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-14 09:15'
    },
    {
      id: 3,
      titulo: 'Relatório de Projetos',
      descricao: 'Status e progresso de todos os projetos ativos',
      categoria: 'projetos',
      periodo: 'Janeiro 2024',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-15 10:45'
    },
    {
      id: 4,
      titulo: 'Análise de Produtividade',
      descricao: 'Métricas de produtividade por equipe',
      categoria: 'rh',
      periodo: 'Janeiro 2024',
      status: 'gerando',
      ultimaAtualizacao: '2024-01-15 16:20'
    },
    {
      id: 5,
      titulo: 'Relatório de Integrações',
      descricao: 'Status e performance das integrações',
      categoria: 'tecnologia',
      periodo: 'Últimos 7 dias',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-15 12:00'
    },
    {
      id: 6,
      titulo: 'Análise de Marketing',
      descricao: 'Efetividade das campanhas de marketing',
      categoria: 'marketing',
      periodo: 'Último trimestre',
      status: 'disponivel',
      ultimaAtualizacao: '2024-01-10 11:30'
    }
  ];

  const stats = [
    { label: 'Total de Relatórios', value: '24', change: '+3', icon: FileText },
    { label: 'Categorias', value: '8', change: '+1', icon: Target },
    { label: 'Downloads (Mês)', value: '89', change: '+22%', icon: Download },
    { label: 'Visualizações (Mês)', value: '234', change: '+15%', icon: Eye }
  ];

  const categorias = [
    { id: 'vendas', label: 'Vendas', icon: TrendingUp, count: 5 },
    { id: 'crm', label: 'CRM', icon: Users, count: 4 },
    { id: 'projetos', label: 'Projetos', icon: Target, count: 3 },
    { id: 'rh', label: 'Recursos Humanos', icon: Users, count: 2 },
    { id: 'tecnologia', label: 'Tecnologia', icon: Building2, count: 3 },
    { id: 'marketing', label: 'Marketing', icon: Activity, count: 2 }
  ];

  const getCategoriaIcon = (categoria: string) => {
    const iconMap = {
      'vendas': TrendingUp,
      'crm': Users,
      'projetos': Target,
      'rh': Users,
      'tecnologia': Building2,
      'marketing': Activity
    };
    const Icon = iconMap[categoria as keyof typeof iconMap] || FileText;
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
          <h1 className="text-2xl font-bold">Outros Relatórios</h1>
          <p className="text-muted-foreground">Relatórios específicos por área e funcionalidade</p>
        </div>
        <RequireScope scopes={m.scopes} need="reports:view">
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

      {/* Categorias */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Categorias de Relatórios</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((categoria) => {
            const Icon = categoria.icon;
            return (
              <button
                key={categoria.id}
                className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">{categoria.label}</p>
                <p className="text-xs text-muted-foreground">{categoria.count} relatórios</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar relatórios..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
        <select className="px-4 py-2 border rounded-md bg-background">
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
        <select className="px-4 py-2 border rounded-md bg-background">
          <option value="">Todos os períodos</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="3m">Último trimestre</option>
          <option value="1y">Último ano</option>
        </select>
      </div>

      {/* Relatórios Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Todos os Relatórios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Relatório</th>
                <th className="text-left p-4 font-medium">Categoria</th>
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
                      {getCategoriaIcon(relatorio.categoria)}
                      <span className="ml-2 capitalize">{relatorio.categoria}</span>
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
