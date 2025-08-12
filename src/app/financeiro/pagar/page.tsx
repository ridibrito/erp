import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { can } from '@/lib/authz';
import { 
  Plus, 
  Filter, 
  Search, 
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default async function Page(){
  const m = await getCurrentMember();
  if (!m || !can(m.scopes, 'finance:read')) redirect('/403');
  
  const bills = [
    {
      id: 'BILL-001',
      supplier: 'Fornecedor ABC Ltda',
      amount: 1500.00,
      dueDate: '2024-01-20',
      status: 'pending',
      description: 'Serviços de TI'
    },
    {
      id: 'BILL-002',
      supplier: 'Empresa XYZ',
      amount: 2800.00,
      dueDate: '2024-01-15',
      status: 'paid',
      description: 'Licenças de software'
    },
    {
      id: 'BILL-003',
      supplier: 'Consultoria DEF',
      amount: 3200.00,
      dueDate: '2024-01-10',
      status: 'overdue',
      description: 'Consultoria estratégica'
    },
    {
      id: 'BILL-004',
      supplier: 'Marketing Plus',
      amount: 1200.00,
      dueDate: '2024-01-25',
      status: 'pending',
      description: 'Campanha digital'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-600';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'overdue': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas obrigações financeiras</p>
        </div>
        <button className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Nova conta</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total a Pagar</p>
              <p className="text-2xl font-bold">R$ 8.700</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">R$ 5.900</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold">R$ 3.200</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pagas (Mês)</p>
              <p className="text-2xl font-bold">R$ 12.400</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Buscar contas..." 
              className="pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-input rounded-xl hover:bg-muted/50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
        
        <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-input rounded-xl hover:bg-muted/50 transition-colors">
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Bills Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Conta</th>
                <th className="text-left p-4 font-medium text-sm">Fornecedor</th>
                <th className="text-left p-4 font-medium text-sm">Valor</th>
                <th className="text-left p-4 font-medium text-sm">Vencimento</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
                <th className="text-right p-4 font-medium text-sm">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{bill.id}</p>
                      <p className="text-sm text-muted-foreground">{bill.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{bill.supplier}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{new Date(bill.dueDate).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bill.status)}`}>
                      {getStatusText(bill.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
