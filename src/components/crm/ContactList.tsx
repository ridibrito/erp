'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Check, Users, Building2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Contact } from '@/services/crmService';

// Extend Contact interface for display purposes
interface ContactWithEntityType extends Contact {
  entityType?: 'contact' | 'company';
  company_name?: string;
}

interface ContactListProps {
  contacts: ContactWithEntityType[];
  onEdit: (contact: ContactWithEntityType) => void;
  onDelete: (contactId: string) => void;
  onView: (contact: ContactWithEntityType) => void;
  onBulkDelete?: (contactIds: string[]) => void;
}

export default function ContactList({ contacts, onEdit, onDelete, onView, onBulkDelete }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
  // Estados para seleção em massa
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [avatarRefresh, setAvatarRefresh] = useState(0);

  // Funções para controlar dropdown
  const toggleDropdown = (contactId: string) => {
    if (openDropdown === contactId) {
      setOpenDropdown(null);
    } else {
      const button = buttonRefs.current[contactId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          right: window.innerWidth - rect.right + window.scrollX
        });
      }
      setOpenDropdown(contactId);
    }
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  // Listener para mudanças no localStorage (avatars)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('contact_avatar_') || e.key.startsWith('company_avatar_'))) {
        setAvatarRefresh(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também escutar mudanças no mesmo tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key.startsWith('contact_avatar_') || key.startsWith('company_avatar_')) {
        setAvatarRefresh(prev => prev + 1);
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Filtrar e ordenar contatos
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      (contact.entityType === 'company' 
        ? (contact.fantasy_name || contact.name || '').toLowerCase()
        : `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase()
      ).includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone && contact.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue: string;
    let bValue: string;

    switch (sortBy) {
      case 'name':
        aValue = a.entityType === 'company' 
          ? (a.fantasy_name || a.name || '').toLowerCase()
          : `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
        bValue = b.entityType === 'company' 
          ? (b.fantasy_name || b.name || '').toLowerCase()
          : `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
        break;
      case 'created_at':
        aValue = a.created_at;
        bValue = b.created_at;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = '';
        bValue = '';
    }

    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Paginação
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  // Funções de seleção em massa
  const handleSelectAll = () => {
    if (selectedContacts.size === paginatedContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(paginatedContacts.map(contact => contact.id)));
    }
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedContacts.size > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const confirmBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedContacts));
      setSelectedContacts(new Set());
      setShowBulkDeleteModal(false);
    }
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
  };

  // Funções de exclusão individual
  const handleDelete = (contactId: string) => {
    setContactToDelete(contactId);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      onDelete(contactToDelete);
      setShowDeleteModal(false);
      setContactToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  // Função para obter o nome de exibição
  const getDisplayName = (contact: ContactWithEntityType) => {
    if (contact.entityType === 'company') {
      return contact.fantasy_name || contact.name || 'Empresa sem nome';
    } else {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'N/A';
    }
  };

  // Função para obter o subtítulo
  const getSubtitle = (contact: ContactWithEntityType) => {
    if (contact.entityType === 'company') {
      return `CNPJ: ${contact.document || 'N/A'}`;
    } else {
      return contact.position ? `${contact.position}` : 'Pessoa Física';
    }
  };

  // Função para obter o status em português
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'prospect': return 'Prospect';
      default: return status;
    }
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="prospect">Prospect</option>
        </select>
      </div>

      {/* Barra de ações em massa */}
      {selectedContacts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              {selectedContacts.size} {selectedContacts.size === 1 ? 'contato selecionado' : 'contatos selecionados'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <Trash2 className="h-4 w-4 inline mr-1" />
              Excluir
            </button>
            <button
              onClick={() => setSelectedContacts(new Set())}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabela de contatos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.size === paginatedContacts.length && paginatedContacts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {(() => {
                          // Usar avatarRefresh para forçar re-renderização
                          // Determinar se é empresa ou contato para buscar o avatar correto
                          const isCompany = contact.entityType === 'company' || contact.type === 'company';
                          const avatarKey = isCompany ? `company_avatar_${contact.id}` : `contact_avatar_${contact.id}`;
                          const avatar = localStorage.getItem(avatarKey);
                          
                          return avatar ? (
                            <img 
                              key={`${contact.id}-${avatarRefresh}`}
                              src={avatar} 
                              alt="Avatar" 
                              className="h-10 w-10 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              {isCompany ? (
                                <Building2 className="h-5 w-5 text-gray-600" />
                              ) : (
                                <Users className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => onView(contact)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 text-left"
                        >
                          {getDisplayName(contact)}
                        </button>
                        <div className="text-sm text-gray-500">
                          {getSubtitle(contact)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.company_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.position || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                      {getStatusText(contact.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contact.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      ref={(el) => (buttonRefs.current[contact.id] = el)}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(contact.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé com paginação */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Mostrar
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">
                por página
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown de ações */}
      {openDropdown && (
        createPortal(
          <div
            className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
            }}
          >
            <button
              onClick={() => handleDelete(openDropdown)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </button>
          </div>,
          document.body
        )
      )}

      {/* Modal de confirmação de exclusão individual */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar exclusão
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão em massa */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar exclusão em massa
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir {selectedContacts.size} {selectedContacts.size === 1 ? 'contato' : 'contatos'}? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelBulkDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Excluir {selectedContacts.size} {selectedContacts.size === 1 ? 'contato' : 'contatos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
