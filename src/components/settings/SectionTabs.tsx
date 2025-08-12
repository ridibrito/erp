"use client";
import {
  Building2, Palette, Bell, Users, Shield, Mail, Zap, Key, Globe, CreditCard, FileText, Database,
  Workflow, Layers, Wrench, Tag, MessageSquare, FileText as FileTextIcon, Target, FolderOpen, Wallet, Settings,
  Banknote, CreditCard as CreditCardIcon, DollarSign, Building
} from 'lucide-react';

const SECTION_TABS = {
  general: [
    { id: 'empresa', label: 'Perfil da Empresa', icon: Building2 },
    { id: 'preferencias', label: 'Preferências', icon: Palette },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'departamentos', label: 'Departamentos', icon: FolderOpen },
    { id: 'configuracoes-gerais', label: 'Configurações Gerais', icon: Settings },
  ],
  users: [
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'papeis', label: 'Papéis e Permissões', icon: Shield },
    { id: 'convites', label: 'Convites', icon: Mail },
  ],
  integrations: [
    { id: 'integracoes', label: 'Serviços Conectados', icon: Zap },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Globe },
  ],
  finance: [
    { id: 'contas-bancarias', label: 'Contas Bancárias', icon: Banknote },
    { id: 'meios-pagamento', label: 'Meios de Pagamento', icon: CreditCardIcon },
    { id: 'meios-recebimento', label: 'Meios de Recebimento', icon: DollarSign },
    { id: 'centro-custos', label: 'Centro de Custos', icon: Target },
    { id: 'fornecedores', label: 'Fornecedores', icon: Building },
    { id: 'configuracoes-fiscais', label: 'Configurações Fiscais', icon: FileText },
    { id: 'moedas', label: 'Moedas', icon: Database },
  ],
  workflow: [
    { id: 'pipelines', label: 'Pipelines', icon: Workflow },
    { id: 'etapas', label: 'Etapas', icon: Layers },
    { id: 'templates', label: 'Templates', icon: FileTextIcon },
  ],
  services: [
    { id: 'servicos', label: 'Serviços', icon: Wrench },
    { id: 'categorias', label: 'Categorias', icon: Tag },
  ],
  communications: [
    { id: 'modelos-email', label: 'Modelos de Email', icon: MessageSquare },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'templates-comunicacao', label: 'Templates', icon: FileTextIcon },
  ],
} as const;

interface SectionTabsProps {
  section: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SectionTabs({ section, activeTab, onTabChange }: SectionTabsProps) {
  const tabs = SECTION_TABS[section as keyof typeof SECTION_TABS] || [];
  return (
    <div className="border-b border-border">
      <nav className="flex flex-wrap gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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

export { SECTION_TABS };
