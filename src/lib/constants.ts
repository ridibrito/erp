// Constantes do sistema Nexus ERP

// ===== CONFIGURAÇÕES GERAIS =====
export const APP_CONFIG = {
  name: 'Nexus ERP',
  version: '1.0.0',
  description: 'Sistema ERP completo para gestão empresarial',
  company: 'Nexus Tech',
  support_email: 'suporte@nexus.com',
  website: 'https://nexus.com',
} as const;

// ===== ROLES E PERMISSÕES =====
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  FINANCEIRO: 'financeiro',
  VENDEDOR: 'vendedor',
  OPERACIONAL: 'operacional',
} as const;

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Proprietário',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.FINANCEIRO]: 'Financeiro',
  [ROLES.VENDEDOR]: 'Vendedor',
  [ROLES.OPERACIONAL]: 'Operacional',
} as const;

// ===== STATUS =====
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DRAFT: 'draft',
  SENT: 'sent',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  ERROR: 'error',
} as const;

// ===== CRM =====
export const CRM_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  UNQUALIFIED: 'unqualified',
} as const;

export const DEAL_STATUS = {
  OPEN: 'open',
  WON: 'won',
  LOST: 'lost',
  CLOSED: 'closed',
} as const;

export const ACTIVITY_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  TASK: 'task',
  NOTE: 'note',
} as const;

// ===== FINANCEIRO =====
export const INVOICE_TYPES = {
  RECEIVABLE: 'receivable',
  PAYABLE: 'payable',
} as const;

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT: 'credit',
} as const;

// ===== PROJETOS =====
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// ===== PROPOSTAS =====
export const PROPOSAL_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

// ===== DOCUMENTOS =====
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  SIGNED: 'signed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

// ===== INTEGRAÇÕES =====
export const INTEGRATION_CATEGORIES = {
  FINANCEIRO: 'financeiro',
  COMUNICACAO: 'comunicacao',
  PRODUTIVIDADE: 'produtividade',
  ECOMMERCE: 'ecommerce',
  LOGISTICA: 'logistica',
  DOCUMENTOS: 'documentos',
  CRM: 'crm',
  AUTOMACAO: 'automacao',
  ANALYTICS: 'analytics',
  SEGURANCA: 'seguranca',
} as const;

export const INTEGRATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
} as const;

// ===== FORMULÁRIOS =====
export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DATE: 'date',
  FILE: 'file',
} as const;

// ===== CORES =====
export const COLORS = {
  PRIMARY: {
    50: '#fef7ed',
    100: '#fdedd4',
    200: '#fbd7a9',
    300: '#f8bb72',
    400: '#f5953a',
    500: '#f2751a',
    600: '#e35a0f',
    700: '#bc4310',
    800: '#963614',
    900: '#792e14',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  INFO: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// ===== LIMITES E CONFIGURAÇÕES =====
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_UPLOAD_FILES: 5,
  MAX_PAGINATION_LIMIT: 100,
  DEFAULT_PAGINATION_LIMIT: 20,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  PASSWORD_MIN_LENGTH: 8,
  API_RATE_LIMIT: 1000, // requests per hour
} as const;

// ===== VALIDAÇÕES =====
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ_REGEX: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  CEP_REGEX: /^\d{5}-?\d{3}$/,
  URL_REGEX: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// ===== MENSAGENS =====
export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Registro criado com sucesso!',
    UPDATED: 'Registro atualizado com sucesso!',
    DELETED: 'Registro excluído com sucesso!',
    SAVED: 'Alterações salvas com sucesso!',
    SENT: 'Enviado com sucesso!',
    UPLOADED: 'Arquivo enviado com sucesso!',
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
    NOT_FOUND: 'Registro não encontrado.',
    UNAUTHORIZED: 'Você não tem permissão para realizar esta ação.',
    VALIDATION: 'Por favor, verifique os dados informados.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    UPLOAD: 'Erro ao enviar arquivo. Tente novamente.',
    DELETE: 'Erro ao excluir registro.',
  },
  CONFIRM: {
    DELETE: 'Tem certeza que deseja excluir este registro?',
    CANCEL: 'Tem certeza que deseja cancelar? As alterações serão perdidas.',
    LOGOUT: 'Tem certeza que deseja sair?',
  },
} as const;

// ===== CONFIGURAÇÕES DE PAGINAÇÃO =====
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMITS: [10, 20, 50, 100],
  MAX_LIMIT: 100,
} as const;

// ===== CONFIGURAÇÕES DE DATA =====
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_TIME: 'yyyy-MM-dd HH:mm:ss',
  ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ',
} as const;

// ===== CONFIGURAÇÕES DE MOEDA =====
export const CURRENCIES = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Real Brasileiro',
    decimal_places: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar Americano',
    decimal_places: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimal_places: 2,
  },
} as const;

// ===== CONFIGURAÇÕES DE TIMEZONE =====
export const TIMEZONES = {
  'America/Sao_Paulo': 'Brasília (GMT-3)',
  'America/New_York': 'Nova York (GMT-5)',
  'Europe/London': 'Londres (GMT+0)',
  'Asia/Tokyo': 'Tóquio (GMT+9)',
} as const;

// ===== CONFIGURAÇÕES DE IDIOMA =====
export const LANGUAGES = {
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    flag: '🇧🇷',
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    flag: '🇺🇸',
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Español',
    flag: '🇪🇸',
  },
} as const;
