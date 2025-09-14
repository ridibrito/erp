'use client';

import { useState, useEffect } from 'react';
import ClientList from '@/components/crm/ClientList';
import ClientForm from '@/components/crm/ClientForm';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  document_type: 'cpf' | 'cnpj';
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  };
  status: 'active' | 'inactive' | 'prospect';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [viewingClient, setViewingClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);

  // Dados mock para demonstração
  useEffect(() => {
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        document: '12345678901',
        document_type: 'cpf',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01234-567'
        },
        status: 'active',
        notes: 'Cliente preferencial',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Empresa ABC Ltda',
        email: 'contato@empresaabc.com',
        phone: '(11) 3333-4444',
        document: '12345678000195',
        document_type: 'cnpj',
        address: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01310-100'
        },
        status: 'prospect',
        notes: 'Empresa em processo de negociação',
        created_at: '2024-01-20T14:30:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '3',
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(11) 88888-7777',
        document: '98765432100',
        document_type: 'cpf',
        address: {
          street: 'Rua da Paz',
          number: '456',
          neighborhood: 'Vila Madalena',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '05433-000'
        },
        status: 'inactive',
        notes: 'Cliente inativo há 6 meses',
        created_at: '2023-12-10T09:15:00Z',
        updated_at: '2024-01-05T16:45:00Z'
      }
    ];

    // Simular carregamento
    setTimeout(() => {
      setClients(mockClients);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveClient = (clientData: Client) => {
    if (editingClient) {
      // Atualizar cliente existente
      setClients(prev => prev.map(client => 
        client.id === editingClient.id 
          ? { ...clientData, id: editingClient.id, updated_at: new Date().toISOString() }
          : client
      ));
    } else {
      // Adicionar novo cliente
      const newClient: Client = {
        ...clientData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setClients(prev => [newClient, ...prev]);
    }
    
    setShowForm(false);
    setEditingClient(undefined);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(prev => prev.filter(client => client.id !== clientId));
    }
  };

  const handleViewClient = (client: Client) => {
    setViewingClient(client);
  };

  const handleNewClient = () => {
    setEditingClient(undefined);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ClientForm
        client={editingClient}
        onSave={handleSaveClient}
        onCancel={handleCancelForm}
      />
    );
  }

  if (viewingClient) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes do Cliente</h2>
            <button
              onClick={() => setViewingClient(undefined)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nome</dt>
                  <dd className="text-sm text-gray-900">{viewingClient.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{viewingClient.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                  <dd className="text-sm text-gray-900">{viewingClient.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Documento</dt>
                  <dd className="text-sm text-gray-900">
                    {viewingClient.document_type === 'cpf' ? 'CPF' : 'CNPJ'}: {viewingClient.document}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      viewingClient.status === 'active' ? 'bg-green-100 text-green-800' :
                      viewingClient.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {viewingClient.status === 'active' ? 'Ativo' :
                       viewingClient.status === 'inactive' ? 'Inativo' : 'Prospect'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Endereço</dt>
                  <dd className="text-sm text-gray-900">
                    {viewingClient.address.street}, {viewingClient.address.number}
                    {viewingClient.address.complement && `, ${viewingClient.address.complement}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bairro</dt>
                  <dd className="text-sm text-gray-900">{viewingClient.address.neighborhood}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cidade/Estado</dt>
                  <dd className="text-sm text-gray-900">{viewingClient.address.city}/{viewingClient.address.state}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">CEP</dt>
                  <dd className="text-sm text-gray-900">{viewingClient.address.zipcode}</dd>
                </div>
              </dl>
            </div>
          </div>

          {viewingClient.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Observações</h3>
              <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                {viewingClient.notes}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => {
                setViewingClient(undefined);
                handleEditClient(viewingClient);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Editar Cliente
            </button>
            <button
              onClick={() => setViewingClient(undefined)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie seus clientes e prospects</p>
        </div>
        <button
          onClick={handleNewClient}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="h-5 w-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Cliente
        </button>
      </div>

      <ClientList
        clients={clients}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        onView={handleViewClient}
      />
    </div>
  );
}