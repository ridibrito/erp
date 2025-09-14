import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext-simple';
import { NotificationProvider } from '@/components/ui/Notifications';
import { NoSSR } from '@/components/ui/NoSSR';
import { suppressHydrationWarning } from 'react';

export const metadata = {
  title: 'Cortus ERP',
  description: 'Sistema ERP completo para gestão empresarial',
  keywords: 'ERP, gestão, negócios, financeiro, CRM, projetos',
  authors: [{ name: 'Cortus Tech' }],
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning={true}>
      <body 
        className="bg-background text-foreground h-full"
        suppressHydrationWarning={true}
      >
        <NoSSR fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        }>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </NoSSR>
      </body>
    </html>
  );
}
