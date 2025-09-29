'use client';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { can } from '@/lib/authz';
import { Users, Briefcase, FileText, Receipt, Plus, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function CRMPage() {
  const { user } = useAuth();
  
  if (!user) {
    return null; // Será redirecionado pelo ProtectedLayout
  }

  const permissions = user.permissions || [];
  
  // Verificar permissões para diferentes módulos
  const canViewClients = can(permissions, 'crm.clients.view');
  const canViewDeals = can(permissions, 'crm.leads.view');
  const canViewProposals = can(permissions, 'crm.proposals.view');
  const canViewContracts = can(permissions, 'crm.contracts.view');

  const modules = [
    {
      name: 'Clientes',
      description: 'Gerencie seus clientes e prospects',
      href: '/crm/clientes',
      canAccess: canViewClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stats: { total: 1247, change: '+8.2%' }
    },
    {
      name: 'Negócios',
      description: 'Acompanhe oportunidades de vendas',
      href: '/crm/negocios',
      canAccess: canViewDeals,
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      stats: { total: 89, change: '+15.3%' }
    },
    {
      name: 'Propostas',
      description: 'Crie e gerencie propostas comerciais',
      href: '/crm/propostas',
      canAccess: canViewProposals,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      stats: { total: 45, change: '+12.1%' }
    },
    {
      name: 'Contratos',
      description: 'Controle contratos e acordos',
      href: '/crm/contratos',
      canAccess: canViewContracts,
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      stats: { total: 23, change: '+5.7%' }
    }
  ];

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              CRM - Gestão de Negócios
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie clientes, negócios e relacionamentos
            </p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{user.name}</span>
            </div>
          </div>
        </div>

        {/* Módulos do CRM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Módulos do CRM</h3>
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
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {module.stats.total}
                    </div>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{module.stats.change}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {module.canAccess ? (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Acesso liberado
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          ⚠ Sem permissão
                        </span>
                      )}
                    </div>
                    
                    {module.canAccess && (
                      <Link
                        href={module.href}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Acessar
                      </Link>
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
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Novo Cliente</p>
                <p className="text-sm text-gray-600">Cadastrar novo cliente</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Novo Negócio</p>
                <p className="text-sm text-gray-600">Criar oportunidade</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Relatórios</p>
                <p className="text-sm text-gray-600">Ver performance</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}