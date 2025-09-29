export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  isWon?: boolean;
  isLost?: boolean;
}

export interface Negocio {
  id: string;
  title: string;
  client: string;
  value: number;
  probability: number;
  stageId: string;
  pipelineId: string;
  nextContact?: string;
  responsible: string;
  status: 'active' | 'won' | 'lost';
  description?: string;
  createdAt: string;
  updatedAt: string;
  contactId?: string;
  companyId?: string;
}

export interface NegocioFormData {
  title: string;
  client: string;
  value: number;
  probability: number;
  stageId: string;
  pipelineId: string;
  nextContact?: string;
  responsible: string;
  description?: string;
  contactId?: string;
  companyId?: string;
}

export interface BulkAction {
  type: 'delete' | 'moveStage' | 'assignResponsible';
  negocioIds: string[];
  data?: {
    stageId?: string;
    responsible?: string;
  };
}
