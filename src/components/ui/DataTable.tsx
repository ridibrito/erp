'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedItems: T[]) => void;
  variant?: 'default' | 'destructive';
  confirmMessage?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  searchFields?: (keyof T)[];
  searchPlaceholder?: string;
  bulkActions?: BulkAction<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  className?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  searchFields = [],
  searchPlaceholder = 'Buscar...',
  bulkActions = [],
  onRowClick,
  emptyMessage = 'Nenhum item encontrado',
  emptyDescription = 'Tente ajustar os filtros ou adicionar novos itens',
  itemsPerPageOptions = [10, 20, 50, 100],
  defaultItemsPerPage = 10,
  className = ''
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
  // Estados para seleção em massa
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [currentBulkAction, setCurrentBulkAction] = useState<BulkAction<T> | null>(null);

  // Filtrar e ordenar dados
  const filteredData = data
    .filter(item => {
      if (!searchTerm) return true;
      
      if (searchFields.length === 0) {
        // Buscar em todos os campos se não especificado
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return searchFields.some(field => 
        String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Funções para ordenação
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  // Funções para seleção em massa
  const handleSelectAll = () => {
    if (selectedItems.size === paginatedData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedData.map(item => String(item[keyField]))));
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkAction = (action: BulkAction<T>) => {
    if (action.confirmMessage) {
      setCurrentBulkAction(action);
      setShowBulkActionModal(true);
    } else {
      const selectedData = data.filter(item => selectedItems.has(String(item[keyField])));
      action.onClick(selectedData);
      setSelectedItems(new Set());
    }
  };

  const confirmBulkAction = () => {
    if (currentBulkAction) {
      const selectedData = data.filter(item => selectedItems.has(String(item[keyField])));
      currentBulkAction.onClick(selectedData);
      setSelectedItems(new Set());
      setShowBulkActionModal(false);
      setCurrentBulkAction(null);
    }
  };

  const cancelBulkAction = () => {
    setShowBulkActionModal(false);
    setCurrentBulkAction(null);
  };

  // Funções para dropdown
  const toggleDropdown = (itemId: string) => {
    if (openDropdown === itemId) {
      setOpenDropdown(null);
    } else {
      const button = buttonRefs.current[itemId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right - window.scrollX
        });
      }
      setOpenDropdown(itemId);
    }
  };

  // Fechar dropdown ao clicar fora
  const handleClickOutside = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest('.dropdown-container')) {
      setOpenDropdown(null);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`} onClick={handleClickOutside}>
      {/* Cabeçalho com busca */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Itens por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de ações em massa */}
      {selectedItems.size > 0 && bulkActions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.size} {selectedItems.size === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleBulkAction(action)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    action.variant === 'destructive'
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {bulkActions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  onClick={column.sortable ? () => handleSort(String(column.key)) : undefined}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (bulkActions.length > 0 ? 2 : 1)} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium">{emptyMessage}</p>
                    <p className="text-sm">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={String(item[keyField])} className="hover:bg-gray-50">
                  {bulkActions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(String(item[keyField]))}
                        onChange={() => handleSelectItem(String(item[keyField]))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {column.render 
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '')
                      }
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <div className="relative dropdown-container">
                        <button
                          ref={(el) => (buttonRefs.current[String(item[keyField])] = el)}
                          onClick={() => toggleDropdown(String(item[keyField]))}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ações"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer com estatísticas e paginação */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} itens
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Ação em Massa */}
      {showBulkActionModal && currentBulkAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentBulkAction.label}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {currentBulkAction.confirmMessage}
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={cancelBulkAction}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmBulkAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portal do Dropdown */}
      {openDropdown && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]"
          style={{ 
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`
          }}
        >
          <button
            onClick={() => {
              const item = data.find(d => String(d[keyField]) === openDropdown);
              if (item && onRowClick) {
                onRowClick(item);
              }
              setOpenDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Visualizar
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}