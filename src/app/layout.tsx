import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { getCurrentMember } from '@/lib/session';
import { NotificationProvider } from '@/components/ui/Notifications';

export const metadata = {
  title: 'Nexus ERP',
  description: 'Sistema ERP completo para gestão empresarial',
  keywords: 'ERP, gestão, negócios, financeiro, CRM, projetos',
  authors: [{ name: 'Nexus Tech' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const m = await getCurrentMember();
  const scopes = m?.scopes ?? [];

  return (
    <html lang="pt-BR" className="h-full">
      <body className="bg-background text-foreground h-full">
        <NotificationProvider>
          <div className="flex h-screen">
            <Sidebar scopes={scopes} />
            <main className="flex-1 flex flex-col overflow-hidden">
              <Topbar orgLabel={m?.orgId} roleLabel={m?.role} />
              <div className="flex-1 p-6 overflow-auto">
                {children}
              </div>
            </main>
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}
