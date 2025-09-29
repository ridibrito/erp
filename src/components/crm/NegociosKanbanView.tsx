'use client';

import { useState } from 'react';
import { Negocio, PipelineStage } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, User, Calendar, DollarSign, MoreHorizontal } from 'lucide-react';
// import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';

interface NegociosKanbanViewProps {
  negocios: Negocio[];
  stages: PipelineStage[];
  onEdit: (negocio: Negocio) => void;
  onDelete: (id: string) => void;
  onMoveStage: (negocioId: string, stageId: string) => void;
}

export function NegociosKanbanView({
  negocios,
  stages,
  onEdit,
  onDelete,
  onMoveStage
}: NegociosKanbanViewProps) {
  const [draggedNegocio, setDraggedNegocio] = useState<string | null>(null);

  // Debug logs
  console.log('NegociosKanbanView - negocios:', negocios);
  console.log('NegociosKanbanView - stages:', stages);

  const getNegociosByStage = (stageId: string) => {
    const stageNegocios = negocios.filter(negocio => negocio.stageId === stageId);
    console.log(`Negócios para etapa ${stageId}:`, stageNegocios);
    return stageNegocios;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDragStart = (e: React.DragEvent, negocioId: string) => {
    setDraggedNegocio(negocioId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedNegocio) {
      onMoveStage(draggedNegocio, stageId);
      setDraggedNegocio(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedNegocio(null);
  };

  return (
    <div className="h-[calc(100vh-300px)] flex flex-col">
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 h-full pb-4">
          {stages.map((stage) => {
            const stageNegocios = getNegociosByStage(stage.id);
            const totalValue = stageNegocios.reduce((sum, negocio) => sum + negocio.value, 0);
            
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="bg-muted/30 rounded-lg p-4 h-full flex flex-col">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                      <h3 
                        className="font-semibold text-sm"
                        style={{ color: stage.color }}
                      >
                        {stage.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {stageNegocios.length} negócio(s) • {formatCurrency(totalValue)}
                      </p>
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>

                  {/* Negócios Cards */}
                  <div className="flex-1 overflow-y-auto space-y-3">
                {stageNegocios.map((negocio) => (
                                <Card
                                  key={negocio.id}
                                  className="p-4 cursor-move hover:shadow-md transition-shadow"
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, negocio.id)}
                                  onDragEnd={handleDragEnd}
                                  onDoubleClick={() => onEdit(negocio)}
                                >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {negocio.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {negocio.client}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onEdit(negocio)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onDelete(negocio.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Value and Probability */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs">
                          <DollarSign className="w-3 h-3 mr-1 text-green-600" />
                          <span className="font-medium">{formatCurrency(negocio.value)}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-12 bg-muted rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${negocio.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{negocio.probability}%</span>
                        </div>
                      </div>

                      {/* Company and Contact Info */}
                      <div className="space-y-1">
                        {negocio.companyId && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span>Empresa: {negocio.companyId}</span>
                          </div>
                        )}
                        {negocio.contactId && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>Contato: {negocio.contactId}</span>
                          </div>
                        )}
                      </div>

                      {/* Responsible and Next Contact */}
                      <div className="space-y-1">
                        {negocio.responsible && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="w-3 h-3 mr-1" />
                            <span>Responsável: {negocio.responsible}</span>
                          </div>
                        )}
                        {negocio.nextContact && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>Próximo contato: {formatDate(negocio.nextContact)}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {negocio.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {negocio.description}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}

                {/* Empty State */}
                {stageNegocios.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nenhum negócio nesta etapa</p>
                    <p className="text-xs">Arraste negócios aqui</p>
                  </div>
                )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
