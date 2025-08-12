"use client";
import {
  Users, Shield, Zap, Building2, CreditCard, Mail, Bell, Palette, Database, Globe, FileText, Key,
  ChevronLeft, ChevronRight, Settings, Workflow, Layers, Wrench, MessageSquare, Target, FolderOpen, Tag, Wallet
} from 'lucide-react';
import Link from 'next/link';

const SETTINGS_NAV = [
  {
    id: 'general',
    label: 'Geral',
    icon: Building2,
  },
  {
    id: 'users',
    label: 'Usuários & Permissões',
    icon: Users,
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
  },
  {
    id: 'workflow',
    label: 'Workflow & Pipelines',
    icon: Workflow,
  },
  {
    id: 'services',
    label: 'Serviços & Categorias',
    icon: Wrench,
  },
  {
    id: 'communications',
    label: 'Comunicações',
    icon: MessageSquare,
  },

] as const;

interface SettingsSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function SettingsSidebar({ isCollapsed, onToggle, activeSection, onSectionChange }: SettingsSidebarProps) {
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
        
        <nav className="space-y-2">
          {SETTINGS_NAV.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            // Se tem href, é um link externo
            if ('href' in section) {
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={isCollapsed ? section.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{section.label}</span>}
                </Link>
              );
            }
            
            // Senão, é um botão normal
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={isCollapsed ? section.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{section.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
