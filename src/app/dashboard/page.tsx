'use client';

import { useAuth } from '@/contexts/AuthContext-enhanced';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { can } from '@/lib/authz';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
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
  Activity,
  Building2,
  CreditCard,
  Receipt
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    activeProjects: 0,
    recentActivities: [] as Array<{ id: number; type: string; message: string; time: string; }>
  });
  const [loading, setLoading] = useState(true);
  
  if (!user) {
    return null; // Será redirecionado pelo ProtectedLayout
  }

  const permissions = user.permissions || [];

  // Carregar dados do dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados básicos (simulados por enquanto)
        // TODO: Implementar queries reais quando as tabelas estiverem prontas
        setDashboardData({
          totalClients: 1247,
          totalRevenue: 328000,
          pendingInvoices: 23,
          activeProjects: 8,
          recentActivities: [
            { id: 1, type: 'client', message: 'Novo cliente cadastrado', time: '2 min atrás' },
            { id: 2, type: 'invoice', message: 'Fatura #1234 paga', time: '15 min atrás' },
            { id: 3, type: 'project', message: 'Projeto Alpha concluído', time: '1 hora atrás' },
            { id: 4, type: 'client', message: 'Reunião agendada com Cliente XYZ', time: '2 horas atrás' }
          ]
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.orgId]);
  
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
      value: `R$ ${dashboardData.totalRevenue.toLocaleString('pt-BR')}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total de Clientes',
      value: dashboardData.totalClients.toLocaleString('pt-BR'),
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Faturas Pendentes',
      value: dashboardData.pendingInvoices.toString(),
      change: '-5.1%',
      changeType: 'positive',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Projetos Ativos',
      value: dashboardData.activeProjects.toString(),
      change: '+3.2%',
      changeType: 'positive',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

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
              Bem-vindo de volta, {user.name}! Aqui está um resumo do seu negócio.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>ALB Soluções</span>
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

        {/* Atividades Recentes e Módulos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atividades Recentes */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'client' && <Users className="w-4 h-4 text-blue-500 mt-1" />}
                    {activity.type === 'invoice' && <Receipt className="w-4 h-4 text-green-500 mt-1" />}
                    {activity.type === 'project' && <FileText className="w-4 h-4 text-purple-500 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Módulos de Acesso */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Módulos do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </ProtectedLayout>
  );
}