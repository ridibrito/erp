"use client";
import {
  Users, Shield, Zap, Building2, CreditCard, Mail, Bell, Palette, Database, Globe, FileText, Key,
  ChevronLeft, ChevronRight, Settings, Workflow, Layers, Wrench, MessageSquare, Target, FolderOpen, Tag, Wallet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SETTINGS_NAV = [
  {
    id: 'general',
    label: 'Geral',
    icon: Building2,
    href: '/settings'
  },
  {
    id: 'users',
    label: 'Usuários & Permissões',
    icon: Users,
    href: '/settings?section=users'
  },
  {
    id: 'integrations',
    label: 'Integrações',
    icon: Zap,
    href: '/settings/integracoes'
  },
  {
    id: 'finance',
    label: 'Financeiro',
    icon: CreditCard,
    href: '/settings?section=finance'
  },
  {
    id: 'workflow',
    label: 'Workflow & Pipelines',
    icon: Workflow,
    href: '/settings/pipelines'
  },
  {
    id: 'services',
    label: 'Serviços & Categorias',
    icon: Wrench,
    href: '/settings?section=services'
  },
  {
    id: 'communications',
    label: 'Comunicações',
    icon: MessageSquare,
    href: '/settings?section=communications'
  },

] as const;

interface SettingsSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
}

export function SettingsSidebar({ isCollapsed, onToggle, activeSection }: SettingsSidebarProps) {
  const pathname = usePathname();
  
  const isActiveSection = (section: typeof SETTINGS_NAV[number]) => {
    // Para páginas com rotas próprias (integracoes, pipelines)
    if (section.href.includes('/settings/')) {
      return pathname === section.href;
    }
    
    // Para seções na página principal (/settings)
    if (section.href === '/settings') {
      return pathname === '/settings' && !activeSection || activeSection === 'general';
    }
    
    // Para seções com query params
    return activeSection === section.id;
  };
  
  return (
    <aside className={`shrink-0 border-r border-border bg-muted/30 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && <h2 className="text-lg font-semibold">Configurações</h2>}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <nav className="space-y-1">
          {SETTINGS_NAV.map((section) => {
            const Icon = section.icon;
            const isActive = isActiveSection(section);
            
            return (
              <Link
                key={section.id}
                href={section.href}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={isCollapsed ? section.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="font-medium">{section.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
