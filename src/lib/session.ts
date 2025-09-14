import { getCurrentUser, type User } from './auth';
import { userToMember, type Member } from './authz';

/**
 * Obtém o membro atual da sessão
 * @returns Promise<Member | null>
 */
export async function getCurrentMember(): Promise<Member | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }

    return userToMember(user);
  } catch (error) {
    console.error('Erro ao obter membro atual:', error);
    return null;
  }
}

/**
 * Verifica se o usuário está autenticado
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  const member = await getCurrentMember();
  return member !== null;
}

/**
 * Requer autenticação e retorna o membro atual
 * @returns Promise<Member>
 * @throws Error se não autenticado
 */
export async function requireAuth(): Promise<Member> {
  const member = await getCurrentMember();
  
  if (!member) {
    throw new Error('Usuário não autenticado');
  }
  
  return member;
}