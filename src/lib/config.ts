// Configuration for Cortus ERP
export const config = {
  // Application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Cortus ERP',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pnfpcytrpuvhjzrmtbwy.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZnBjeXRycHV2aGp6cm10Ynd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDk2MjksImV4cCI6MjA2MjYyNTYyOX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZnBjeXRycHV2aGp6cm10Ynd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA0OTYyOSwiZXhwIjoyMDYyNjI1NjI5fQ._2Zfqw7AzgiXntegoDSX7oPpx-45GeHkpKqSv5xpIcg',
    projectId: 'pnfpcytrpuvhjzrmtbwy',
  },

  // Development
  dev: {
    role: process.env.CORTUS_DEV_ROLE || 'admin',
    userId: process.env.CORTUS_DEV_USER_ID || 'dev-user-123',
    orgId: process.env.CORTUS_DEV_ORG_ID || 'dev-org-123',
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres',
  },
} as const;

export type Config = typeof config;