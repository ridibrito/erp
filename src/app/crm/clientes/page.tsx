'use client';

import { useState, useEffect } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { can } from '@/lib/authz';
import { useToastHelpers } from '@/components/ui/toast';
import ContactList from '@/components/crm/ContactList';
import ContactDrawer from '@/components/crm/ContactDrawer';
import CompanyList from '@/components/crm/CompanyList';
import CompanyDrawer from '@/components/crm/CompanyDrawer';
import EntityTabs from '@/components/crm/EntityTabs';
import { CRMService, Contact, Company } from '@/services/crmService';

// Interfaces já importadas do CRMService

export default function ContatosPage() {
  const { user } = useAuth();
  const { success, error, warning } = useToastHelpers();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'companies' | 'contacts'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  // Carregar dados do banco de dados
  useEffect(() => {
    const loadData = async () => {
      if (!user?.orgId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Carregar contatos e empresas do banco
        const [contactsData, companiesData] = await Promise.all([
          CRMService.getContacts(user.orgId),
          CRMService.getCompanies(user.orgId)
        ]);

        setContacts(contactsData);
        setCompanies(companiesData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        error('Erro ao carregar dados', 'Não foi possível carregar os dados do CRM. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.orgId]);

  // Recarregar dados quando necessário
  const reloadData = async () => {
    if (!user?.orgId) return;

    try {
      const [contactsData, companiesData] = await Promise.all([
        CRMService.getContacts(user.orgId),
        CRMService.getCompanies(user.orgId)
      ]);

      setContacts(contactsData);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Erro ao recarregar dados:', err);
      error('Erro ao recarregar dados', 'Não foi possível recarregar os dados.');
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCreateDropdown) {
        setShowCreateDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCreateDropdown]);

  if (!user) {
    return null; // Será redirecionado pelo ProtectedLayout
  }

  // Removido verificação de permissão - acesso liberado para todos os usuários autenticados

  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    if (!user?.orgId) return;

    try {
      if (selectedContact && drawerMode === 'edit') {
        await CRMService.updateContact(selectedContact.id, {
          ...contactData,
          organization_id: user.orgId
        });
        success('Contato atualizado!', 'Contato atualizado com sucesso.');
      } else {
        await CRMService.createContact({
          ...contactData,
          organization_id: user.orgId
        });
        success('Contato criado!', 'Contato criado com sucesso.');
      }

      await reloadData();
      setDrawerOpen(false);
      setSelectedContact(null);
    } catch (err) {
      console.error('Erro ao salvar contato:', err);
      error('Erro ao salvar', 'Não foi possível salvar o contato. Tente novamente.');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setSelectedCompany(null); // Limpar empresa selecionada
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await CRMService.deleteContact(contactId);
      await reloadData();
      success('Contato excluído!', 'Contato removido com sucesso.');
    } catch (err) {
      console.error('Erro ao excluir contato:', err);
      error('Erro ao excluir', 'Não foi possível excluir o contato. Tente novamente.');
    }
  };

  const handleBulkDeleteContacts = async (contactIds: string[]) => {
    try {
      await CRMService.bulkDeleteContacts(contactIds);
      await reloadData();
      success(`${contactIds.length} ${contactIds.length === 1 ? 'contato excluído' : 'contatos excluídos'} com sucesso!`);
    } catch (err) {
      console.error('Erro ao excluir contatos:', err);
      error('Erro ao excluir', 'Não foi possível excluir os contatos. Tente novamente.');
    }
  };

  const handleViewContact = (contact: Contact) => {
    // Redirecionar para a página completa do contato
    window.location.href = `/crm/contatos/${contact.id}`;
  };

  const handleViewCompany = (company: Company) => {
    // Redirecionar para a página completa da empresa
    window.location.href = `/crm/empresas/${company.id}`;
  };

  const handleNewContact = () => {
    setSelectedContact({} as Contact); // Usar objeto vazio para indicar criação
    setSelectedCompany(null); // Limpar empresa selecionada
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleNewCompany = () => {
    setSelectedCompany({} as Company); // Usar objeto vazio para indicar criação
    setSelectedContact(null); // Limpar contato selecionado
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedContact(null);
    setSelectedCompany(null);
  };

  // Funções para empresas
  const handleSaveCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    if (!user?.orgId) return;

    try {
      if (selectedCompany && drawerMode === 'edit') {
        await CRMService.updateCompany(selectedCompany.id, {
          ...companyData,
          organization_id: user.orgId
        });
        success('Empresa atualizada!', 'Empresa atualizada com sucesso.');
      } else {
        await CRMService.createCompany({
          ...companyData,
          organization_id: user.orgId
        });
        success('Empresa criada!', 'Empresa criada com sucesso.');
      }

      await reloadData();
      setDrawerOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      console.error('Erro ao salvar empresa:', err);
      error('Erro ao salvar', 'Não foi possível salvar a empresa. Tente novamente.');
    }
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setSelectedContact(null); // Limpar contato selecionado
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await CRMService.deleteCompany(companyId);
      await reloadData();
      success('Empresa excluída!', 'Empresa removida com sucesso.');
    } catch (err) {
      console.error('Erro ao excluir empresa:', err);
      error('Erro ao excluir', 'Não foi possível excluir a empresa. Tente novamente.');
    }
  };

  const handleBulkDeleteCompanies = async (companyIds: string[]) => {
    try {
      await CRMService.bulkDeleteCompanies(companyIds);
      await reloadData();
      success(`${companyIds.length} ${companyIds.length === 1 ? 'empresa excluída' : 'empresas excluídas'} com sucesso!`);
    } catch (err) {
      console.error('Erro ao excluir empresas:', err);
      error('Erro ao excluir', 'Não foi possível excluir as empresas. Tente novamente.');
    }
  };

  // Função para combinar contatos e empresas em uma lista unificada
  const getAllEntities = () => {
    const allEntities = [
      ...contacts.map(contact => ({
        ...contact,
        entityType: 'contact' as const
      })),
      ...companies.map(company => ({
        ...company,
        entityType: 'company' as const,
        type: 'company' as const,
        first_name: undefined,
        last_name: undefined,
        position: undefined,
        account_id: undefined,
        company_name: undefined,
        document_type: 'cnpj' as const
      }))
    ];
    
    return allEntities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }


  return (
    <ProtectedLayout>
      <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
                <p className="text-gray-600 mt-1">Gerencie seus contatos, empresas e prospects</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Criar</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCreateDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleNewContact();
                          setShowCreateDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Novo Contato
                      </button>
                      <button
                        onClick={() => {
                          handleNewCompany();
                          setShowCreateDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Nova Empresa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

        {/* Abas */}
        <EntityTabs activeTab={activeTab} onTabChange={setActiveTab} showAllTab={true} />

        {/* Conteúdo das abas */}
        {activeTab === 'all' && (
          <ContactList
            contacts={getAllEntities()}
            onEdit={(entity) => {
              if (entity.entityType === 'contact') {
                handleEditContact(entity);
              } else {
                // Converter ContactWithEntityType para Company
                const company: Company = {
                  id: entity.id,
                  name: (entity as any).name || '',
                  fantasy_name: (entity as any).fantasy_name,
                  email: entity.email,
                  phone: entity.phone || '',
                  document: entity.document || '',
                  document_type: 'cnpj',
                  address: entity.address || {
                    street: '',
                    number: '',
                    complement: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                    zipcode: ''
                  },
                  status: entity.status,
                  notes: entity.notes,
                  organization_id: entity.organization_id,
                  created_at: entity.created_at,
                  updated_at: entity.updated_at
                };
                handleEditCompany(company);
              }
            }}
            onDelete={(id) => {
              const entity = getAllEntities().find(e => e.id === id);
              if (entity?.entityType === 'contact') {
                handleDeleteContact(id);
              } else {
                handleDeleteCompany(id);
              }
            }}
            onView={(entity) => {
              if (entity.entityType === 'contact') {
                handleViewContact(entity);
              } else {
                // Converter ContactWithEntityType para Company
                const company: Company = {
                  id: entity.id,
                  name: (entity as any).name || '',
                  fantasy_name: (entity as any).fantasy_name,
                  email: entity.email,
                  phone: entity.phone || '',
                  document: entity.document || '',
                  document_type: 'cnpj',
                  address: entity.address || {
                    street: '',
                    number: '',
                    complement: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                    zipcode: ''
                  },
                  status: entity.status,
                  notes: entity.notes,
                  organization_id: entity.organization_id,
                  created_at: entity.created_at,
                  updated_at: entity.updated_at
                };
                handleViewCompany(company);
              }
            }}
            onBulkDelete={(ids) => {
              const contactIds = ids.filter(id => {
                const entity = getAllEntities().find(e => e.id === id);
                return entity?.entityType === 'contact';
              });
              const companyIds = ids.filter(id => {
                const entity = getAllEntities().find(e => e.id === id);
                return entity?.entityType === 'company';
              });
              
              if (contactIds.length > 0) handleBulkDeleteContacts(contactIds);
              if (companyIds.length > 0) handleBulkDeleteCompanies(companyIds);
            }}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactList
            contacts={contacts}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onView={handleViewContact}
            onBulkDelete={handleBulkDeleteContacts}
          />
        )}

        {activeTab === 'companies' && (
          <CompanyList
            companies={companies}
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
            onView={handleViewCompany}
            onBulkDelete={handleBulkDeleteCompanies}
          />
        )}

        {/* Drawer para contatos */}
        <ContactDrawer
          isOpen={drawerOpen && selectedContact !== null}
          onClose={handleCloseDrawer}
          contact={selectedContact}
          onSave={handleSaveContact}
          onDelete={handleDeleteContact}
          mode={drawerMode}
        />

        {/* Drawer para empresas */}
        <CompanyDrawer
          isOpen={drawerOpen && selectedCompany !== null}
          onClose={handleCloseDrawer}
          company={selectedCompany}
          onSave={handleSaveCompany}
          onDelete={handleDeleteCompany}
          mode={drawerMode}
        />
      </div>
    </ProtectedLayout>
  );
}