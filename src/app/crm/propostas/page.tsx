'use client';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Plus, Search, Filter, MoreHorizontal, FileText, Calendar, DollarSign, User, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function PropostasPage() {
  // Removido verificação de permissão - acesso liberado para todos os usuários autenticados

  // Mock data
  const propostas = [
    {
      id: 1,
      titulo: 'Proposta ERP Completo',
      cliente: 'TechCorp Ltda',
      valor: 150000,
      status: 'enviada',
      dataEnvio: '2024-01-10',
      validade: '2024-02-10',
      responsavel: 'João Silva',
      probabilidade: 80
    },
    {
      id: 2,
      titulo: 'Consultoria Marketing Digital',
      cliente: 'StartupXYZ',
      valor: 45000,
      status: 'aprovada',
      dataEnvio: '2024-01-05',
      validade: '2024-02-05',
      responsavel: 'Maria Santos',
      probabilidade: 100
    },
    {
      id: 3,
      titulo: 'Desenvolvimento App Mobile',
      cliente: 'InnovationLab',
      valor: 85000,
      status: 'rejeitada',
      dataEnvio: '2024-01-08',
      validade: '2024-02-08',
      responsavel: 'Carlos Oliveira',
      probabilidade: 0
    },
    {
      id: 4,
      titulo: 'Implementação CRM',
      cliente: 'DataFlow Solutions',
      valor: 65000,
      status: 'rascunho',
      dataEnvio: null,
      validade: null,
      responsavel: 'Ana Costa',
      probabilidade: 50
    }
  ];

  const stats = [
    { label: 'Total de Propostas', value: '18', change: '+15%', icon: FileText },
    { label: 'Valor Total', value: 'R$ 1.2M', change: '+22%', icon: DollarSign },
    { label: 'Taxa de Aprovação', value: '67%', change: '+8%', icon: CheckCircle },
    { label: 'Em Análise', value: '5', change: '-2', icon: Clock }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      rascunho: { label: 'Rascunho', class: 'bg-gray-100 text-gray-800' },
      enviada: { label: 'Enviada', class: 'bg-blue-100 text-blue-800' },
      aprovada: { label: 'Aprovada', class: 'bg-green-100 text-green-800' },
      rejeitada: { label: 'Rejeitada', class: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Propostas</h1>
          <p className="text-muted-foreground">Gerencie suas propostas comerciais</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nova Proposta
        </button>
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
            placeholder="Buscar propostas..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-muted transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Propostas Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Todas as Propostas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Proposta</th>
                <th className="text-left p-4 font-medium">Cliente</th>
                <th className="text-left p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Data Envio</th>
                <th className="text-left p-4 font-medium">Validade</th>
                <th className="text-left p-4 font-medium">Responsável</th>
                <th className="text-left p-4 font-medium">Probabilidade</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {propostas.map((proposta) => (
                <tr key={proposta.id} className="border-t hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{proposta.titulo}</p>
                      <p className="text-sm text-muted-foreground">#{proposta.id}</p>
                    </div>
                  </td>
                  <td className="p-4">{proposta.cliente}</td>
                  <td className="p-4">
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(proposta.valor)}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(proposta.status)}
                  </td>
                  <td className="p-4 text-sm">
                    {proposta.dataEnvio ? proposta.dataEnvio : '-'}
                  </td>
                  <td className="p-4 text-sm">
                    {proposta.validade ? proposta.validade : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      {proposta.responsavel}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-muted rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            proposta.probabilidade === 100 ? 'bg-green-500' :
                            proposta.probabilidade === 0 ? 'bg-red-500' :
                            'bg-primary'
                          }`}
                          style={{ width: `${proposta.probabilidade}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{proposta.probabilidade}%</span>
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
      </div>
    </ProtectedLayout>
  );
}
