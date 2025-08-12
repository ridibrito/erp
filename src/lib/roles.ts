export const ROLE_SCOPES: Record<string, string[]> = {
  owner: ['*'],
  admin: [
    'dashboard:view','crm:*','finance:read','finance:write','projects:*','reports:view','integrations:manage','settings:manage'
  ],
  supervisor: [
    'dashboard:view','crm:read','finance:read','projects:read','reports:view'
  ],
  financeiro: [
    'dashboard:view','finance:read','finance:write','reports:view'
  ],
  vendedor: [
    'dashboard:view','crm:read','crm:write'
  ],
  operacional: [
    'dashboard:view','projects:read','projects:write','reports:view'
  ],
};
