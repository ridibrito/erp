"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaginatedResponse } from '@/types/database';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: PaginatedResponse<T> | null;
  columns: Column<T>[];
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onExport?: () => void;
  actions?: (row: T) => React.ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  onPageChange,
  onLimitChange,
  onSortChange,
  onSearch,
  onFilter,
  onExport,
  actions,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'Nenhum registro encontrado',
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (columnKey: string) => {
    const newSortOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(columnKey);
    setSortOrder(newSortOrder);
    onSortChange?.(columnKey, newSortOrder);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data?.data.map(row => row.id) || [];
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const isAllSelected = useMemo(() => {
    if (!data?.data.length) return false;
    return data.data.every(row => selectedRows.has(row.id));
  }, [data?.data, selectedRows]);

  const isIndeterminate = useMemo(() => {
    return selectedRows.size > 0 && selectedRows.size < (data?.data.length || 0);
  }, [selectedRows.size, data?.data.length]);

  if (!data && !loading) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-gray-500", className)}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium">Nenhum dado disponível</p>
          <p className="text-sm text-gray-400">Configure os dados para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200", className)}>
      {/* Header com busca e ações */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {onSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {onFilter && (
              <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.width && `w-${column.width}`,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-gray-700 select-none'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={cn(
                    "flex items-center space-x-1",
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}>
                    <span>{column.label}</span>
                    {column.sortable && sortBy === column.key && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center"
                >
                  <div className="text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data?.data.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selectedRows.has(row.id) && "bg-blue-50"
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-sm text-gray-900",
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render
                        ? column.render((row as any)[column.key], row)
                        : (row as any)[column.key] || '-'}
                    </td>
                  ))}
                  
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {data && data.pagination.total_pages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span>
                Mostrando {data.pagination.startItem} a {data.pagination.endItem} de {data.pagination.totalItems} registros
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Seletor de itens por página */}
              {onLimitChange && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Itens por página:</span>
                  <select
                    value={data.pagination.limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              )}

              {/* Navegação */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onPageChange?.(1)}
                  disabled={data.pagination.page === 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onPageChange?.(data.pagination.page - 1)}
                  disabled={data.pagination.page === 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 text-sm text-gray-700">
                  Página {data.pagination.page} de {data.pagination.total_pages}
                </span>

                <button
                  onClick={() => onPageChange?.(data.pagination.page + 1)}
                  disabled={data.pagination.page === data.pagination.total_pages}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onPageChange?.(data.pagination.total_pages)}
                  disabled={data.pagination.page === data.pagination.total_pages}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de ações para a tabela
export function TableActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-1">
      {children}
    </div>
  );
}

// Botão de ação da tabela
export function TableActionButton({
  onClick,
  icon: Icon,
  label,
  variant = 'default',
  size = 'sm',
}: {
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  size?: 'sm' | 'md';
}) {
  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    primary: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
    danger: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    success: 'text-green-600 hover:text-green-700 hover:bg-green-50',
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded transition-colors',
        variantClasses[variant],
        sizeClasses[size]
      )}
      title={label}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}
