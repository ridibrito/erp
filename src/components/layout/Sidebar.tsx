"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { can } from '@/lib/authz';
import {
  LayoutDashboard, Users, CreditCard, FolderOpen, BarChart3, Settings, Plus, TrendingUp, TrendingDown, Building2, PieChart, Activity, Briefcase, FileText, Receipt
} from 'lucide-react';

const NAV = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    scopes: ['dashboard:view']
  },

  {
    label: 'Gestão de Negócios',
    href: '/crm',
    icon: Briefcase,
    scopes: ['crm:read'],
    submenu: [
      { label: 'Clientes', href: '/crm/clientes', icon: Users },
      { label: 'Negócios', href: '/crm/negocios', icon: Briefcase },
      { label: 'Propostas', href: '/crm/propostas', icon: FileText },
      { label: 'Contratos', href: '/crm/contratos', icon: Receipt },
    ]
  },
  {
    label: 'Financeiro',
    href: '/financeiro',
    icon: CreditCard,
    scopes: ['finance:read'],
    submenu: [
      { label: 'Contas a Pagar', href: '/financeiro/pagar', icon: TrendingDown },
      { label: 'Contas a Receber', href: '/financeiro/receber', icon: TrendingUp },
      { label: 'Movimentação', href: '/financeiro/movimentacao', icon: BarChart3 },
      { label: 'Relatórios', href: '/financeiro/relatorios', icon: PieChart },
    ]
  },
  {
    label: 'Projetos',
    href: '/projetos',
    icon: FolderOpen,
    scopes: ['projects:read']
  },
  {
    label: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
    scopes: ['reports:view'],
    submenu: [
      { label: 'DRE', href: '/relatorios/dre', icon: PieChart },
      { label: 'Outros relatórios', href: '/relatorios/outros', icon: Activity },
    ]
  },
] as const;

export function Sidebar({ scopes }: { scopes: string[] }) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (label: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedMenus(newExpanded);
  };

  return (
    <aside className="w-64 shrink-0 bg-[#1F2937] text-white flex flex-col h-screen">
      <div className="flex items-center h-16 border-b border-gray-700 px-4 shrink-0">
        <div className="flex items-center space-x-2">
          <Building2 className="w-8 h-8 text-blue-400" />
          <h1 className="font-semibold text-lg">Nexus ERP</h1>
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="p-4 border-b border-gray-700 shrink-0">
        <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Acesso Rápido</h3>
        <div className="flex space-x-1">
          <button className="flex-1 h-10 bg-gray-800/50 border border-gray-700/50 text-blue-400 hover:text-blue-300 hover:bg-gray-700 hover:border-gray-600 rounded-md transition-all duration-200 flex items-center justify-center" title="Novo Negócio">
            <Plus className="w-4 h-4" />
          </button>
          <button className="flex-1 h-10 bg-gray-800/50 border border-gray-700/50 text-green-400 hover:text-green-300 hover:bg-gray-700 hover:border-gray-600 rounded-md transition-all duration-200 flex items-center justify-center" title="Nova Receita">
            <TrendingUp className="w-4 h-4" />
          </button>
          <button className="flex-1 h-10 bg-gray-800/50 border border-gray-700/50 text-red-400 hover:text-red-300 hover:bg-gray-700 hover:border-gray-600 rounded-md transition-all duration-200 flex items-center justify-center" title="Nova Despesa">
            <TrendingDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.filter((i) => can(scopes, [...i.scopes])).map((item) => {
          const active = pathname.startsWith(item.href);
          const hasSubmenu = 'submenu' in item && item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus.has(item.label);

          return (
            <div key={item.href}>
              {hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {('submenu' in item ? item.submenu : []).map((subitem: any) => {
                        const subActive = pathname === subitem.href;
                        return (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                              subActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <subitem.icon className="w-4 h-4" />
                              <span>{subitem.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 shrink-0">
        <Link
          href="/settings"
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname.startsWith('/settings')
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-700 text-gray-300 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
