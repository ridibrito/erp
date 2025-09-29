'use client';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { can } from '@/lib/authz';
import { BarChart3, PieChart, Activity, TrendingUp, Download, FileText, Calendar, DollarSign } from 'lucide-react';

export default function RelatoriosPage() {
  const { user } = useAuth();
  
  if (!user) {
    return null; // Será redirecionado pelo ProtectedLayout
  }

  const permissions = user.permissions || [];
  if (!can(permissions, 'reports:view')) {
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

  const reports = [
    {
      name: 'DRE - Demonstrativo de Resultado',
      description: 'Análise de receitas, custos e despesas',
      href: '/relatorios/dre',
      canAccess: can(permissions, 'reports.dre.view'),
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Relatório de Vendas',
      description: 'Performance de vendas e conversões',
      href: '/relatorios/vendas',
      canAccess: can(permissions, 'reports.sales.view'),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Relatório Financeiro',
      description: 'Fluxo de caixa e movimentações',
      href: '/relatorios/financeiro',
      canAccess: can(permissions, 'reports.finance.view'),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Relatório de Projetos',
      description: 'Status e progresso dos projetos',
      href: '/relatorios/projetos',
      canAccess: can(permissions, 'reports.projects.view'),
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
              Relatórios
            </h1>
            <p className="text-gray-600 mt-1">
              Análises e relatórios do sistema
            </p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Relatórios Disponíveis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reports.map((report, index) => {
              const IconComponent = report.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    report.canAccess
                      ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      : 'border-gray-100 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${report.bgColor} mr-3`}>
                      <IconComponent className={`w-5 h-5 ${report.color}`} />
                    </div>
                    <h4 className="font-semibold text-gray-900">{report.name}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {report.canAccess ? (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Acesso liberado
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          ⚠ Sem permissão
                        </span>
                      )}
                    </div>
                    
                    {report.canAccess && (
                      <a
                        href={report.href}
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

        {/* Ações Rápidas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Exportar Dados</p>
                <p className="text-sm text-gray-600">Baixar relatórios em PDF/Excel</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Agendar Relatório</p>
                <p className="text-sm text-gray-600">Configurar envio automático</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Relatório Personalizado</p>
                <p className="text-sm text-gray-600">Criar relatório customizado</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}