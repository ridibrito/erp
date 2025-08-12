import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="text-center space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">N</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Nexus ERP</h1>
              <p className="text-muted-foreground text-lg">
                Sistema completo de gestão empresarial
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Gestão de Negócios</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Controle Financeiro</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Gestão de Projetos</span>
            </div>
          </div>

          {/* Enter Button */}
          <div className="pt-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-primary-foreground bg-primary rounded-2xl hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Entrar no Sistema
            </Link>
          </div>

          {/* Footer */}
          <div className="pt-8 text-xs text-muted-foreground">
            <p>© 2024 Nexus ERP. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
