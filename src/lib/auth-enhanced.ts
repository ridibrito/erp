import { supabase } from './supabase';

// Tipos para autenticação
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  permissions: string[];
  scopes: string[];
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
  refreshToken: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

// Interface para dados de registro
export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  organizationName?: string;
  cnpj?: string;
}

// Interface para dados de login
export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Interface para perfil do usuário
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  orgId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Função para obter permissões do usuário do banco
async function getUserPermissions(userId: string, orgId: string, isAdmin: boolean = false): Promise<string[]> {
  try {
    // Permissões de admin (acesso total)
    const adminPermissions = [
      'dashboard.view',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'crm.clients.view',
      'crm.clients.create',
      'crm.clients.edit',
      'crm.clients.delete',
      'crm.leads.view',
      'crm.leads.create',
      'crm.leads.edit',
      'crm.leads.delete',
      'crm.proposals.view',
      'crm.proposals.create',
      'crm.proposals.edit',
      'crm.proposals.delete',
      'crm.contracts.view',
      'crm.contracts.create',
      'crm.contracts.edit',
      'crm.contracts.delete',
      'finance.invoices.view',
      'finance.invoices.create',
      'finance.invoices.edit',
      'finance.invoices.delete',
      'finance.charges.view',
      'finance.charges.create',
      'finance.charges.edit',
      'finance.charges.delete',
      'finance.nfse.view',
      'finance.nfse.create',
      'finance.nfse.edit',
      'finance.nfse.delete',
      'finance.payables.view',
      'finance.payables.create',
      'finance.payables.edit',
      'finance.payables.delete',
      'finance.receivables.view',
      'finance.receivables.create',
      'finance.receivables.edit',
      'finance.receivables.delete',
      'finance.reports.view',
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.delete',
      'reports.view',
      'reports.create',
      'reports.edit',
      'reports.delete',
      'settings.view',
      'settings.edit',
      'settings.users',
      'settings.organization',
      'settings.integrations',
      'settings.billing'
    ];

    // Permissões de usuário padrão
    const userPermissions = [
      'dashboard.view',
      'crm.clients.view',
      'crm.clients.create',
      'crm.clients.edit',
      'crm.leads.view',
      'crm.leads.create',
      'crm.leads.edit',
      'crm.proposals.view',
      'crm.proposals.create',
      'crm.proposals.edit',
      'crm.contracts.view',
      'crm.contracts.create',
      'crm.contracts.edit',
      'finance.invoices.view',
      'finance.invoices.create',
      'finance.invoices.edit',
      'finance.charges.view',
      'finance.charges.create',
      'finance.charges.edit',
      'finance.nfse.view',
      'finance.nfse.create',
      'finance.nfse.edit',
      'finance.payables.view',
      'finance.payables.create',
      'finance.payables.edit',
      'finance.receivables.view',
      'finance.receivables.create',
      'finance.receivables.edit',
      'finance.reports.view',
      'projects.view',
      'projects.create',
      'projects.edit',
      'reports.view',
      'reports.create',
      'reports.edit',
      'settings.view'
    ];

    return isAdmin ? adminPermissions : userPermissions;
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    return [];
  }
}

// Função para obter papel do usuário
async function getUserRole(userId: string, orgId: string, isAdmin: boolean = false): Promise<string> {
  try {
    // Verificar se é admin baseado no device_info
    if (isAdmin) {
      return 'admin';
    }

    // Por enquanto, retornar papel padrão para desenvolvimento
    // TODO: Implementar consulta real quando o RBAC estiver configurado
    return 'user';
  } catch (error) {
    console.error('Erro ao buscar papel do usuário:', error);
    return 'user';
  }
}

// Função para criar perfil do usuário no banco (B2B - primeiro usuário é admin)
async function createUserProfile(supabaseUser: any, signUpData: SignUpData): Promise<User | null> {
  try {
    let orgId: string;
    let isFirstUser = false;

    // Verificar se é o primeiro usuário (criação de nova organização)
    if (signUpData.organizationName && signUpData.cnpj) {
      try {
        // Buscar dados da empresa na API Brasil
        const cnpjNumbers = signUpData.cnpj.replace(/\D/g, '');
        let brasilAPIData = null;
        
        try {
          const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjNumbers}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (response.ok) {
            brasilAPIData = await response.json();
            console.log('Dados da API Brasil:', brasilAPIData);
          } else {
            console.log('API Brasil não disponível, usando dados básicos');
          }
        } catch (apiError) {
          console.error('Erro ao buscar dados da API Brasil:', apiError);
        }

        // Criar nova organização com dados do CNPJ e API Brasil
        const organizationData = {
          name: signUpData.organizationName,
          slug: signUpData.organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: `Organização criada por ${signUpData.name}`,
          cnpj: cnpjNumbers,
          is_active: true,
          // Dados da API Brasil se disponíveis
          ...(brasilAPIData && {
            fantasy_name: brasilAPIData.nome_fantasia || brasilAPIData.razao_social,
            email: brasilAPIData.email || '',
            phone: brasilAPIData.ddd_telefone_1 ? 
              `(${brasilAPIData.ddd_telefone_1.substring(0, 2)}) ${brasilAPIData.ddd_telefone_1.substring(2)}` : '',
            address: brasilAPIData.logradouro ? 
              `${brasilAPIData.descricao_tipo_de_logradouro} ${brasilAPIData.logradouro}, ${brasilAPIData.numero || 'S/N'}` : '',
            city: brasilAPIData.municipio || '',
            state: brasilAPIData.uf || '',
            cep: brasilAPIData.cep || '',
            neighborhood: brasilAPIData.bairro || '',
            complement: brasilAPIData.complemento || ''
          })
        };

        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert(organizationData)
          .select()
          .single();

        if (orgError) {
          console.error('Erro ao criar organização:', orgError);
          // Se falhar, usar organização padrão
          orgId = '00000000-0000-0000-0000-000000000001';
          isFirstUser = true; // Ainda é o primeiro usuário
          console.log('Usando organização padrão devido ao erro');
        } else {
          orgId = newOrg.id;
          isFirstUser = true;
          console.log('Nova organização criada:', newOrg.name, 'CNPJ:', signUpData.cnpj, 'ID:', orgId);
        }
      } catch (error) {
        console.error('Erro ao criar organização:', error);
        // Se falhar, usar organização padrão
        orgId = '00000000-0000-0000-0000-000000000001';
        isFirstUser = true;
        console.log('Usando organização padrão devido ao erro');
      }
    } else {
      // Usar organização padrão (desenvolvimento)
      orgId = '00000000-0000-0000-0000-000000000001';
      isFirstUser = true; // Primeiro usuário é sempre admin
    }

    // Criar perfil do usuário
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: supabaseUser.id,
          org_id: orgId,
          session_token: 'temp', // Será atualizado
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          device_info: {
            name: signUpData.name,
            email: signUpData.email,
            phone: signUpData.phone,
            organization: signUpData.organizationName,
            cnpj: signUpData.cnpj,
            is_admin: isFirstUser
          },
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        return null;
      }
      
      console.log('Perfil do usuário criado com sucesso:', profile.id);
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
      return null;
    }

    // Obter permissões baseadas no papel
    const permissions = await getUserPermissions(supabaseUser.id, orgId, isFirstUser);
    const role = await getUserRole(supabaseUser.id, orgId, isFirstUser);

    const user: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: signUpData.name,
      role,
      orgId,
      permissions,
      scopes: permissions.map(p => p.split('.')[0]), // Extrair escopos das permissões
      phone: signUpData.phone,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return user;
  } catch (error) {
    console.error('Erro ao criar perfil do usuário:', error);
    return null;
  }
}

// Função para atualizar perfil do usuário
async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        device_info: updates,
        updated_at: new Date()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }

    // Buscar usuário atualizado
    return await getCurrentUser();
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return null;
  }
}

// Função para registrar usuário
export async function signUp(signUpData: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    console.log('signUp: signUpData:', signUpData);
    
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        data: {
          name: signUpData.name,
          phone: signUpData.phone,
          organization: signUpData.organizationName
        }
      }
    });

    console.log('signUp: data.user.user_metadata:', data.user?.user_metadata);

    if (error) {
      return { user: null, error: { message: error.message, code: error.message } };
    }

    if (!data.user) {
      return { user: null, error: { message: 'Falha ao criar usuário' } };
    }

    // Criar perfil do usuário
    const user = await createUserProfile(data.user, signUpData);
    
    return { user, error: null };
  } catch (error) {
    console.error('Erro no registro:', error);
    return { 
      user: null, 
      error: { message: 'Erro interno do servidor' } 
    };
  }
}

// Função para fazer login
export async function signIn(signInData: SignInData): Promise<{ session: Session | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInData.email,
      password: signInData.password,
    });

    if (error) {
      return { session: null, error: { message: error.message, code: error.message } };
    }

    if (!data.session || !data.user) {
      return { session: null, error: { message: 'Falha na autenticação' } };
    }

    // Buscar dados do usuário
    const user = await getCurrentUser();
    if (!user) {
      // Se não conseguir carregar dados completos, criar usuário básico
      console.log('Criando usuário básico para login...');
      const basicUser: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || 'Usuário',
        role: 'user',
        orgId: '00000000-0000-0000-0000-000000000001',
        permissions: ['dashboard.view'],
        scopes: ['dashboard'],
        avatar: data.user.user_metadata?.avatar,
        isActive: true,
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date()
      };
      
      const session: Session = {
        user: basicUser,
        token: data.session.access_token,
        expiresAt: new Date(data.session.expires_at! * 1000),
        refreshToken: data.session.refresh_token
      };

      return { session, error: null };
    }

    const session: Session = {
      user,
      token: data.session.access_token,
      expiresAt: new Date(data.session.expires_at! * 1000),
      refreshToken: data.session.refresh_token
    };

    return { session, error: null };
  } catch (error) {
    console.error('Erro no login:', error);
    return { 
      session: null, 
      error: { message: 'Erro interno do servidor' } 
    };
  }
}

// Função para fazer logout
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: { message: error.message, code: error.message } };
    }

    return { error: null };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { error: { message: 'Erro interno do servidor' } };
  }
}

  // Função para obter usuário atual
  export async function getCurrentUser(): Promise<User | null> {
    try {
      // Primeiro verificar se há sessão ativa
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession) {
        console.log('getCurrentUser: Nenhuma sessão ativa encontrada');
        return null;
      }

      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      
      if (error || !supabaseUser) {
        console.log('getCurrentUser: Erro ao obter usuário:', error);
        return null;
      }

    // Buscar dados do usuário na tabela user_sessions
    const { data: userSession, error: userSessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .single();

    if (userSessionError || !userSession) {
      console.error('Erro ao buscar sessão do usuário:', userSessionError);
      // Se não encontrar sessão, criar uma básica
      console.log('Sessão não encontrada, criando sessão básica...');
      
      const { data: newSession, error: createError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: supabaseUser.id,
          org_id: '00000000-0000-0000-0000-000000000001',
          session_token: 'temp',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          device_info: {
            name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || 'Usuário',
            email: supabaseUser.email,
            phone: supabaseUser.user_metadata?.phone,
            avatar: supabaseUser.user_metadata?.avatar,
            is_admin: false
          },
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar sessão básica:', createError);
        return null;
      }

      // Usar a nova sessão criada
      const orgId = newSession.org_id;
      const isAdmin = newSession.device_info?.is_admin || false;
      const permissions = await getUserPermissions(supabaseUser.id, orgId, isAdmin);
      const role = await getUserRole(supabaseUser.id, orgId, isAdmin);

      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || newSession.device_info?.name || 'Usuário',
        role,
        orgId,
        permissions,
        scopes: permissions.map(p => p.split('.')[0]),
        avatar: supabaseUser.user_metadata?.avatar || newSession.device_info?.avatar,
        phone: supabaseUser.user_metadata?.phone || newSession.device_info?.phone,
        isActive: newSession.is_active,
        lastLoginAt: new Date(),
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date()
      };

      return user;
    }

    const orgId = userSession.org_id;
    const isAdmin = userSession.device_info?.is_admin || false;
    const permissions = await getUserPermissions(supabaseUser.id, orgId, isAdmin);
    const role = await getUserRole(supabaseUser.id, orgId, isAdmin);

    console.log('getCurrentUser: supabaseUser.user_metadata:', supabaseUser.user_metadata);
    console.log('getCurrentUser: name from metadata:', supabaseUser.user_metadata?.name);
    console.log('getCurrentUser: full_name from metadata:', supabaseUser.user_metadata?.full_name);
    console.log('getCurrentUser: isAdmin:', isAdmin);
    console.log('getCurrentUser: role:', role);

    const user: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || userSession.device_info?.name || 'Usuário',
      role,
      orgId,
      permissions,
      scopes: permissions.map(p => p.split('.')[0]),
      avatar: supabaseUser.user_metadata?.avatar || userSession.device_info?.avatar,
      phone: supabaseUser.user_metadata?.phone || userSession.device_info?.phone,
      isActive: userSession.is_active,
      lastLoginAt: new Date(),
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date()
    };

    return user;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
}

// Função para obter sessão atual
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
    
    if (error || !supabaseSession) {
      return null;
    }

    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const session: Session = {
      user,
      token: supabaseSession.access_token,
      expiresAt: new Date(supabaseSession.expires_at! * 1000),
      refreshToken: supabaseSession.refresh_token
    };

    return session;
  } catch (error) {
    console.error('Erro ao obter sessão atual:', error);
    return null;
  }
}

// Função para renovar sessão
export async function refreshSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      return { session: null, error: { message: error.message, code: error.message } };
    }

    if (!data.session) {
      return { session: null, error: { message: 'Falha ao renovar sessão' } };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { session: null, error: { message: 'Erro ao carregar dados do usuário' } };
    }

    const session: Session = {
      user,
      token: data.session.access_token,
      expiresAt: new Date(data.session.expires_at! * 1000),
      refreshToken: data.session.refresh_token
    };

    return { session, error: null };
  } catch (error) {
    console.error('Erro ao renovar sessão:', error);
    return { 
      session: null, 
      error: { message: 'Erro interno do servidor' } 
    };
  }
}

// Função para verificar se usuário tem permissão
export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission);
}

// Função para verificar se usuário tem escopo
export function hasScope(user: User, scope: string): boolean {
  return user.scopes.includes(scope);
}

// Função para verificar se usuário tem papel
export function hasRole(user: User, role: string): boolean {
  return user.role === role;
}

// Função para verificar se usuário está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}

// Função para atualizar perfil
export async function updateProfile(updates: Partial<UserProfile>): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { user: null, error: { message: 'Usuário não autenticado' } };
    }

    const user = await updateUserProfile(currentUser.id, updates);
    
    if (!user) {
      return { user: null, error: { message: 'Erro ao atualizar perfil' } };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { 
      user: null, 
      error: { message: 'Erro interno do servidor' } 
    };
  }
}

// Função para redefinir senha
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.app.url}/auth/reset-password`,
    });

    if (error) {
      return { error: { message: error.message, code: error.message } };
    }

    return { error: null };
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return { error: { message: 'Erro interno do servidor' } };
  }
}

// Função para atualizar senha
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { error: { message: error.message, code: error.message } };
    }

    return { error: null };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { error: { message: 'Erro interno do servidor' } };
  }
}

// Exportar cliente Supabase para uso em outros módulos
export { supabase };
