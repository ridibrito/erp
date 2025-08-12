"use client";
import { useState } from 'react';
import { 
  Users, 
  Shield, 
  Zap, 
  Building2, 
  CreditCard, 
  Mail, 
  Bell,
  Palette,
  Database,
  Globe,
  FileText,
  Key
} from 'lucide-react';

const TABS = [
  {
    id: 'general',
    label: 'Geral',
    icon: Building2,
    items: [
      { label: 'Perfil da Empresa', href: '/settings/empresa', icon: Building2 },
      { label: 'Preferências', href: '/settings/preferencias', icon: Palette },
      { label: 'Notificações', href: '/settings/notificacoes', icon: Bell },
    ]
  },
  {
    id: 'users',
    label: 'Usuários & Permissões',
    icon: Users,
    items: [
      { label: 'Usuários', href: '/settings/usuarios', icon: Users },
      { label: 'Papéis e Permissões', href: '/settings/papeis', icon: Shield },
      { label: 'Convites', href: '/settings/convites', icon: Mail },
    ]
  },
  {
    id: 'integrations',
    label: 'Integrações',
    icon: Zap,
    items: [
      { label: 'Serviços Conectados', href: '/settings/integracoes', icon: Zap },
      { label: 'API Keys', href: '/settings/api-keys', icon: Key },
      { label: 'Webhooks', href: '/settings/webhooks', icon: Globe },
    ]
  },
  {
    id: 'finance',
    label: 'Financeiro',
    icon: CreditCard,
    items: [
      { label: 'Contas Bancárias', href: '/settings/contas-bancarias', icon: CreditCard },
      { label: 'Configurações Fiscais', href: '/settings/fiscal', icon: FileText },
      { label: 'Moedas', href: '/settings/moedas', icon: Database },
    ]
  },
] as const;

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="flex space-x-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export { TABS };
