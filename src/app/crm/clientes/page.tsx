import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone,
  Building2,
  MoreHorizontal
} from 'lucide-react';

export default async function Page(){
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'crm:read')) redirect('/403');
  
  const clients = [
    {
      id: 1,
      name: 'Empresa ABC Ltda',
      email: 'contato@empresaabc.com',
      phone: '(11) 99999-9999',
      type: 'Empresa',
      status: 'Ativo',
      lastContact: '2024-01-15'
    },
    {
      id: 2,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 88888-8888',
      type: 'Pessoa Física',
      status: 'Ativo',
      lastContact: '2024-01-10'
    },
    {
      id: 3,
      name: 'Startup XYZ',
      email: 'hello@startupxyz.com',
      phone: '(11) 77777-7777',
      type: 'Empresa',
      status: 'Prospecto',
      lastContact: '2024-01-08'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e prospects</p>
        </div>
        <button className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Buscar clientes..." 
              className="pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-input rounded-xl hover:bg-muted/50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                {client.type === 'Empresa' ? (
                  <Building2 className="w-6 h-6 text-primary" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{client.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  client.status === 'Ativo' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                }`}>
                  {client.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Último contato: {new Date(client.lastContact).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
