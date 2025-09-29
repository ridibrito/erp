'use client';

import { useState } from 'react';
import { Negocio, Pipeline, PipelineStage, BulkAction } from '@/types/crm';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, User, Calendar, DollarSign } from 'lucide-react';
// import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';

interface NegociosListViewProps {
  negocios: Negocio[];
  stages: PipelineStage[];
  onEdit: (negocio: Negocio) => void;
  onDelete: (id: string) => void;
  onBulkAction: (action: BulkAction) => void;
  onMoveStage: (negocioId: string, stageId: string) => void;
}

export function NegociosListView({
  negocios,
  stages,
  onEdit,
  onDelete,
  onBulkAction,
  onMoveStage
}: NegociosListViewProps) {
  const [selectedNegocios, setSelectedNegocios] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNegocios(negocios.map(n => n.id));
    } else {
      setSelectedNegocios([]);
    }
  };

  const handleSelectNegocio = (negocioId: string, checked: boolean) => {
    if (checked) {
      setSelectedNegocios(prev => [...prev, negocioId]);
    } else {
      setSelectedNegocios(prev => prev.filter(id => id !== negocioId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedNegocios.length > 0) {
      onBulkAction({
        type: 'delete',
        negocioIds: selectedNegocios
      });
      setSelectedNegocios([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkMoveStage = (stageId: string) => {
    if (selectedNegocios.length > 0) {
      onBulkAction({
        type: 'moveStage',
        negocioIds: selectedNegocios,
        data: { stageId }
      });
      setSelectedNegocios([]);
      setShowBulkActions(false);
    }
  };

  const getStageById = (stageId: string) => {
    return stages.find(s => s.id === stageId);
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

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedNegocios.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedNegocios.length} negócio(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                Ações em Massa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </Button>
            </div>
          </div>
          
          {showBulkActions && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mover para etapa:</span>
                <select
                  className="px-3 py-1 border rounded-md text-sm"
                  onChange={(e) => handleBulkMoveStage(e.target.value)}
                >
                  <option value="">Selecionar etapa</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4">
                  <Checkbox
                    checked={selectedNegocios.length === negocios.length && negocios.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium">Negócio</th>
                <th className="text-left p-4 font-medium">Cliente</th>
                <th className="text-left p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Probabilidade</th>
                <th className="text-left p-4 font-medium">Etapa</th>
                <th className="text-left p-4 font-medium">Próximo Contato</th>
                <th className="text-left p-4 font-medium">Responsável</th>
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {negocios.map((negocio) => {
                const stage = getStageById(negocio.stageId);
                return (
                  <tr 
                    key={negocio.id} 
                    className="border-t hover:bg-muted/30 cursor-pointer"
                    onDoubleClick={() => onEdit(negocio)}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={selectedNegocios.includes(negocio.id)}
                        onCheckedChange={(checked) => handleSelectNegocio(negocio.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{negocio.title}</p>
                        <p className="text-sm text-muted-foreground">#{negocio.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="p-4">{negocio.client}</td>
                    <td className="p-4">
                      <span className="font-medium">{formatCurrency(negocio.value)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-muted rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${negocio.probability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{negocio.probability}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={negocio.stageId}
                        onChange={(e) => onMoveStage(negocio.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                        style={{ 
                          backgroundColor: stage?.color + '20',
                          borderColor: stage?.color + '40'
                        }}
                      >
                        {stages.map(stage => (
                          <option key={stage.id} value={stage.id}>
                            {stage.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-sm">{formatDate(negocio.nextContact)}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        {negocio.responsible}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(negocio)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(negocio.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
