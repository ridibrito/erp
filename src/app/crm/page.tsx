import { redirect } from 'next/navigation';

export default function CRMPage() {
  // Redirecionar automaticamente para a página de clientes
  redirect('/crm/clientes');
}
