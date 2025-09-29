'use client';

import { useState } from 'react';
import { Pipeline, PipelineStage } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, Settings, Check, X } from 'lucide-react';

interface PipelineManagerProps {
  pipelines: Pipeline[];
  onSelectPipeline: (pipeline: Pipeline) => void;
  onCreatePipeline: (pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePipeline: (id: string, updates: Partial<Pipeline>) => void;
  onDeletePipeline: (id: string) => void;
  selectedPipeline?: Pipeline;
}

export function PipelineManager({
  pipelines,
  onSelectPipeline,
  onCreatePipeline,
  onUpdatePipeline,
  onDeletePipeline,
  selectedPipeline
}: PipelineManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<string | null>(null);
  const [newPipeline, setNewPipeline] = useState({
    name: '',
    description: '',
    stages: [
      { name: 'Prospecting', color: '#3B82F6', order: 1 },
      { name: 'Qualification', color: '#8B5CF6', order: 2 },
      { name: 'Proposal', color: '#F59E0B', order: 3 },
      { name: 'Negotiation', color: '#EF4444', order: 4 },
      { name: 'Closed Won', color: '#10B981', order: 5, isWon: true },
      { name: 'Closed Lost', color: '#6B7280', order: 6, isLost: true }
    ] as Omit<PipelineStage, 'id'>[]
  });

  const handleCreatePipeline = () => {
    if (newPipeline.name.trim()) {
      // Enviar apenas os dados necessários para criar o pipeline
      const pipelineData = {
        name: newPipeline.name,
        description: newPipeline.description,
        isDefault: false,
        stages: newPipeline.stages
      };
      
      onCreatePipeline(pipelineData);
      setNewPipeline({
        name: '',
        description: '',
        stages: [
          { name: 'Prospecting', color: '#3B82F6', order: 1 },
          { name: 'Qualification', color: '#8B5CF6', order: 2 },
          { name: 'Proposal', color: '#F59E0B', order: 3 },
          { name: 'Negotiation', color: '#EF4444', order: 4 },
          { name: 'Closed Won', color: '#10B981', order: 5, isWon: true },
          { name: 'Closed Lost', color: '#6B7280', order: 6, isLost: true }
        ]
      });
      setIsCreating(false);
    }
  };

  const handleAddStage = () => {
    setNewPipeline(prev => ({
      ...prev,
      stages: [
        ...prev.stages,
        {
          name: `Etapa ${prev.stages.length + 1}`,
          color: '#6B7280',
          order: prev.stages.length + 1
        }
      ]
    }));
  };

  const handleUpdateStage = (index: number, updates: Partial<PipelineStage>) => {
    setNewPipeline(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, ...updates } : stage
      )
    }));
  };

  const handleRemoveStage = (index: number) => {
    setNewPipeline(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }));
  };

  const defaultColors = [
    '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', 
    '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
  ];

  return (
    <div className="space-y-4">
      {/* Pipeline Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={selectedPipeline?.id || ''}
            onChange={(e) => {
              const pipeline = pipelines.find(p => p.id === e.target.value);
              if (pipeline) onSelectPipeline(pipeline);
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
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pipeline
          </Button>
        </div>
      </div>

      {/* Create Pipeline Form */}
      {isCreating && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Criar Novo Pipeline</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome do Pipeline
                </label>
                <input
                  type="text"
                  value={newPipeline.name}
                  onChange={(e) => setNewPipeline(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ex: Vendas B2B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newPipeline.description}
                  onChange={(e) => setNewPipeline(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Descrição opcional"
                />
              </div>
            </div>

            {/* Stages */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">
                  Etapas do Pipeline
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddStage}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Etapa
                </Button>
              </div>

              <div className="space-y-3">
                {newPipeline.stages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={stage.color}
                        onChange={(e) => handleUpdateStage(index, { color: e.target.value })}
                        className="w-8 h-8 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => handleUpdateStage(index, { name: e.target.value })}
                        className="px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={stage.isWon || false}
                          onChange={(e) => handleUpdateStage(index, { isWon: e.target.checked, isLost: false })}
                          className="mr-1"
                        />
                        Ganho
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={stage.isLost || false}
                          onChange={(e) => handleUpdateStage(index, { isLost: e.target.checked, isWon: false })}
                          className="mr-1"
                        />
                        Perdido
                      </label>
                    </div>

                    {newPipeline.stages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStage(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePipeline}
                disabled={!newPipeline.name.trim()}
              >
                <Check className="w-4 h-4 mr-2" />
                Criar Pipeline
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Pipeline List */}
      {pipelines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelines.map(pipeline => (
            <Card key={pipeline.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{pipeline.name}</h4>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPipeline(pipeline.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletePipeline(pipeline.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {pipeline.description && (
                  <p className="text-sm text-muted-foreground">
                    {pipeline.description}
                  </p>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Etapas ({pipeline.stages?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {pipeline.stages?.slice(0, 3).map((stage, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: stage.color + '20',
                          color: stage.color,
                          border: `1px solid ${stage.color}40`
                        }}
                      >
                        {stage.name}
                      </span>
                    ))}
                    {(pipeline.stages?.length || 0) > 3 && (
                      <span className="px-2 py-1 text-xs text-muted-foreground">
                        +{(pipeline.stages?.length || 0) - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
