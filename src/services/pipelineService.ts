import { supabase } from '@/lib/supabase';
import { Pipeline, PipelineStage, Negocio, NegocioFormData } from '@/types/crm';

export class PipelineService {
  // Pipelines
  static async getPipelines(orgId: string): Promise<Pipeline[]> {
    const { data, error } = await supabase
      .from('crm_pipelines')
      .select(`
        *,
        stages:crm_pipeline_stages(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar pipelines:', error);
      throw error;
    }

    // Transformar os dados para o formato esperado
    return (data || []).map(pipeline => ({
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      orgId: pipeline.org_id,
      isDefault: pipeline.is_default,
      createdAt: pipeline.created_at,
      updatedAt: pipeline.updated_at,
      stages: (pipeline.stages || []).map((stage: any) => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        order: stage.order,
        isWon: stage.is_won,
        isLost: stage.is_lost
      }))
    }));
  }

  static async createPipeline(orgId: string, pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pipeline> {
    console.log('Criando pipeline com dados:', { orgId, pipeline });
    
    // Separar stages do pipeline principal
    const { stages, ...pipelineData } = pipeline;
    
    const insertData = {
      name: pipelineData.name,
      description: pipelineData.description,
      is_default: pipelineData.isDefault || false,
      org_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Dados para inserção:', insertData);
    
    const { data, error } = await supabase
      .from('crm_pipelines')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pipeline:', error);
      console.error('Dados que causaram erro:', insertData);
      throw error;
    }

    // Criar as etapas se existirem
    if (stages && stages.length > 0) {
      const stagesData = stages.map(stage => ({
        pipeline_id: data.id,
        name: stage.name,
        color: stage.color,
        order: stage.order,
        is_won: stage.isWon || false,
        is_lost: stage.isLost || false
      }));

      const { error: stagesError } = await supabase
        .from('crm_pipeline_stages')
        .insert(stagesData);

      if (stagesError) {
        console.error('Erro ao criar etapas:', stagesError);
        // Não falhar se as etapas não puderem ser criadas
      }
    }

    return data;
  }

  static async updatePipeline(id: string, updates: Partial<Pipeline>): Promise<Pipeline> {
    const { data, error } = await supabase
      .from('crm_pipelines')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar pipeline:', error);
      throw error;
    }

    return data;
  }

  static async deletePipeline(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_pipelines')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar pipeline:', error);
      throw error;
    }
  }

  // Stages
  static async createStage(pipelineId: string, stage: Omit<PipelineStage, 'id'>): Promise<PipelineStage> {
    const { data, error } = await supabase
      .from('crm_pipeline_stages')
      .insert({
        ...stage,
        pipeline_id: pipelineId
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar etapa:', error);
      throw error;
    }

    return data;
  }

  static async updateStage(id: string, updates: Partial<PipelineStage>): Promise<PipelineStage> {
    const { data, error } = await supabase
      .from('crm_pipeline_stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar etapa:', error);
      throw error;
    }

    return data;
  }

  static async deleteStage(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_pipeline_stages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar etapa:', error);
      throw error;
    }
  }

  // Negócios
  static async getNegocios(orgId: string, pipelineId?: string): Promise<Negocio[]> {
    let query = supabase
      .from('crm_negocios')
      .select(`
        *,
        stage:crm_pipeline_stages(*),
        pipeline:crm_pipelines(*),
        contact:crm_contacts(name, first_name, last_name),
        company:crm_accounts(name, fantasy_name)
      `)
      .eq('org_id', orgId);

    if (pipelineId) {
      query = query.eq('pipeline_id', pipelineId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar negócios:', error);
      throw error;
    }

    // Mapear dados do banco para o formato do frontend
    return (data || []).map(negocio => {
      // Determinar nome do contato
      let contactName = '';
      if (negocio.contact) {
        contactName = negocio.contact.name || 
                     (negocio.contact.first_name && negocio.contact.last_name ? 
                      `${negocio.contact.first_name} ${negocio.contact.last_name}` : '') ||
                     negocio.contact.first_name || '';
      }

      // Determinar nome da empresa
      let companyName = '';
      if (negocio.company) {
        companyName = negocio.company.name || negocio.company.fantasy_name || '';
      }

      return {
        id: negocio.id,
        title: negocio.title,
        client: negocio.client,
        value: negocio.value,
        probability: negocio.probability,
        stageId: negocio.stage_id,
        pipelineId: negocio.pipeline_id,
        orgId: negocio.org_id,
        nextContact: negocio.next_contact,
        responsible: negocio.responsible,
        status: negocio.status,
        description: negocio.description,
        contactId: contactName || negocio.contact_id,
        companyId: companyName || negocio.company_id,
        createdAt: negocio.created_at,
        updatedAt: negocio.updated_at
      };
    });
  }

  static async createNegocio(orgId: string, negocio: NegocioFormData): Promise<Negocio> {
    console.log('Criando negócio com dados:', { orgId, negocio });
    
    const insertData = {
      title: negocio.title || '',
      client: negocio.client || '',
      value: negocio.value || 0,
      probability: negocio.probability || 0,
      stage_id: negocio.stageId || null,
      pipeline_id: negocio.pipelineId || null,
      org_id: orgId,
      next_contact: negocio.nextContact || null,
      responsible: negocio.responsible || '',
      status: 'active',
      description: negocio.description || null,
      contact_id: negocio.contactId || null,
      company_id: negocio.companyId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Dados para inserção:', insertData);
    
    const { data, error } = await supabase
      .from('crm_negocios')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar negócio:', error);
      console.error('Dados que causaram erro:', insertData);
      throw error;
    }

    return data;
  }

  static async updateNegocio(id: string, updates: Partial<NegocioFormData>): Promise<Negocio> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Mapear campos camelCase para snake_case
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.client !== undefined) updateData.client = updates.client;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.probability !== undefined) updateData.probability = updates.probability;
    if (updates.stageId !== undefined) updateData.stage_id = updates.stageId;
    if (updates.pipelineId !== undefined) updateData.pipeline_id = updates.pipelineId;
    if (updates.nextContact !== undefined) updateData.next_contact = updates.nextContact;
    if (updates.responsible !== undefined) updateData.responsible = updates.responsible;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.contactId !== undefined) updateData.contact_id = updates.contactId;
    if (updates.companyId !== undefined) updateData.company_id = updates.companyId;

    const { data, error } = await supabase
      .from('crm_negocios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar negócio:', error);
      throw error;
    }

    return data;
  }

  static async deleteNegocio(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_negocios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar negócio:', error);
      throw error;
    }
  }

  static async bulkUpdateNegocios(updates: { id: string; updates: Partial<NegocioFormData> }[]): Promise<void> {
    const promises = updates.map(({ id, updates: negocioUpdates }) =>
      this.updateNegocio(id, negocioUpdates)
    );

    await Promise.all(promises);
  }

  static async bulkDeleteNegocios(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('crm_negocios')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Erro ao deletar negócios em massa:', error);
      throw error;
    }
  }
}
