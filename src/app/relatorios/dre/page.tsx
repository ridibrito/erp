import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart
} from 'lucide-react';

export default async function Page(){
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'reports:view')) redirect('/403');
  
  const dreData = {
    periodo: 'Janeiro 2024',
    receitaBruta: 85000.00,
    deducoes: 5000.00,
    receitaLiquida: 80000.00,
    custos: 45000.00,
    lucroBruto: 35000.00,
    despesas: 25000.00,
    lucroLiquido: 10000.00
  };

  const despesasDetalhadas = [
    { categoria: 'Pessoal', valor: 15000.00, percentual: 60 },
    { categoria: 'Marketing', valor: 5000.00, percentual: 20 },
    { categoria: 'Administrativas', valor: 3000.00, percentual: 12 },
    { categoria: 'Outras', valor: 2000.00, percentual: 8 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DRE - Demonstração do Resultado</h1>
          <p className="text-muted-foreground">Demonstração do Resultado do Exercício</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 border border-input rounded-xl">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{dreData.periodo}</span>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* DRE Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Receita Líquida</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold">R$ {dreData.receitaLiquida.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-green-500 mt-1">+12.5% vs mês anterior</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Lucro Bruto</h3>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">R$ {dreData.lucroBruto.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-blue-500 mt-1">+8.2% vs mês anterior</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Despesas</h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold">R$ {dreData.despesas.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-red-500 mt-1">+5.1% vs mês anterior</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Lucro Líquido</h3>
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">R$ {dreData.lucroLiquido.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-green-600 mt-1">+15.3% vs mês anterior</p>
        </div>
      </div>

      {/* DRE Detailed Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">DRE Detalhado</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="font-medium">Receita Bruta</span>
              <span className="font-bold">R$ {dreData.receitaBruta.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">(-) Deduções</span>
              <span className="text-muted-foreground">R$ {dreData.deducoes.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border bg-muted/30 px-3 rounded-lg">
              <span className="font-medium">Receita Líquida</span>
              <span className="font-bold">R$ {dreData.receitaLiquida.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">(-) Custos</span>
              <span className="text-muted-foreground">R$ {dreData.custos.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border bg-muted/30 px-3 rounded-lg">
              <span className="font-medium">Lucro Bruto</span>
              <span className="font-bold">R$ {dreData.lucroBruto.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">(-) Despesas</span>
              <span className="text-muted-foreground">R$ {dreData.despesas.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-primary/10 px-3 rounded-lg">
              <span className="font-bold">Lucro Líquido</span>
              <span className="font-bold text-primary">R$ {dreData.lucroLiquido.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
          <div className="space-y-4">
            {despesasDetalhadas.map((despesa, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{despesa.categoria}</span>
                  <span className="text-sm font-bold">R$ {despesa.valor.toLocaleString('pt-BR')}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${despesa.percentual}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{despesa.percentual}% do total</span>
                  <span>R$ {despesa.valor.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Evolução da Receita</h3>
            <PieChart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Gráfico de evolução será exibido aqui</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Margem de Lucro</h3>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Gráfico de margem será exibido aqui</p>
          </div>
        </div>
      </div>
    </div>
  );
}
