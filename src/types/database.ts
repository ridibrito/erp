// Tipos baseados na estrutura do banco de dados Nexus ERP

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// ===== FUNDAÇÃO: IDENTIDADE, MULTI-TENANT E SEGURANÇA =====

// Tenant Provisioning
export interface TenantDomain extends BaseEntity {
  org_id: string;
  domain: string;
  is_primary: boolean;
  status: 'pending' | 'verified' | 'failed';
  verified_at?: string;
}

export interface TenantSettings extends BaseEntity {
  org_id: string;
  key: string;
  value: Record<string, any>;
}

// RBAC Granular
export interface Permission extends BaseEntity {
  name: string;
  description?: string;
  module: string;
  action: string;
  resource?: string;
}

export interface Role extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
}

export interface RolePermission extends BaseEntity {
  role_id: string;
  permission_id: string;
}

export interface UserPermission extends BaseEntity {
  user_id: string;
  org_id: string;
  permission_id: string;
  granted_by?: string;
  expires_at?: string;
}

// Gestão de Sessão
export interface UserSession extends BaseEntity {
  user_id: string;
  org_id: string;
  session_token: string;
  device_info?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  revoked_at?: string;
}

export interface TwoFactorAuth extends BaseEntity {
  user_id: string;
  method: 'totp' | 'sms' | 'email';
  secret?: string;
  backup_codes?: string[];
  is_enabled: boolean;
}

export interface TrustedDevice extends BaseEntity {
  user_id: string;
  org_id: string;
  device_id: string;
  device_name?: string;
  device_type?: string;
  ip_address?: string;
  user_agent?: string;
  last_used_at: string;
  expires_at?: string;
}

// LGPD Compliance
export interface DataConsent extends BaseEntity {
  org_id: string;
  user_id: string;
  purpose: string;
  legal_basis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation' | 'vital_interest' | 'public_interest';
  consent_given: boolean;
  ip_address?: string;
  user_agent?: string;
}

export interface DataSubjectRequest extends BaseEntity {
  org_id: string;
  user_id: string;
  request_type: 'export' | 'delete' | 'rectify' | 'portability';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  data?: Record<string, any>;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
}

export interface DataProcessingLog extends BaseEntity {
  org_id: string;
  user_id: string;
  processing_activity: string;
  legal_basis: string;
  data_categories?: string[];
  retention_period?: string;
}

// Auditoria e Logs
export interface AuditLog extends BaseEntity {
  org_id: string;
  user_id?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
}

export interface SecurityLog extends BaseEntity {
  org_id: string;
  user_id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// API Keys e OAuth
export interface ApiKey extends BaseEntity {
  org_id: string;
  name: string;
  key_hash: string;
  scopes: string[];
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  created_by?: string;
}

export interface OAuthConnection extends BaseEntity {
  org_id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  scopes?: string[];
  is_active: boolean;
}

// ===== ORGANIZAÇÃO & USUÁRIOS =====
export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  settings: OrganizationSettings;
  status: 'active' | 'inactive' | 'suspended';
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  language: string;
  features: Record<string, boolean>;
}

export interface OrgMember extends BaseEntity {
  org_id: string;
  user_id: string;
  role: string;
  scopes: string[];
  status: 'active' | 'inactive' | 'pending';
  permissions: Record<string, boolean>;
}

// Tipo para o membro atual da sessão
export interface Member {
  userId: string;
  orgId: string;
  role: string;
  scopes: string[];
  permissions: string[];
}

// ===== CRM =====
export interface CrmLead extends BaseEntity {
  org_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  assigned_to?: string;
  notes?: string;
  score: number;
}

export interface CrmAccount extends BaseEntity {
  org_id: string;
  name: string;
  type: 'customer' | 'prospect' | 'partner' | 'vendor';
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: Address;
  status: 'active' | 'inactive';
  assigned_to?: string;
}

export interface CrmContact extends BaseEntity {
  org_id: string;
  account_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  is_primary: boolean;
  status: 'active' | 'inactive';
}

export interface CrmPipeline extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  order: number;
}

export interface CrmStage extends BaseEntity {
  org_id: string;
  pipeline_id: string;
  name: string;
  color: string;
  order: number;
  probability: number;
  is_won: boolean;
  is_lost: boolean;
}

export interface CrmDeal extends BaseEntity {
  org_id: string;
  pipeline_id: string;
  stage_id: string;
  account_id?: string;
  name: string;
  description?: string;
  value: number;
  currency: string;
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_to?: string;
  status: 'open' | 'won' | 'lost' | 'closed';
  probability: number;
  source?: string;
}

export interface CrmDealContact extends BaseEntity {
  deal_id: string;
  contact_id: string;
  role: 'primary' | 'secondary' | 'decision_maker';
}

export interface CrmActivity extends BaseEntity {
  org_id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  subject: string;
  description?: string;
  related_type?: 'deal' | 'account' | 'contact' | 'lead';
  related_id?: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface CrmThread extends BaseEntity {
  org_id: string;
  type: 'email' | 'chat' | 'call';
  subject?: string;
  related_type?: 'deal' | 'account' | 'contact' | 'lead';
  related_id?: string;
  participants: string[];
  status: 'active' | 'closed';
}

export interface CrmMessage extends BaseEntity {
  thread_id: string;
  sender_id: string;
  sender_type: 'user' | 'contact' | 'system';
  content: string;
  content_type: 'text' | 'html' | 'rich';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface CrmMessageAttachment extends BaseEntity {
  message_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  url: string;
}

// ===== FINANCEIRO =====

// Plano de Contas
export interface FinChartOfAccounts extends BaseEntity {
  org_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: string;
  level: number;
  is_active: boolean;
  description?: string;
}

export interface FinCostCenter extends BaseEntity {
  org_id: string;
  code: string;
  name: string;
  parent_id?: string;
  level: number;
  is_active: boolean;
  description?: string;
  budget_amount: number;
  budget_currency: string;
}

// Produtos e Serviços
export interface FinProductCategory extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
}

export interface FinProduct extends BaseEntity {
  org_id: string;
  sku?: string;
  name: string;
  description?: string;
  type: 'product' | 'service' | 'subscription';
  category_id?: string;
  unit: string;
  price: number;
  currency: string;
  cost: number;
  tax_rate: number;
  is_active: boolean;
  is_tracked: boolean;
  min_stock: number;
  current_stock: number;
}

export interface FinPriceList extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
}

export interface FinPriceListItem extends BaseEntity {
  price_list_id: string;
  product_id: string;
  price: number;
  discount_percent: number;
}

// Faturas e Documentos
export interface FinInvoice extends BaseEntity {
  org_id: string;
  number: string;
  type: 'invoice' | 'credit_note' | 'debit_note';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  customer_tax_id?: string;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  created_by?: string;
}

export interface FinInvoiceItem extends BaseEntity {
  invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  cost_center_id?: string;
  account_id?: string;
}

export interface FinPayment extends BaseEntity {
  org_id: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

// Assinaturas
export interface FinSubscription extends BaseEntity {
  org_id: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  billing_interval: number;
  start_date: string;
  end_date?: string;
  next_billing_date?: string;
  amount: number;
  currency: string;
  auto_renew: boolean;
  notes?: string;
}

export interface FinSubscriptionItem extends BaseEntity {
  subscription_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface FinSubscriptionBill extends BaseEntity {
  subscription_id: string;
  invoice_id?: string;
  billing_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
}

// Meios de Pagamento
export interface FinPaymentMethod extends BaseEntity {
  org_id: string;
  name: string;
  type: 'bank_transfer' | 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'check' | 'other';
  is_active: boolean;
  settings?: Record<string, any>;
}

export interface FinBankAccount extends BaseEntity {
  org_id: string;
  name: string;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'investment';
  account_number?: string;
  agency?: string;
  balance: number;
  currency: string;
  is_active: boolean;
}

// Impostos
export interface FinTaxRegime extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface FinTaxRate extends BaseEntity {
  org_id: string;
  name: string;
  rate: number;
  type: 'icms' | 'pis' | 'cofins' | 'ipi' | 'iss' | 'irrf' | 'inss' | 'other';
  is_active: boolean;
}

export interface FinVendor extends BaseEntity {
  org_id: string;
  name: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: Address;
  payment_terms: number;
  status: 'active' | 'inactive';
}

export interface FinExpense extends BaseEntity {
  org_id: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  category_id?: string;
  cost_center_id?: string;
  vendor_id?: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approved_by?: string;
  approved_at?: string;
}

export interface FinTransaction extends BaseEntity {
  org_id: string;
  bank_account_id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  transaction_date: string;
  reference?: string;
  category_id?: string;
  cost_center_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface FinTransaction extends BaseEntity {
  org_id: string;
  bank_account_id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  transaction_date: string;
  reference?: string;
  category_id?: string;
  cost_center_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface FinRevenueRule extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  conditions: Record<string, any>;
  category_id: string;
  cost_center_id?: string;
  is_active: boolean;
  priority: number;
}

export interface FinExpenseRule extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  conditions: Record<string, any>;
  category_id: string;
  cost_center_id?: string;
  is_active: boolean;
  priority: number;
}

// ===== VENDAS & PROPOSTAS =====
export interface SalesProposal extends BaseEntity {
  org_id: string;
  number: string;
  title: string;
  account_id?: string;
  contact_id?: string;
  deal_id?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
}

export interface SalesProposalItem extends BaseEntity {
  proposal_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total: number;
  service_id?: string;
}

export interface SignDocument extends BaseEntity {
  org_id: string;
  title: string;
  file_url: string;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled';
  expires_at?: string;
  signed_at?: string;
  template_id?: string;
}

export interface SignDocumentSigner extends BaseEntity {
  document_id: string;
  email: string;
  name: string;
  order: number;
  status: 'pending' | 'signed' | 'declined';
  signed_at?: string;
  signature_data?: Record<string, any>;
}

// ===== OPERAÇÕES & PROJETOS =====
export interface OpsProject extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget: number;
  currency: string;
  client_id?: string;
  manager_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface OpsTask extends BaseEntity {
  org_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  completed_at?: string;
  parent_task_id?: string;
}

export interface OpsTaskAssignee extends BaseEntity {
  task_id: string;
  user_id: string;
  role: 'assignee' | 'reviewer' | 'watcher';
}

export interface OpsTimesheet extends BaseEntity {
  org_id: string;
  user_id: string;
  task_id?: string;
  project_id?: string;
  date: string;
  hours: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
}

export interface OpsContract extends BaseEntity {
  org_id: string;
  number: string;
  title: string;
  client_id: string;
  type: 'service' | 'product' | 'maintenance';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  value: number;
  currency: string;
  payment_terms: string;
  terms?: string;
}

export interface OpsContractItem extends BaseEntity {
  contract_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  service_id?: string;
}

// ===== CATEGORIZAÇÃO =====
export interface CatService extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  category_id?: string;
  price: number;
  currency: string;
  is_active: boolean;
  unit: string;
}

// ===== INTEGRAÇÕES =====
export interface IntegrProvider extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  category: string;
  features: string[];
  is_active: boolean;
  config_schema: Record<string, any>;
}

export interface IntegrConnection extends BaseEntity {
  org_id: string;
  provider_id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  last_sync_at?: string;
  error_message?: string;
}

export interface IntegrCredential extends BaseEntity {
  connection_id: string;
  key: string;
  value_encrypted: string;
  is_sensitive: boolean;
}

export interface IntegrWebhook extends BaseEntity {
  connection_id: string;
  event_type: string;
  url: string;
  headers: Record<string, string>;
  is_active: boolean;
  last_triggered_at?: string;
}

export interface IntegrOutbox extends BaseEntity {
  org_id: string;
  connection_id?: string;
  event_type: string;
  payload: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'retry';
  retry_count: number;
  next_retry_at?: string;
  error_message?: string;
}

// ===== WEBHOOKS & APIs =====
export interface WebhookEndpoint extends BaseEntity {
  org_id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret?: string;
  headers: Record<string, string>;
}

export interface WebhookDelivery extends BaseEntity {
  endpoint_id: string;
  event_type: string;
  payload: Record<string, any>;
  response_status?: number;
  response_body?: string;
  duration_ms: number;
  status: 'pending' | 'delivered' | 'failed';
  retry_count: number;
  error_message?: string;
}

// ===== FORMULÁRIOS =====
export interface Form extends BaseEntity {
  org_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  settings: FormSettings;
}

export interface FormSettings {
  allow_anonymous: boolean;
  require_captcha: boolean;
  redirect_url?: string;
  notification_email?: string;
  fields: FormField[];
}

export interface FormField extends BaseEntity {
  form_id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  required: boolean;
  options?: string[];
  validation?: Record<string, any>;
  order: number;
}

export interface FormSubmission extends BaseEntity {
  form_id: string;
  data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: 'pending' | 'processed' | 'error';
}

// ===== CALENDÁRIO =====

// Calendários
export interface CalCalendar extends BaseEntity {
  org_id: string;
  name: string;
  color: string;
  is_default: boolean;
}

// Eventos
export interface CalEvent extends BaseEntity {
  org_id: string;
  calendar_id: string;
  title: string;
  description?: string;
  location?: string;
  all_day: boolean;
  starts_at: string;
  ends_at: string;
  rrule?: string;
  source_provider?: string;
  source_event_id?: string;
  kind: 'general' | 'task_due';
  created_by?: string;
}

// Participantes
export interface CalEventAttendee extends BaseEntity {
  org_id: string;
  event_id: string;
  user_id?: string;
  contact_id?: string;
  email?: string;
  role: 'required' | 'optional';
  response: 'needs_action' | 'accepted' | 'declined' | 'tentative';
}

// Vínculo Evento-Tarefa
export interface CalEventTask extends BaseEntity {
  org_id: string;
  event_id: string;
  task_id: string;
}

// View do Calendário
export interface VCalendarEvent extends CalEvent {
  task_title?: string;
  task_status?: string;
  task_priority?: string;
  project_id?: string;
  project_name?: string;
  calendar_name?: string;
  calendar_color?: string;
}

// ===== TIPOS AUXILIARES =====
export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
