"use client";

import { useState, useEffect } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  CreditCard,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Charge {
  id: string;
  customer_name: string;
  customer_document: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  due_date: string;
  description: string;
  status: 'pending' | 'sent' | 'paid' | 'cancelled' | 'overdue';
  payment_method: 'pix' | 'boleto' | 'credit_card';
  payment_date?: string;
  created_at: string;
}

export default function CobrancasPage() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Dados do formulário de nova cobrança
  const [newCharge, setNewCharge] = useState({
    customer_name: '',
    customer_document: '',
    customer_email: '',
    customer_phone: '',
    amount: '',
    due_date: '',
    description: '',
    payment_method: 'pix' as 'pix' | 'boleto' | 'credit_card'
  });

  // Carregar cobranças (simulado por enquanto)
  useEffect(() => {
    const loadCharges = async () => {
      setLoading(true);
      // Simular carregamento
      setTimeout(() => {
        setCharges([
          {
            id: '1',
            customer_name: 'João Silva',
            customer_document: '123.456.789-00',
            customer_email: 'joao@email.com',
            customer_phone: '(11) 99999-9999',
            amount: 1500.00,
            due_date: '2024-02-15',
            description: 'Desenvolvimento de sistema web',
            status: 'pending',
            payment_method: 'pix',
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            customer_name: 'Maria Santos',
            customer_document: '987.654.321-00',
            customer_email: 'maria@email.com',
            customer_phone: '(11) 88888-8888',
            amount: 2500.00,
            due_date: '2024-02-10',
            description: 'Consultoria em TI',
            status: 'paid',
            payment_method: 'boleto',
            payment_date: '2024-02-08T14:30:00Z',
            created_at: '2024-01-10T09:00:00Z'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadCharges();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'sent':
        return 'Enviado';
      case 'overdue':
        return 'Vencido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCharges = charges.filter(charge => {
    const matchesSearch = charge.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charge.customer_document.includes(searchTerm) ||
                         charge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || charge.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar criação de cobrança
    console.log('Criando cobrança:', newCharge);
    setShowCreateForm(false);
    // Resetar formulário
    setNewCharge({
      customer_name: '',
      customer_document: '',
      customer_email: '',
      customer_phone: '',
      amount: '',
      due_date: '',
      description: '',
      payment_method: 'pix'
    });
  };

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Cobranças</h1>
          <p className="text-muted-foreground">Gerencie cobranças e integração bancária</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Pendente</p>
                  <p className="text-2xl font-bold">R$ 1.500,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Pago</p>
                  <p className="text-2xl font-bold">R$ 2.500,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Geral</p>
                  <p className="text-2xl font-bold">R$ 4.000,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por cliente, documento ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="sent">Enviado</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Vencido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={() => setShowCreateForm(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Cobrança
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Cobranças */}
        <Card>
          <CardHeader>
            <CardTitle>Cobranças ({filteredCharges.length})</CardTitle>
            <CardDescription>
              Lista de todas as cobranças do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando cobranças...</span>
              </div>
            ) : filteredCharges.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma cobrança encontrada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece criando uma nova cobrança.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCharges.map((charge) => (
                  <div key={charge.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">{charge.customer_name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(charge.status)}`}>
                            {getStatusIcon(charge.status)}
                            <span className="ml-1">{getStatusText(charge.status)}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{charge.customer_document}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{charge.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{charge.customer_phone}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2">{charge.description}</p>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {charge.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Vencimento: {new Date(charge.due_date).toLocaleDateString('pt-BR')}
                        </div>
                        {charge.payment_date && (
                          <div className="text-sm text-green-600">
                            Pago em: {new Date(charge.payment_date).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        <span>Método: {charge.payment_method.toUpperCase()}</span>
                        <span>•</span>
                        <Calendar className="w-4 h-4" />
                        <span>Criado em: {new Date(charge.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Nova Cobrança */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Nova Cobrança</h2>
              
              <form onSubmit={handleCreateCharge} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Nome do Cliente</Label>
                    <Input
                      id="customer_name"
                      value={newCharge.customer_name}
                      onChange={(e) => setNewCharge(prev => ({ ...prev, customer_name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customer_document">CPF/CNPJ</Label>
                    <Input
                      id="customer_document"
                      value={newCharge.customer_document}
                      onChange={(e) => setNewCharge(prev => ({ ...prev, customer_document: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={newCharge.customer_email}
                      onChange={(e) => setNewCharge(prev => ({ ...prev, customer_email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customer_phone">Telefone</Label>
                    <Input
                      id="customer_phone"
                      value={newCharge.customer_phone}
                      onChange={(e) => setNewCharge(prev => ({ ...prev, customer_phone: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newCharge.amount}
                      onChange={(e) => setNewCharge(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="due_date">Data de Vencimento</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newCharge.due_date}
                      onChange={(e) => setNewCharge(prev => ({ ...prev, due_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição do Serviço</Label>
                  <Input
                    id="description"
                    value={newCharge.description}
                    onChange={(e) => setNewCharge(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment_method">Método de Pagamento</Label>
                  <select
                    id="payment_method"
                    value={newCharge.payment_method}
                    onChange={(e) => setNewCharge(prev => ({ ...prev, payment_method: e.target.value as 'pix' | 'boleto' | 'credit_card' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="credit_card">Cartão de Crédito</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Cobrança
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
