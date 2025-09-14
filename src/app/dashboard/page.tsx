'use client';

import { useAuth } from '@/contexts/AuthContext-simple';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { can } from '@/lib/authz';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) {
    return null; // Será redirecionado pelo ProtectedLayout
  }

  const permissions = user.permissions || [];
  
  // Verificar permissões para diferentes módulos
  const canViewCRM = can(permissions, 'crm.leads.view');
  const canViewFinance = can(permissions, 'finance.invoices.view');
  const canViewProjects = can(permissions, 'projects.view');
  const canViewReports = can(permissions, 'reports.view');

  // Dados de exemplo para gráficos
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Fev', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 48000, expenses: 38000 },
    { month: 'Abr', revenue: 61000, expenses: 42000 },
    { month: 'Mai', revenue: 55000, expenses: 40000 },
    { month: 'Jun', revenue: 67000, expenses: 45000 },
  ];

  const salesData = [
    { name: 'Produto A', value: 35, color: '#3b5ca4' },
    { name: 'Produto B', value: 25, color: '#1e40af' },
    { name: 'Produto C', value: 20, color: '#1d4ed8' },
    { name: 'Produto D', value: 20, color: '#2563eb' },
  ];

  const performanceData = [
    { day: 'Seg', leads: 12, conversions: 8 },
    { day: 'Ter', leads: 19, conversions: 12 },
    { day: 'Qua', leads: 15, conversions: 10 },
    { day: 'Qui', leads: 22, conversions: 15 },
    { day: 'Sex', leads: 18, conversions: 11 },
    { day: 'Sáb', leads: 8, conversions: 5 },
    { day: 'Dom', leads: 5, conversions: 3 },
  ];

  // Métricas principais
  const metrics = [
    {
      title: 'Receita Total',
      value: 'R$ 328.000',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Novos Clientes',
      value: '1,247',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Vendas',
      value: '89',
      change: '+15.3%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Taxa de Conversão',
      value: '68.4%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const modules = [
    {
      name: 'CRM',
      description: 'Gestão de clientes e vendas',
      href: '/crm',
      canAccess: canViewCRM,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Financeiro',
      description: 'Contas a pagar e receber',
      href: '/financeiro',
      canAccess: canViewFinance,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Projetos',
      description: 'Gestão de projetos e tarefas',
      href: '/projetos',
      canAccess: canViewProjects,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Relatórios',
      description: 'Relatórios e análises',
      href: '/relatorios',
      canAccess: canViewReports,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Visão geral do seu negócio
            </p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{user.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {metric.changeType === 'positive' ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Receita vs Despesas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita vs Despesas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, '']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Receita"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                  name="Despesas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Vendas por Produto */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Produto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {salesData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Semanal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Semanal - Leads vs Conversões</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#3b5ca4" name="Leads" />
              <Bar dataKey="conversions" fill="#10b981" name="Conversões" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Módulos de Acesso */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Módulos do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module, index) => {
              const IconComponent = module.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    module.canAccess
                      ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      : 'border-gray-100 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${module.bgColor} mr-3`}>
                      <IconComponent className={`w-5 h-5 ${module.color}`} />
                    </div>
                    <h4 className="font-semibold text-gray-900">{module.name}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {module.canAccess ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400 mr-1" />
                      )}
                      <span className={`text-xs ${
                        module.canAccess ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {module.canAccess ? 'Acesso liberado' : 'Sem permissão'}
                      </span>
                    </div>
                    
                    {module.canAccess && (
                      <a
                        href={module.href}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Acessar
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}