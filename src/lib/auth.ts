import { config } from './config';

// Tipos para autenticação
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  permissions: string[];
  scopes: string[];
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}

// Mock de usuários para desenvolvimento
const mockUsers: User[] = [
  {
    id: 'dev-user-123',
    email: 'admin@nexus.com',
    name: 'Administrador',
    role: 'admin',
    orgId: 'dev-org-123',
    permissions: [
      'dashboard.view',
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.delete',
      'crm.accounts.view', 'crm.accounts.create', 'crm.accounts.edit', 'crm.accounts.delete',
      'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.deals.delete',
      'finance.invoices.view', 'finance.invoices.create', 'finance.invoices.edit', 'finance.invoices.delete',
      'finance.payments.view', 'finance.payments.create', 'finance.payments.edit', 'finance.payments.delete',
      'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
      'reports.view', 'reports.create', 'reports.export',
      'settings.view', 'settings.edit',
      'system.admin', 'system.audit'
    ],
    scopes: ['dashboard:view', 'crm:read', 'crm:write', 'finance:read', 'finance:write', 'projects:read', 'projects:write', 'reports:view', 'settings:read', 'settings:write']
  },
  {
    id: 'dev-user-456',
    email: 'vendedor@nexus.com',
    name: 'Vendedor',
    role: 'vendedor',
    orgId: 'dev-org-123',
    permissions: [
      'dashboard.view',
      'crm.leads.view', 'crm.leads.create', 'crm.leads.edit',
      'crm.accounts.view', 'crm.accounts.create', 'crm.accounts.edit',
      'crm.deals.view', 'crm.deals.create', 'crm.deals.edit',
      'reports.view'
    ],
    scopes: ['dashboard:view', 'crm:read', 'crm:write', 'reports:view']
  }
];

// Simular login
export async function login(email: string, password: string): Promise<Session | null> {
  // Em desenvolvimento, aceita qualquer senha
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return null;
  }

  // Criar token simples (em produção, usar JWT real)
  const token = Buffer.from(JSON.stringify({
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  })).toString('base64');

  const session: Session = {
    user,
    token,
    expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000))
  };

  // Salvar no localStorage (em produção, usar httpOnly cookies)
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexus-session', JSON.stringify(session));
  }

  return session;
}

// Verificar sessão atual
export async function getCurrentSession(): Promise<Session | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const sessionData = localStorage.getItem('nexus-session');
    if (!sessionData) {
      return null;
    }

    const session: Session = JSON.parse(sessionData);
    
    // Verificar se a sessão não expirou
    if (new Date(session.expiresAt) < new Date()) {
      logout();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
}

// Obter usuário atual
export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();
  return session?.user || null;
}

// Logout
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nexus-session');
  }
}

// Verificar se usuário está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}

// Middleware de autenticação para páginas
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  
  return user;
}
