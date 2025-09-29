'use client';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Plus, Search, Filter, MoreHorizontal, FileText, Calendar, DollarSign, User, Clock, CheckCircle, AlertCircle, Archive } from 'lucide-react';

export default function ContratosPage() {
  // Removido verificação de permissão - acesso liberado para todos os usuários autenticados

  // Mock data
  const contratos = [
    {
      id: 1,
      titulo: 'Contrato ERP Completo',
      cliente: 'TechCorp Ltda',
      valor: 150000,
      status: 'ativo',
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      responsavel: 'João Silva',
      tipo: 'anual',
      renovacao: 'automática'
    },
    {
      id: 2,
      titulo: 'Consultoria Marketing Digital',
      cliente: 'StartupXYZ',
      valor: 45000,
      status: 'ativo',
      dataInicio: '2024-01-15',
      dataFim: '2024-06-15',
      responsavel: 'Maria Santos',
      tipo: 'semestral',
      renovacao: 'manual'
    },
    {
      id: 3,
      titulo: 'Desenvolvimento App Mobile',
      cliente: 'InnovationLab',
      valor: 85000,
      status: 'finalizado',
      dataInicio: '2023-07-01',
      dataFim: '2023-12-31',
      responsavel: 'Carlos Oliveira',
      tipo: 'projeto',
      renovacao: 'não aplicável'
    },
    {
      id: 4,
      titulo: 'Suporte Técnico Premium',
      cliente: 'DataFlow Solutions',
      valor: 25000,
      status: 'pendente',
      dataInicio: '2024-02-01',
      dataFim: '2024-07-31',
      responsavel: 'Ana Costa',
      tipo: 'semestral',
      renovacao: 'automática'
    }
  ];

  const stats = [
    { label: 'Contratos Ativos', value: '12', change: '+3', icon: CheckCircle },
    { label: 'Valor Total', value: 'R$ 2.8M', change: '+18%', icon: DollarSign },
    { label: 'A Renovar (30 dias)', value: '3', change: '-1', icon: Clock },
    { label: 'Finalizados', value: '8', change: '+2', icon: Archive }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', class: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
      finalizado: { label: 'Finalizado', class: 'bg-gray-100 text-gray-800' },
      cancelado: { label: 'Cancelado', class: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      anual: { label: 'Anual', class: 'bg-blue-100 text-blue-800' },
      semestral: { label: 'Semestral', class: 'bg-purple-100 text-purple-800' },
      mensal: { label: 'Mensal', class: 'bg-orange-100 text-orange-800' },
      projeto: { label: 'Projeto', class: 'bg-indigo-100 text-indigo-800' }
    };
    const config = tipoConfig[tipo as keyof typeof tipoConfig];
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
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">Gerencie seus contratos e acordos comerciais</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
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
            placeholder="Buscar contratos..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-muted transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Contratos Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Todos os Contratos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Contrato</th>
                <th className="text-left p-4 font-medium">Cliente</th>
                <th className="text-left p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Tipo</th>
                <th className="text-left p-4 font-medium">Início</th>
                <th className="text-left p-4 font-medium">Fim</th>
                <th className="text-left p-4 font-medium">Responsável</th>
                <th className="text-left p-4 font-medium">Renovação</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((contrato) => (
                <tr key={contrato.id} className="border-t hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{contrato.titulo}</p>
                      <p className="text-sm text-muted-foreground">#{contrato.id}</p>
                    </div>
                  </td>
                  <td className="p-4">{contrato.cliente}</td>
                  <td className="p-4">
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(contrato.valor)}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(contrato.status)}
                  </td>
                  <td className="p-4">
                    {getTipoBadge(contrato.tipo)}
                  </td>
                  <td className="p-4 text-sm">{contrato.dataInicio}</td>
                  <td className="p-4 text-sm">{contrato.dataFim}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      {contrato.responsavel}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {contrato.renovacao}
                    </span>
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
    </ProtectedLayout>
  );
}
