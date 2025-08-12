import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

export default async function Page(){
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'dashboard:view')) redirect('/403');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">MRR</p>
              <p className="text-2xl font-bold">R$ 45.230</p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+12.5%</span>
                <span className="text-muted-foreground ml-1">vs mês anterior</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Recebimentos Hoje */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recebimentos (Hoje)</p>
              <p className="text-2xl font-bold">R$ 8.450</p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+8.2%</span>
                <span className="text-muted-foreground ml-1">vs ontem</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Atrasadas */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contas Atrasadas</p>
              <p className="text-2xl font-bold">R$ 12.800</p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-500 font-medium">+3.1%</span>
                <span className="text-muted-foreground ml-1">vs semana passada</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Novos Leads */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Novos Leads</p>
              <p className="text-2xl font-bold">24</p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-500 font-medium">+15.3%</span>
                <span className="text-muted-foreground ml-1">vs semana passada</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Receita Mensal</h3>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Gráfico de receita será exibido aqui</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Atividade Recente</h3>
            <button className="text-sm text-primary hover:underline">Ver todas</button>
          </div>
          <div className="space-y-4">
            {[
              { action: 'Nova cobrança criada', time: '2 min atrás', type: 'finance' },
              { action: 'Lead convertido em cliente', time: '15 min atrás', type: 'crm' },
              { action: 'Projeto finalizado', time: '1 hora atrás', type: 'project' },
              { action: 'Pagamento recebido', time: '2 horas atrás', type: 'finance' },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'finance' ? 'bg-green-500' :
                  item.type === 'crm' ? 'bg-blue-500' :
                  'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
