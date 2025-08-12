export default function ForbiddenPage(){
  return (
    <div className="mx-auto max-w-xl space-y-3 rounded-2xl border border-border bg-card p-6 text-center">
      <h1 className="text-lg font-semibold">Acesso negado</h1>
      <p className="text-sm text-muted-foreground">Você não tem permissão para acessar esta área. Fale com um administrador.</p>
    </div>
  );
}
