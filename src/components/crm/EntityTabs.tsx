'use client';

import { useState } from 'react';
import { Building2, Users } from 'lucide-react';

interface EntityTabsProps {
  activeTab: 'all' | 'companies' | 'contacts';
  onTabChange: (tab: 'all' | 'companies' | 'contacts') => void;
  showAllTab?: boolean;
}

export default function EntityTabs({ activeTab, onTabChange, showAllTab = false }: EntityTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {showAllTab && (
          <button
            onClick={() => onTabChange('all' as any)}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>Todos</span>
          </button>
        )}
        <button
          onClick={() => onTabChange('companies')}
          className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
            activeTab === 'companies'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Empresas</span>
        </button>
        <button
          onClick={() => onTabChange('contacts')}
          className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
            activeTab === 'contacts'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Contatos</span>
        </button>
      </nav>
    </div>
  );
}
