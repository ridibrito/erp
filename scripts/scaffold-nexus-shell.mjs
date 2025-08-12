#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const FORCE = process.env.FORCE === '1' || process.env.FORCE === 'true';
const ROOT = process.cwd();

const files = [
  // lib
  {
    path: 'src/lib/authz.ts',
    content: `export type Scope = string;
export type Member = { userId: string; orgId: string; role: string; scopes: string[] };
export function can(userScopes: string[] = [], required: Scope | Scope[]): boolean {
  const req = Array.isArray(required) ? required : [required];
  return req.every((r) =>
    userScopes.includes(r) ||
    userScopes.includes('*') ||
    userScopes.some((s) => s.endsWith(':*') && r.startsWith(s.slice(0, -2)))
  );
}
`},
  {
    path: 'src/lib/roles.ts',
    content: `export const ROLE_SCOPES: Record<string, string[]> = {
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
`},
  {
    path: 'src/lib/session.ts',
    content: `import { cookies, headers } from 'next/headers';
import { ROLE_SCOPES } from '@/lib/roles';
import type { Member } from '@/lib/authz';

export async function getCurrentMember(): Promise<Member | null> {
  const h = headers();
  const c = cookies();
  const cookieRole = c.get('x-role')?.value || h.get('x-role') || process.env.NEXUS_DEV_ROLE || 'admin';
  const role = cookieRole in ROLE_SCOPES ? cookieRole : 'admin';
  return { userId: 'dev-user', orgId: 'dev-org', role, scopes: ROLE_SCOPES[role] };
}
`},

  // components
  {
    path: 'src/components/layout/Sidebar.tsx',
    content: `"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { can } from '@/lib/authz';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', scopes: ['dashboard:view'] },
  { label: 'Gestão de Negócios', href: '/crm', scopes: ['crm:read'] },
  { label: 'Financeiro', href: '/financeiro', scopes: ['finance:read'] },
  { label: 'Projetos', href: '/projetos', scopes: ['projects:read'] },
  { label: 'Relatórios', href: '/relatorios', scopes: ['reports:view'] },
  { label: 'Integrações', href: '/integracoes', scopes: ['integrations:manage'] },
  { label: 'Configurações', href: '/settings', scopes: ['settings:manage'] },
] as const;

export function Sidebar({ scopes }: { scopes: string[] }) {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground">
      <nav className="p-3 space-y-1">
        {NAV.filter((i) => can(scopes, i.scopes)).map((i) => {
          const active = pathname.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              className={'block rounded-xl px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ' + (active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : '')}
            >{i.label}</Link>
          );
        })}
      </nav>
    </aside>
  );
}
`},
  {
    path: 'src/components/layout/Topbar.tsx',
    content: `export function Topbar({ orgLabel, roleLabel }: { orgLabel?: string; roleLabel?: string }){
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="text-sm text-muted-foreground">{orgLabel ?? 'Org'} • {roleLabel ?? 'Role'}</div>
      <input placeholder="Buscar…" className="w-80 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
    </header>
  );
}
`},
  {
    path: 'src/components/auth/RequireScope.tsx',
    content: `"use client";
import { can } from '@/lib/authz';
export function RequireScope({ scopes, need, children }: { scopes: string[]; need: string | string[]; children: React.ReactNode }) {
  if (!can(scopes, need)) return null; return <>{children}</>;
}
`},

  // app shell + pages
  {
    path: 'src/app/layout.tsx',
    content: `import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { getCurrentMember } from '@/lib/session';

export const metadata = { title: 'Nexus' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const m = await getCurrentMember();
  const scopes = m?.scopes ?? [];
  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen">
          <Sidebar scopes={scopes} />
          <main className="flex-1">
            <Topbar orgLabel={m?.orgId} roleLabel={m?.role} />
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
`},
  {
    path: 'src/app/403/page.tsx',
    content: `export default function ForbiddenPage(){
  return (
    <div className="mx-auto max-w-xl space-y-3 rounded-2xl border border-border bg-card p-6 text-center">
      <h1 className="text-lg font-semibold">Acesso negado</h1>
      <p className="text-sm text-muted-foreground">Você não tem permissão para acessar esta área. Fale com um administrador.</p>
    </div>
  );
}
`},
  {
    path: 'src/app/dashboard/page.tsx',
    content: `import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';

export default async function Page(){
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'dashboard:view')) redirect('/403');
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">MRR</div>
        <div className="rounded-2xl border border-border bg-card p-4">Recebimentos (Hoje)</div>
        <div className="rounded-2xl border border-border bg-card p-4">Atrasadas</div>
        <div className="rounded-2xl border border-border bg-card p-4">Novos Leads</div>
      </div>
    </div>
  );
}
`},
  {
    path: 'src/app/financeiro/page.tsx',
    content: `import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { RequireScope } from '@/components/auth/RequireScope';

export default async function Page(){
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'finance:read')) redirect('/403');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Contas a Receber</h1>
        <RequireScope scopes={m.scopes} need="finance:write">
          <button className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90">Nova cobrança</button>
        </RequireScope>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">Tabela aqui</div>
    </div>
  );
}
`},
  { path: 'src/app/crm/page.tsx', content: `export default function Page(){ return <div>CRM</div>; }` },
  { path: 'src/app/projetos/page.tsx', content: `export default function Page(){ return <div>Projetos</div>; }` },
  { path: 'src/app/relatorios/page.tsx', content: `export default function Page(){ return <div>Relatórios</div>; }` },
  {
    path: 'src/app/settings/page.tsx',
    content: `import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';

export default async function Page(){
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'settings:manage')) redirect('/403');
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Configurações</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium">Usuários & Permissões</h2>
          <p className="text-sm text-muted-foreground">Convide usuários e defina papéis.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium">Integrações</h2>
          <p className="text-sm text-muted-foreground">Banco Inter, Asaas, WhatsApp, Google, Clicksign…</p>
        </div>
      </div>
    </div>
  );
}
`},
];

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function writeFileSafe(relPath, content) {
  const full = path.join(ROOT, relPath);
  await ensureDir(full);
  try {
    if (!FORCE) {
      await fs.access(full); // exists
      console.log('skip  ', relPath);
      return;
    }
  } catch (_) {}
  await fs.writeFile(full, content, 'utf8');
  console.log('write ', relPath);
}

(async function run(){
  try {
    for (const f of files) await writeFileSafe(f.path, f.content);
    // add npm script hint
    const pkgPath = path.join(ROOT, 'package.json');
    try {
      const pkgRaw = await fs.readFile(pkgPath, 'utf8');
      const pkg = JSON.parse(pkgRaw);
      pkg.scripts = pkg.scripts || {};
      if (!pkg.scripts.scaffold) pkg.scripts.scaffold = 'node scripts/scaffold-nexus-shell.mjs';
      await ensureDir(pkgPath);
      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
      console.log('update package.json (scripts.scaffold)');
    } catch (e) {
      console.warn('(!) não consegui atualizar package.json automaticamente:', e.message);
    }
    console.log('\n✔ Shell do Nexus criado. Rode:  npm run scaffold  (ou)  node scripts/scaffold-nexus-shell.mjs');
    console.log('Role atual em dev: defina NEXUS_DEV_ROLE=supervisor no .env.local ou cookie x-role');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
