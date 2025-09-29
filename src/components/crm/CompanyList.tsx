'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Check, Building2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Company } from '@/services/crmService';

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
  onView: (company: Company) => void;
  onBulkDelete?: (companyIds: string[]) => void;
}

export default function CompanyList({ companies, onEdit, onDelete, onView, onBulkDelete }: CompanyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
  // Estados para seleção em massa
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [avatarRefresh, setAvatarRefresh] = useState(0);

  // Funções para controlar dropdown
  const toggleDropdown = (companyId: string) => {
    if (openDropdown === companyId) {
      setOpenDropdown(null);
    } else {
      const button = buttonRefs.current[companyId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          right: window.innerWidth - rect.right + window.scrollX
        });
      }
      setOpenDropdown(companyId);
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
      if (e.key && e.key.startsWith('company_avatar_')) {
        setAvatarRefresh(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também escutar mudanças no mesmo tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key.startsWith('company_avatar_')) {
        setAvatarRefresh(prev => prev + 1);
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Filtrar e ordenar empresas
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      (company.fantasy_name || company.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.phone.includes(searchTerm) ||
      company.document.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue: string;
    let bValue: string;

    switch (sortBy) {
      case 'name':
        aValue = (a.fantasy_name || a.name || '').toLowerCase();
        bValue = (b.fantasy_name || b.name || '').toLowerCase();
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
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  // Funções de seleção em massa
  const handleSelectAll = () => {
    if (selectedCompanies.size === paginatedCompanies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(paginatedCompanies.map(company => company.id)));
    }
  };

  const handleSelectCompany = (companyId: string) => {
    const newSelected = new Set(selectedCompanies);
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId);
    } else {
      newSelected.add(companyId);
    }
    setSelectedCompanies(newSelected);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedCompanies.size > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const confirmBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedCompanies));
      setSelectedCompanies(new Set());
      setShowBulkDeleteModal(false);
    }
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
  };

  // Funções de exclusão individual
  const handleDelete = (companyId: string) => {
    setCompanyToDelete(companyId);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      onDelete(companyToDelete);
      setShowDeleteModal(false);
      setCompanyToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCompanyToDelete(null);
  };

  // Função para obter o nome de exibição
  const getDisplayName = (company: Company) => {
    return company.fantasy_name || company.name || 'Empresa sem nome';
  };

  // Função para obter o subtítulo
  const getSubtitle = (company: Company) => {
    return company.name || 'Pessoa Jurídica';
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
            placeholder="Buscar empresas..."
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
      {selectedCompanies.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              {selectedCompanies.size} {selectedCompanies.size === 1 ? 'empresa selecionada' : 'empresas selecionadas'}
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
              onClick={() => setSelectedCompanies(new Set())}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabela de empresas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.size === paginatedCompanies.length && paginatedCompanies.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
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
              {paginatedCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.has(company.id)}
                      onChange={() => handleSelectCompany(company.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {(() => {
                          // Usar avatarRefresh para forçar re-renderização
                          const avatar = localStorage.getItem(`company_avatar_${company.id}`);
                          return avatar ? (
                            <img 
                              key={`${company.id}-${avatarRefresh}`}
                              src={avatar} 
                              alt="Avatar" 
                              className="h-10 w-10 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-600" />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => onView(company)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 text-left"
                        >
                          {getDisplayName(company)}
                        </button>
                        <div className="text-sm text-gray-500">
                          {getSubtitle(company)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.document}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                      {getStatusText(company.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(company.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      ref={(el) => (buttonRefs.current[company.id] = el)}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(company.id);
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
              Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.
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
              Tem certeza que deseja excluir {selectedCompanies.size} {selectedCompanies.size === 1 ? 'empresa' : 'empresas'}? Esta ação não pode ser desfeita.
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
                Excluir {selectedCompanies.size} {selectedCompanies.size === 1 ? 'empresa' : 'empresas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
