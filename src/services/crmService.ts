import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Contact {
  id: string;
  type?: 'person' | 'company';
  first_name?: string;
  last_name?: string;
  name?: string;
  fantasy_name?: string;
  email: string;
  phone?: string;
  document?: string;
  document_type?: 'cpf' | 'cnpj';
  position?: string;
  account_id?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  };
  status: 'active' | 'inactive' | 'prospect';
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  fantasy_name?: string;
  email: string;
  phone?: string;
  document?: string;
  document_type?: 'cnpj';
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  };
  status: 'active' | 'inactive' | 'prospect';
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export class CRMService {
  // ===== CONTATOS =====
  
  static async getContacts(organizationId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('org_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar contatos:', error);
      throw error;
    }

    return data || [];
  }

  static async getContact(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar contato:', error);
      return null;
    }

    return data;
  }

  static async createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    // Limpar campos vazios que podem causar problemas com UUID
    const cleanContact = {
      ...contact,
      // Mapear organization_id para org_id (nome da coluna no banco)
      org_id: contact.organization_id,
      // Converter strings vazias para null para campos UUID
      account_id: contact.account_id && contact.account_id.trim() !== '' ? contact.account_id : null,
      // Garantir que campos obrigatórios não sejam undefined
      email: contact.email || '',
      status: contact.status || 'prospect',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('crm_contacts')
      .insert(cleanContact)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar contato:', error);
      throw error;
    }

    return data;
  }

  static async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    // Limpar campos vazios que podem causar problemas com UUID
    const cleanContact = {
      ...contact,
      // Mapear organization_id para org_id (nome da coluna no banco)
      org_id: contact.organization_id,
      // Converter strings vazias para null para campos UUID
      account_id: contact.account_id && contact.account_id.trim() !== '' ? contact.account_id : null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('crm_contacts')
      .update(cleanContact)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar contato:', error);
      throw error;
    }

    return data;
  }

  static async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir contato:', error);
      throw error;
    }
  }

  static async bulkDeleteContacts(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('crm_contacts')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Erro ao excluir contatos em massa:', error);
      throw error;
    }
  }

  // ===== EMPRESAS =====
  
  static async getCompanies(organizationId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('crm_accounts')
      .select('*')
      .eq('org_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }

    return data || [];
  }

  static async getCompany(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('crm_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar empresa:', error);
      return null;
    }

    return data;
  }

  static async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    // Limpar campos vazios e mapear organization_id para org_id
    const cleanCompany = {
      ...company,
      // Mapear organization_id para org_id (nome da coluna no banco)
      org_id: company.organization_id,
      // Garantir que campos obrigatórios não sejam undefined
      name: company.name || '',
      status: company.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('crm_accounts')
      .insert(cleanCompany)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }

    return data;
  }

  static async updateCompany(id: string, company: Partial<Company>): Promise<Company> {
    // Limpar campos vazios e mapear organization_id para org_id
    const cleanCompany = {
      ...company,
      // Mapear organization_id para org_id (nome da coluna no banco)
      org_id: company.organization_id,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('crm_accounts')
      .update(cleanCompany)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }

    return data;
  }

  static async deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir empresa:', error);
      throw error;
    }
  }

  static async bulkDeleteCompanies(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('crm_accounts')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Erro ao excluir empresas em massa:', error);
      throw error;
    }
  }

  // ===== MÉTODOS AUXILIARES =====
  
  static async getContactsByCompany(companyId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('account_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar contatos da empresa:', error);
      throw error;
    }

    return data || [];
  }

  static async searchContacts(query: string, organizationId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar contatos:', error);
      throw error;
    }

    return data || [];
  }

  static async searchCompanies(query: string, organizationId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('crm_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`name.ilike.%${query}%,fantasy_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }

    return data || [];
  }
}
