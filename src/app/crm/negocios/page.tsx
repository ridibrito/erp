'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { useToastHelpers } from '@/components/ui/toast';
import { PipelineService } from '@/services/pipelineService';
import { PipelineManager } from '@/components/crm/PipelineManager';
import { NegociosListView } from '@/components/crm/NegociosListView';
import { NegociosKanbanView } from '@/components/crm/NegociosKanbanView';
import { NegocioDrawer } from '@/components/crm/NegocioDrawer';
import { Pipeline, Negocio, NegocioFormData, BulkAction } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Plus, List, Kanban, Settings, RefreshCw } from 'lucide-react';

type ViewMode = 'list' | 'kanban';

export default function NegociosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToastHelpers();
  
  // State
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | undefined>();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [loading, setLoading] = useState(true);
  const [showPipelineManager, setShowPipelineManager] = useState(false);
  const [showNegocioDrawer, setShowNegocioDrawer] = useState(false);
  const [creatingNegocio, setCreatingNegocio] = useState(false);

  // Load data
  useEffect(() => {
    if (user?.orgId) {
      loadPipelines();
    }
  }, [user?.orgId]);

  useEffect(() => {
    if (selectedPipeline) {
      loadNegocios();
    }
  }, [selectedPipeline, user?.orgId]);

  const loadPipelines = async () => {
    if (!user?.orgId) return;
    
    try {
      setLoading(true);
      const data = await PipelineService.getPipelines(user.orgId);
      setPipelines(data);
      
      // Select first pipeline or default
      if (data.length > 0) {
        const defaultPipeline = data.find(p => p.isDefault) || data[0];
        setSelectedPipeline(defaultPipeline);
      }
    } catch (err) {
      console.error('Erro ao carregar pipelines:', err);
      error('Erro ao carregar pipelines', 'Não foi possível carregar os pipelines. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadNegocios = async () => {
    if (!user?.orgId || !selectedPipeline) return;
    
    try {
      console.log('Carregando negócios para pipeline:', selectedPipeline.id);
      const data = await PipelineService.getNegocios(user.orgId, selectedPipeline.id);
      console.log('Negócios carregados:', data);
      setNegocios(data);
    } catch (err) {
      console.error('Erro ao carregar negócios:', err);
      error('Erro ao carregar negócios', 'Não foi possível carregar os negócios. Tente novamente.');
    }
  };

  // Pipeline management
  const handleCreatePipeline = async (pipelineData: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.orgId) return;
    
    try {
      const newPipeline = await PipelineService.createPipeline(user.orgId, pipelineData);
      setPipelines(prev => [...prev, newPipeline]);
      setSelectedPipeline(newPipeline);
      success('Pipeline criado', 'Pipeline criado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar pipeline:', err);
      error('Erro ao criar pipeline', 'Não foi possível criar o pipeline. Tente novamente.');
    }
  };

  const handleUpdatePipeline = async (id: string, updates: Partial<Pipeline>) => {
    try {
      const updatedPipeline = await PipelineService.updatePipeline(id, updates);
      setPipelines(prev => prev.map(p => p.id === id ? updatedPipeline : p));
      if (selectedPipeline?.id === id) {
        setSelectedPipeline(updatedPipeline);
      }
      success('Pipeline atualizado', 'Pipeline atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar pipeline:', err);
      error('Erro ao atualizar pipeline', 'Não foi possível atualizar o pipeline. Tente novamente.');
    }
  };

  const handleDeletePipeline = async (id: string) => {
    try {
      await PipelineService.deletePipeline(id);
      setPipelines(prev => prev.filter(p => p.id !== id));
      
      if (selectedPipeline?.id === id) {
        const remainingPipelines = pipelines.filter(p => p.id !== id);
        setSelectedPipeline(remainingPipelines.length > 0 ? remainingPipelines[0] : undefined);
      }
      
      success('Pipeline deletado', 'Pipeline deletado com sucesso!');
    } catch (err) {
      console.error('Erro ao deletar pipeline:', err);
      error('Erro ao deletar pipeline', 'Não foi possível deletar o pipeline. Tente novamente.');
    }
  };

  // Negócios management
  const handleCreateNegocio = async (negocioData: NegocioFormData) => {
    if (!user?.orgId) return;
    
    try {
      setCreatingNegocio(true);
      console.log('Criando negócio com dados:', negocioData);
      const newNegocio = await PipelineService.createNegocio(user.orgId, negocioData);
      console.log('Negócio criado:', newNegocio);
      setNegocios(prev => {
        const updated = [newNegocio, ...prev];
        console.log('Lista de negócios atualizada:', updated);
        return updated;
      });
      setShowNegocioDrawer(false);
      success('Negócio criado', 'Negócio criado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar negócio:', err);
      error('Erro ao criar negócio', 'Não foi possível criar o negócio. Tente novamente.');
    } finally {
      setCreatingNegocio(false);
    }
  };

  const handleEditNegocio = async (id: string, updates: Partial<NegocioFormData>) => {
    try {
      const updatedNegocio = await PipelineService.updateNegocio(id, updates);
      setNegocios(prev => prev.map(n => n.id === id ? updatedNegocio : n));
      success('Negócio atualizado', 'Negócio atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar negócio:', err);
      error('Erro ao atualizar negócio', 'Não foi possível atualizar o negócio. Tente novamente.');
    }
  };

  const handleDeleteNegocio = async (id: string) => {
    try {
      await PipelineService.deleteNegocio(id);
      setNegocios(prev => prev.filter(n => n.id !== id));
      success('Negócio deletado', 'Negócio deletado com sucesso!');
    } catch (err) {
      console.error('Erro ao deletar negócio:', err);
      error('Erro ao deletar negócio', 'Não foi possível deletar o negócio. Tente novamente.');
    }
  };

  const handleMoveStage = async (negocioId: string, stageId: string) => {
    try {
      console.log('Movendo negócio:', negocioId, 'para etapa:', stageId);
      await PipelineService.updateNegocio(negocioId, { stageId });
      setNegocios(prev => {
        const updated = prev.map(n => 
          n.id === negocioId ? { ...n, stageId } : n
        );
        console.log('Lista de negócios atualizada após mover:', updated);
        return updated;
      });
      success('Negócio movido', 'Negócio movido com sucesso!');
    } catch (err) {
      console.error('Erro ao mover negócio:', err);
      error('Erro ao mover negócio', 'Não foi possível mover o negócio. Tente novamente.');
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    try {
      switch (action.type) {
        case 'delete':
          await PipelineService.bulkDeleteNegocios(action.negocioIds);
          setNegocios(prev => prev.filter(n => !action.negocioIds.includes(n.id)));
          success('Negócios deletados', `${action.negocioIds.length} negócio(s) deletado(s) com sucesso!`);
          break;
          
        case 'moveStage':
          if (action.data?.stageId) {
            const updates = action.negocioIds.map(id => ({
              id,
              updates: { stageId: action.data!.stageId! }
            }));
            await PipelineService.bulkUpdateNegocios(updates);
            setNegocios(prev => prev.map(n => 
              action.negocioIds.includes(n.id) 
                ? { ...n, stageId: action.data!.stageId! }
                : n
            ));
            success('Negócios movidos', `${action.negocioIds.length} negócio(s) movido(s) com sucesso!`);
          }
          break;
      }
    } catch (err) {
      console.error('Erro na ação em massa:', err);
      error('Erro na ação em massa', 'Não foi possível executar a ação. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="h-full flex flex-col">
        {/* Fixed Page Header */}
        <div className="flex-shrink-0 p-6 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Negócios</h1>
              <p className="text-muted-foreground">
                Gerencie seus negócios e oportunidades de venda
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPipelineManager(!showPipelineManager)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Pipelines
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
              >
                {viewMode === 'list' ? (
                  <>
                    <Kanban className="w-4 h-4 mr-2" />
                    Kanban
                  </>
                ) : (
                  <>
                    <List className="w-4 h-4 mr-2" />
                    Lista
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => setShowNegocioDrawer(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Negócio
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full">

            {/* Pipeline Manager */}
            {showPipelineManager && (
              <div className="bg-card border rounded-lg p-6 m-6">
                <PipelineManager
                  pipelines={pipelines}
                  onSelectPipeline={setSelectedPipeline}
                  onCreatePipeline={handleCreatePipeline}
                  onUpdatePipeline={handleUpdatePipeline}
                  onDeletePipeline={handleDeletePipeline}
                  selectedPipeline={selectedPipeline}
                />
              </div>
            )}

            {/* Pipeline Selector */}
            {!showPipelineManager && (
              <div className="flex items-center gap-4 p-6 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Pipeline:</span>
                  <select
                    value={selectedPipeline?.id || ''}
                    onChange={(e) => {
                      const pipeline = pipelines.find(p => p.id === e.target.value);
                      if (pipeline) setSelectedPipeline(pipeline);
                    }}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Selecionar Pipeline</option>
                    {pipelines.map(pipeline => (
                      <option key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedPipeline && (
                  <div className="text-sm text-muted-foreground">
                    {negocios.length} negócio(s) • {selectedPipeline.stages?.length || 0} etapa(s)
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            {selectedPipeline && !showPipelineManager && (
              <>
                {viewMode === 'list' ? (
                  <div className="h-full p-6">
                    <NegociosListView
                      negocios={negocios}
                      stages={selectedPipeline.stages || []}
                              onEdit={(negocio) => {
                                router.push(`/crm/negocios/${negocio.id}`);
                              }}
                      onDelete={handleDeleteNegocio}
                      onBulkAction={handleBulkAction}
                      onMoveStage={handleMoveStage}
                    />
                  </div>
                ) : (
                  <NegociosKanbanView
                    negocios={negocios}
                    stages={selectedPipeline.stages || []}
                              onEdit={(negocio) => {
                                router.push(`/crm/negocios/${negocio.id}`);
                              }}
                    onDelete={handleDeleteNegocio}
                    onMoveStage={handleMoveStage}
                  />
                )}
              </>
            )}

            {/* Empty State */}
            {!selectedPipeline && !showPipelineManager && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Nenhum pipeline selecionado</h3>
                  <p className="text-sm mb-4">
                    Selecione um pipeline existente ou crie um novo para começar.
                  </p>
                  <Button
                    onClick={() => setShowPipelineManager(true)}
                    variant="outline"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Gerenciar Pipelines
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Negocio Drawer */}
        <NegocioDrawer
          isOpen={showNegocioDrawer}
          onClose={() => setShowNegocioDrawer(false)}
          onSave={handleCreateNegocio}
          pipelines={pipelines}
          selectedPipeline={selectedPipeline}
          loading={creatingNegocio}
          orgId={user?.orgId}
        />
      </div>
    </ProtectedLayout>
  );
}