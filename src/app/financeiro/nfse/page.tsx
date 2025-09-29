"use client";

import { useState, useEffect } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Settings,
  Plus
} from 'lucide-react';

interface Nfse {
  id: string;
  number: string;
  series: string;
  issue_date: string;
  service_date: string;
  customer_name: string;
  customer_document: string;
  service_description: string;
  total_value: number;
  tax_value: number;
  net_value: number;
  status: 'draft' | 'issued' | 'cancelled';
  nfse_code?: string;
  verification_code?: string;
  pdf_url?: string;
  created_at: string;
}

export default function NfsePage() {
  const [nfseList, setNfseList] = useState<Nfse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Carregar NFS-e (simulado por enquanto)
  useEffect(() => {
    const loadNfse = async () => {
      setLoading(true);
      // Simular carregamento
      setTimeout(() => {
        setNfseList([
          {
            id: '1',
            number: '000001',
            series: 'A',
            issue_date: '2024-01-15',
            service_date: '2024-01-10',
            customer_name: 'João Silva',
            customer_document: '123.456.789-00',
            service_description: 'Desenvolvimento de sistema web',
            total_value: 1500.00,
            tax_value: 75.00,
            net_value: 1425.00,
            status: 'issued',
            nfse_code: 'NFSE123456789',
            verification_code: 'ABC123',
            pdf_url: '/pdfs/nfse-000001.pdf',
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            number: '000002',
            series: 'A',
            issue_date: '2024-01-20',
            service_date: '2024-01-18',
            customer_name: 'Maria Santos',
            customer_document: '987.654.321-00',
            service_description: 'Consultoria em TI',
            total_value: 2500.00,
            tax_value: 125.00,
            net_value: 2375.00,
            status: 'draft',
            created_at: '2024-01-20T14:30:00Z'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadNfse();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued':
        return 'Emitida';
      case 'draft':
        return 'Rascunho';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNfse = nfseList.filter(nfse => {
    const matchesSearch = nfse.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nfse.number.includes(searchTerm) ||
                         nfse.customer_document.includes(searchTerm) ||
                         nfse.service_description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || nfse.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">NFS-e</h1>
          <p className="text-muted-foreground">Gerencie Notas Fiscais de Serviço Eletrônicas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Emitidas</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Rascunhos</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">R$ 4.000,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Impostos</p>
                  <p className="text-2xl font-bold">R$ 200,00</p>
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
                    placeholder="Buscar por cliente, número, documento ou descrição..."
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
                  <option value="draft">Rascunho</option>
                  <option value="issued">Emitida</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova NFS-e
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de NFS-e */}
        <Card>
          <CardHeader>
            <CardTitle>NFS-e ({filteredNfse.length})</CardTitle>
            <CardDescription>
              Lista de todas as Notas Fiscais de Serviço Eletrônicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando NFS-e...</span>
              </div>
            ) : filteredNfse.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma NFS-e encontrada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece criando uma nova NFS-e.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNfse.map((nfse) => (
                  <div key={nfse.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">NFS-e {nfse.number}/{nfse.series}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(nfse.status)}`}>
                            {getStatusIcon(nfse.status)}
                            <span className="ml-1">{getStatusText(nfse.status)}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{nfse.customer_name} - {nfse.customer_document}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Emitida em: {new Date(nfse.issue_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{nfse.service_description}</p>
                        
                        {nfse.nfse_code && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Código NFS-e:</strong> {nfse.nfse_code}
                            {nfse.verification_code && (
                              <span className="ml-4">
                                <strong>Verificação:</strong> {nfse.verification_code}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {nfse.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Líquido: R$ {nfse.net_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Impostos: R$ {nfse.tax_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Serviço em: {new Date(nfse.service_date).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>Criado em: {new Date(nfse.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {nfse.pdf_url && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        {nfse.status === 'draft' && (
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Emitir
                          </Button>
                        )}
                        {nfse.status === 'issued' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Configurações */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Configurações de NFS-e</h2>
              
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configure as integrações com as prefeituras para emissão de NFS-e.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city_code">Código da Cidade (IBGE)</Label>
                    <Input id="city_code" placeholder="Ex: 3550308" />
                  </div>
                  
                  <div>
                    <Label htmlFor="city_name">Nome da Cidade</Label>
                    <Input id="city_name" placeholder="Ex: São Paulo" />
                  </div>
                  
                  <div>
                    <Label htmlFor="provider">Provedor</Label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Selecione o provedor</option>
                      <option value="ginfes">GINFES</option>
                      <option value="dsf">DSF</option>
                      <option value="betha">Betha</option>
                      <option value="issnet">IssNet</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="environment">Ambiente</Label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="development">Desenvolvimento</option>
                      <option value="production">Produção</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="api_endpoint">Endpoint da API</Label>
                  <Input id="api_endpoint" placeholder="https://api.prefeitura.gov.br/nfse" />
                </div>
                
                <div>
                  <Label htmlFor="api_key">Chave da API</Label>
                  <Input id="api_key" type="password" placeholder="Sua chave de API" />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowSettings(false)}>
                    Cancelar
                  </Button>
                  <Button>
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
