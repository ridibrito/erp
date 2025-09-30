"use client";
import { useState } from 'react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { 
  CreditCard, 
  MessageCircle, 
  Mail, 
  FileText,
  Zap,
  ExternalLink,
  CheckCircle,
  XCircle,
  Calendar,
  MessageSquare,
  Smartphone,
  Cloud,
  Database,
  ShoppingCart,
  Truck,
  FileSpreadsheet,
  Video,
  Phone,
  Mail as MailIcon,
  Globe,
  Shield,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Palette,
  Bell,
  Lock,
  Key,
  RefreshCw,
  Play,
  Pause,
  Building2,
  Wallet,
  Receipt,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Send,
  Store,
  Package,
  Car,
  Plane,
  Ship,
  CreditCard as CreditCardIcon,
  DollarSign,
  Euro,
  Bitcoin,
  Activity,
  PieChart,
  LineChart,
  Target,
  Award,
  Star,
  Heart,
  ThumbsUp,
  AlertTriangle,
  Info,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Briefcase,
  Home,
  MapPin,
  PhoneCall,
  Video as VideoIcon,
  Mic,
  Headphones,
  Monitor,
  Tablet,
  Watch,
  Camera,
  Image,
  Music,
  Film,
  Gamepad2,
  Coffee,
  Utensils,
  Car as CarIcon,
  Bike,
  Bus,
  Train,
  Plane as PlaneIcon,
  Ship as ShipIcon,
  Anchor,
  Compass,
  Map,
  Navigation,
  Flag,
  Trophy,
  Medal,
  Crown,
  Zap as ZapIcon,
  Sun,
  Moon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  Wind,
  Umbrella,
  Thermometer,
  Droplets,
  Flame,
  Sparkles,
  Star as StarIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
  Palette as PaletteIcon,
  Brush,
  PenTool,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Server,
  Wifi,
  Bluetooth,
  Radio,
  Tv,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Watch as WatchIcon,
  Headphones as HeadphonesIcon,
  Speaker,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Mic as MicIcon,
  MicOff,
  Video as VideoIcon2,
  VideoOff,
  Camera as CameraIcon,
  CameraOff,
  Image as ImageIcon,
  ImageOff,
  File,
  FileText as FileTextIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet as FileSpreadsheetIcon,
  FileCheck as FileCheckIcon,
  FileX,
  FilePlus,
  FileMinus,
  FileEdit,
  FileSearch,
  FileDown,
  FileUp,
  Folder,
  FolderOpen as FolderOpenIcon,
  FolderPlus,
  FolderMinus,
  FolderSearch,
  FolderDown,
  FolderUp,
  Archive,
  ArchiveX,
  Book,
  BookOpen as BookOpenIcon,
  BookMarked,
  BookX,
  BookPlus,
  BookMinus,
  BookDown,
  BookUp,
  Newspaper,
  Eye,
  Workflow
} from 'lucide-react';

export default function Page(){
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('integrations');
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const integrations = [
    // Financeiro
    {
      name: 'Banco Inter',
      description: 'Integração com conta bancária para recebimentos',
      icon: Building2,
      status: 'connected',
      category: 'Financeiro'
    },
    {
      name: 'Asaas',
      description: 'Processamento de pagamentos e cobranças',
      icon: CreditCard,
      status: 'connected',
      category: 'Financeiro'
    },
    {
      name: 'Mercado Pago',
      description: 'Pagamentos online e marketplace',
      icon: Wallet,
      status: 'available',
      category: 'Financeiro'
    },
    {
      name: 'Pix',
      description: 'Pagamentos instantâneos via PIX',
      icon: Zap,
      status: 'available',
      category: 'Financeiro'
    },
    {
      name: 'Stripe',
      description: 'Processamento de pagamentos internacionais',
      icon: CreditCard,
      status: 'available',
      category: 'Financeiro'
    },

    // Comunicação
    {
      name: 'WhatsApp Business',
      description: 'Comunicação com clientes via WhatsApp',
      icon: MessageCircle,
      status: 'available',
      category: 'Comunicação'
    },
    {
      name: 'Telegram',
      description: 'Notificações e comunicação via Telegram',
      icon: Send,
      status: 'available',
      category: 'Comunicação'
    },
    {
      name: 'Slack',
      description: 'Comunicação interna e notificações',
      icon: MessageSquare,
      status: 'available',
      category: 'Comunicação'
    },
    {
      name: 'Discord',
      description: 'Comunicação em tempo real para equipes',
      icon: Headphones,
      status: 'available',
      category: 'Comunicação'
    },
    {
      name: 'SMS',
      description: 'Envio de SMS para clientes',
      icon: Smartphone,
      status: 'available',
      category: 'Comunicação'
    },

    // Produtividade
    {
      name: 'Google Calendar',
      description: 'Sincronização de calendário e agendamentos',
      icon: Calendar,
      status: 'available',
      category: 'Produtividade'
    },
    {
      name: 'Google Workspace',
      description: 'Sincronização com Google Drive e Calendar',
      icon: Mail,
      status: 'available',
      category: 'Produtividade'
    },
    {
      name: 'Microsoft 365',
      description: 'Integração com Office 365 e Teams',
      icon: Building2,
      status: 'available',
      category: 'Produtividade'
    },
    {
      name: 'Notion',
      description: 'Gestão de projetos e documentação',
      icon: BookOpen,
      status: 'available',
      category: 'Produtividade'
    },
    {
      name: 'Trello',
      description: 'Gestão de tarefas e projetos',
      icon: List,
      status: 'available',
      category: 'Produtividade'
    },
    {
      name: 'Asana',
      description: 'Gestão de projetos e equipes',
      icon: Target,
      status: 'available',
      category: 'Produtividade'
    },

    // E-commerce
    {
      name: 'Shopify',
      description: 'Integração com loja virtual',
      icon: Store,
      status: 'available',
      category: 'E-commerce'
    },
    {
      name: 'WooCommerce',
      description: 'Loja virtual WordPress',
      icon: ShoppingCart,
      status: 'available',
      category: 'E-commerce'
    },
    {
      name: 'Mercado Livre',
      description: 'Marketplace e vendas online',
      icon: Globe,
      status: 'available',
      category: 'E-commerce'
    },
    {
      name: 'Nuvemshop',
      description: 'Plataforma de e-commerce brasileira',
      icon: Store,
      status: 'available',
      category: 'E-commerce'
    },

    // Logística
    {
      name: 'Correios',
      description: 'Rastreamento e cálculo de frete',
      icon: Truck,
      status: 'available',
      category: 'Logística'
    },
    {
      name: 'Jadlog',
      description: 'Transportadora e rastreamento',
      icon: Car,
      status: 'available',
      category: 'Logística'
    },
    {
      name: 'Total Express',
      description: 'Transportadora express',
      icon: Plane,
      status: 'available',
      category: 'Logística'
    },

    // Documentos
    {
      name: 'Clicksign',
      description: 'Assinatura digital de documentos',
      icon: FileCheck,
      status: 'available',
      category: 'Documentos'
    },
    {
      name: 'DocuSign',
      description: 'Assinatura eletrônica de documentos',
      icon: FileText,
      status: 'available',
      category: 'Documentos'
    },
    {
      name: 'Google Drive',
      description: 'Armazenamento e compartilhamento de arquivos',
      icon: Cloud,
      status: 'available',
      category: 'Documentos'
    },
    {
      name: 'Dropbox',
      description: 'Sincronização de arquivos',
      icon: Cloud,
      status: 'available',
      category: 'Documentos'
    },

    // CRM e Marketing
    {
      name: 'HubSpot',
      description: 'CRM e automação de marketing',
      icon: Users,
      status: 'available',
      category: 'CRM'
    },
    {
      name: 'Mailchimp',
      description: 'Email marketing e automação',
      icon: MailIcon,
      status: 'available',
      category: 'CRM'
    },
    {
      name: 'ActiveCampaign',
      description: 'Automação de marketing e CRM',
      icon: Activity,
      status: 'available',
      category: 'CRM'
    },
    {
      name: 'RD Station',
      description: 'Marketing digital e automação',
      icon: BarChart3,
      status: 'available',
      category: 'CRM'
    },

    // Automação
    {
      name: 'Zapier',
      description: 'Automações e integrações avançadas',
      icon: Zap,
      status: 'available',
      category: 'Automação'
    },
    {
      name: 'Make (Integromat)',
      description: 'Automação visual de workflows',
      icon: Workflow,
      status: 'available',
      category: 'Automação'
    },
    {
      name: 'IFTTT',
      description: 'Automações simples entre apps',
      icon: Zap,
      status: 'available',
      category: 'Automação'
    },

    // Analytics
    {
      name: 'Google Analytics',
      description: 'Análise de dados e métricas',
      icon: BarChart3,
      status: 'available',
      category: 'Analytics'
    },
    {
      name: 'Facebook Pixel',
      description: 'Rastreamento de conversões',
      icon: Target,
      status: 'available',
      category: 'Analytics'
    },
    {
      name: 'Hotjar',
      description: 'Análise de comportamento do usuário',
      icon: Eye,
      status: 'available',
      category: 'Analytics'
    },

    // Segurança
    {
      name: 'Auth0',
      description: 'Autenticação e autorização',
      icon: Shield,
      status: 'available',
      category: 'Segurança'
    },
    {
      name: 'Cloudflare',
      description: 'Segurança e performance web',
      icon: Cloud,
      status: 'available',
      category: 'Segurança'
    },
    {
      name: 'Let\'s Encrypt',
      description: 'Certificados SSL gratuitos',
      icon: Lock,
      status: 'available',
      category: 'Segurança'
    }
  ];

  // Agrupar por categoria
  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, typeof integrations>);

  return (
    <div className="flex h-full">
      <SettingsSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar} 
        activeSection={activeSection}
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Integrações</h1>
            <p className="text-muted-foreground">Conecte seus serviços favoritos</p>
          </div>

          {/* Integrations by Category */}
          {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryIntegrations.map((integration, index) => {
                  const Icon = integration.icon;
                  const isConnected = integration.status === 'connected';
                  
                  return (
                    <div key={index} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex items-center space-x-2">
                          {isConnected ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-sm">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <button className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isConnected 
                              ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}>
                            <span>{isConnected ? 'Conectado' : 'Conectar'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* API Documentation */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Documentação da API</h3>
              <button className="text-sm text-primary hover:underline">Ver documentação completa</button>
            </div>
            <p className="text-muted-foreground text-sm">
              Desenvolva integrações personalizadas usando nossa API REST. 
              Acesse a documentação completa para obter exemplos de código e endpoints disponíveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
