'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { PipelineService } from '@/services/pipelineService';
import { CRMService } from '@/services/crmService';
import { Negocio, Pipeline, PipelineStage } from '@/types/crm';
import { 
  ArrowLeft, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ArrowRightLeft, 
  MoreHorizontal,
  User,
  Building,
  DollarSign,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Clock,
  MessageSquare,
  Paperclip,
  Plus,
  Save,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NegocioDetailPageProps {}

export default function NegocioDetailPage({}: NegocioDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const negocioId = params.id as string;

  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [interactionText, setInteractionText] = useState('');

  useEffect(() => {
    if (negocioId && user?.orgId) {
      loadNegocioData();
    }
  }, [negocioId, user?.orgId]);

  const loadNegocioData = async () => {
    try {
      setLoading(true);
      
      // Carregar negócio
      const negocios = await PipelineService.getNegocios(user!.orgId);
      const negocioData = negocios.find(n => n.id === negocioId);
      
      if (negocioData) {
        setNegocio(negocioData);
        
        // Carregar pipeline e etapas
        const pipelines = await PipelineService.getPipelines(user!.orgId);
        const pipelineData = pipelines.find(p => p.id === negocioData.pipelineId);
        
        if (pipelineData) {
          setPipeline(pipelineData);
          setStages(pipelineData.stages || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do negócio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWinNegocio = async () => {
    // TODO: Implementar lógica para ganhar negócio
    console.log('Ganhar negócio:', negocioId);
  };

  const handleLoseNegocio = async () => {
    // TODO: Implementar lógica para perder negócio
    console.log('Perder negócio:', negocioId);
  };

  const handleReassignNegocio = async () => {
    // TODO: Implementar lógica para remanejar negócio
    console.log('Remanejar negócio:', negocioId);
  };

  const handleSaveInteraction = async () => {
    // TODO: Implementar lógica para salvar interação
    console.log('Salvar interação:', interactionText);
    setInteractionText('');
  };

  const getCurrentStageIndex = () => {
    if (!negocio || !stages.length) return 0;
    return stages.findIndex(stage => stage.id === negocio.stageId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!negocio) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Negócio não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O negócio que você está procurando não foi encontrado.
          </p>
          <Button onClick={() => router.push('/crm/negocios')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Negócios
          </Button>
        </div>
      </ProtectedLayout>
    );
  }

  const currentStageIndex = getCurrentStageIndex();

  return (
    <ProtectedLayout>
      <div className="h-full flex flex-col">
        {/* Header Fixo */}
        <div className="flex-shrink-0 p-6 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/crm/negocios')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{negocio.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{negocio.client}</Badge>
                    <Badge variant="outline">{negocio.contactId}</Badge>
                    <Badge variant="outline">{negocio.companyId}</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleWinNegocio}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Ganhar
              </Button>
              <Button
                onClick={handleLoseNegocio}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Perder
              </Button>
              <Button
                onClick={handleReassignNegocio}
                variant="outline"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Remanejar negócio
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Pipeline Stages */}
        {stages.length > 0 && (
          <div className="flex-shrink-0 p-6 border-b bg-muted/30">
            <div className="flex items-center gap-2 overflow-x-auto">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center">
                  <div
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      index <= currentStageIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    style={{
                      backgroundColor: index <= currentStageIndex ? stage.color : undefined
                    }}
                  >
                    {stage.name}
                  </div>
                  {index < stages.length - 1 && (
                    <div className="w-4 h-0.5 bg-border mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-80 border-r bg-background overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Dados Básicos */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    DADOS BÁSICOS
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Título:</span>
                      <div className="font-medium">{negocio.title}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cliente:</span>
                      <div className="font-medium">{negocio.client}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contato:</span>
                      <div className="font-medium">{negocio.contactId}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor:</span>
                      <div className="font-medium text-green-600">
                        {formatCurrency(negocio.value)}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Outras Informações */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    OUTRAS INFORMAÇÕES
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Responsável:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {negocio.responsible?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{negocio.responsible || 'Não definido'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Início:</span>
                      <div className="font-medium">{formatDate(negocio.createdAt)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Probabilidade:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${negocio.probability}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{negocio.probability}%</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Informações da Empresa */}
                {negocio.companyId && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {negocio.companyId.toUpperCase()}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nome:</span>
                        <div className="font-medium">{negocio.companyId}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Segmento:</span>
                        <div className="font-medium">Não definido</div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Informações do Contato */}
                {negocio.contactId && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {negocio.contactId.toUpperCase()}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nome:</span>
                        <div className="font-medium">{negocio.contactId}</div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Tabs */}
                <div className="border-b mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'timeline', label: 'Linha do tempo', count: null },
                      { id: 'propostas', label: 'Propostas', count: 4 },
                      { id: 'vendas', label: 'Vendas', count: null },
                      { id: 'documentos', label: 'Documentos', count: null },
                      { id: 'negocios', label: 'Negócios derivados', count: null },
                      { id: 'anexos', label: 'Anexos', count: null },
                      { id: 'formularios', label: 'Formulários externos', count: null }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                        {tab.count && (
                          <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    {/* Interaction Input */}
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">
                            Marque um usuário com @
                          </label>
                          <textarea
                            value={interactionText}
                            onChange={(e) => setInteractionText(e.target.value)}
                            placeholder="Digite sua interação aqui..."
                            className="w-full mt-2 p-3 border border-gray-300 rounded-md bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            rows={4}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Registrar interação
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Agendar tarefa
                          </Button>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo negócio
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Enviar e-mail
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Button size="sm" variant="outline">
                            Mais campos
                          </Button>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Paperclip className="w-4 h-4 mr-2" />
                              Adicionar anexo
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveInteraction}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Tarefas em Aberto */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3">Tarefas em aberto</h3>
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma tarefa agendada. Clique aqui para criar.</p>
                      </div>
                    </Card>

                    {/* Histórico */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <button className="text-sm font-medium text-primary border-b-2 border-primary pb-1">
                          Histórico completo
                        </button>
                        <button className="text-sm text-muted-foreground hover:text-foreground">
                          Interações
                        </button>
                        <button className="text-sm text-muted-foreground hover:text-foreground">
                          Filtrar
                        </button>
                        <button className="text-sm text-muted-foreground hover:text-foreground">
                          Modificações
                        </button>
                      </div>

                      {/* Activity Cards */}
                      <div className="space-y-3">
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground">
                                Terça-feira, 26 de Agosto às 11:16
                              </div>
                              <div className="mt-1">
                                <span className="font-medium">Proposta #14</span> aberta em 26/08/2025 às 11:16.
                                <Button variant="link" className="p-0 h-auto ml-1">
                                  Visualizar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground">
                                Segunda-feira, 25 de Agosto às 10:23
                              </div>
                              <div className="mt-1">
                                <span className="font-medium">Proposta #14</span> aberta em 25/08/2025 às 10:23.
                                <Button variant="link" className="p-0 h-auto ml-1">
                                  Visualizar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outras tabs */}
                {activeTab !== 'timeline' && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">
                        {activeTab === 'propostas' && 'Propostas'}
                        {activeTab === 'vendas' && 'Vendas'}
                        {activeTab === 'documentos' && 'Documentos'}
                        {activeTab === 'negocios' && 'Negócios Derivados'}
                        {activeTab === 'anexos' && 'Anexos'}
                        {activeTab === 'formularios' && 'Formulários Externos'}
                      </h3>
                      <p className="text-sm">
                        Esta funcionalidade será implementada em breve.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
