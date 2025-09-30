'use client';

import { useState, useEffect } from 'react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { useToastHelpers } from '@/components/ui/toast';
import { PipelineService } from '@/services/pipelineService';
import { PipelineManager } from '@/components/crm/PipelineManager';
import { Pipeline } from '@/types/crm';
import { RefreshCw } from 'lucide-react';

export default function PipelinesSettingsPage() {
  const { user } = useAuth();
  const { success, error } = useToastHelpers();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | undefined>();
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Load pipelines
  useEffect(() => {
    if (user?.orgId) {
      loadPipelines();
    }
  }, [user?.orgId]);

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

  if (loading) {
    return (
      <div className="flex h-full">
        <SettingsSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={toggleSidebar}
          activeSection="workflow"
        />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <SettingsSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar}
        activeSection="workflow"
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Workflow & Pipelines</h1>
            <p className="text-muted-foreground">
              Configure os pipelines de vendas e suas etapas
            </p>
          </div>

          {/* Pipeline Manager */}
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <PipelineManager
                pipelines={pipelines}
                onSelectPipeline={setSelectedPipeline}
                onCreatePipeline={handleCreatePipeline}
                onUpdatePipeline={handleUpdatePipeline}
                onDeletePipeline={handleDeletePipeline}
                selectedPipeline={selectedPipeline}
              />
            </div>

            {/* Info Card */}
            <div className="bg-muted/50 border rounded-lg p-4">
              <h3 className="font-medium mb-2">Sobre Pipelines</h3>
              <p className="text-sm text-muted-foreground">
                Pipelines são fluxos de trabalho que organizam seus negócios em etapas.
                Cada pipeline pode ter múltiplas etapas personalizadas, permitindo que você
                acompanhe o progresso de suas oportunidades de vendas de forma visual e organizada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

