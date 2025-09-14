'use client';

import { useState, useEffect } from 'react';
import TransactionList from '@/components/financeiro/TransactionList';
import TransactionForm from '@/components/financeiro/TransactionForm';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'check';
  status: 'pending' | 'completed' | 'cancelled';
  reference?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export default function MovimentacaoPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | undefined>();
  const [loading, setLoading] = useState(true);

  // Dados mock para demonstração
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        category: 'Vendas',
        description: 'Venda de produto XYZ',
        amount: 1500.00,
        date: '2024-01-15',
        payment_method: 'pix',
        status: 'completed',
        reference: 'NF-001',
        notes: 'Cliente satisfeito com o produto',
        tags: ['venda', 'produto'],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        type: 'expense',
        category: 'Fornecedores',
        description: 'Compra de materiais',
        amount: 800.00,
        date: '2024-01-14',
        payment_method: 'credit_card',
        status: 'completed',
        reference: 'INV-123',
        notes: 'Materiais para produção',
        tags: ['fornecedor', 'materiais'],
        created_at: '2024-01-14T14:30:00Z',
        updated_at: '2024-01-14T14:30:00Z'
      },
      {
        id: '3',
        type: 'expense',
        category: 'Salários',
        description: 'Pagamento de salários',
        amount: 5000.00,
        date: '2024-01-10',
        payment_method: 'bank_transfer',
        status: 'completed',
        reference: 'FOLHA-01',
        notes: 'Salários do mês de janeiro',
        tags: ['salarios', 'folha'],
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-10T09:00:00Z'
      },
      {
        id: '4',
        type: 'income',
        category: 'Serviços',
        description: 'Consultoria técnica',
        amount: 2500.00,
        date: '2024-01-12',
        payment_method: 'pix',
        status: 'pending',
        reference: 'CONS-001',
        notes: 'Aguardando confirmação do pagamento',
        tags: ['consultoria', 'servico'],
        created_at: '2024-01-12T16:45:00Z',
        updated_at: '2024-01-12T16:45:00Z'
      },
      {
        id: '5',
        type: 'expense',
        category: 'Marketing',
        description: 'Campanha publicitária',
        amount: 1200.00,
        date: '2024-01-08',
        payment_method: 'credit_card',
        status: 'completed',
        reference: 'AD-001',
        notes: 'Campanha no Google Ads',
        tags: ['marketing', 'publicidade'],
        created_at: '2024-01-08T11:20:00Z',
        updated_at: '2024-01-08T11:20:00Z'
      }
    ];

    // Simular carregamento
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveTransaction = (transactionData: Transaction) => {
    if (editingTransaction) {
      // Atualizar transação existente
      setTransactions(prev => prev.map(transaction => 
        transaction.id === editingTransaction.id 
          ? { ...transactionData, id: editingTransaction.id, updated_at: new Date().toISOString() }
          : transaction
      ));
    } else {
      // Adicionar nova transação
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(undefined);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <TransactionForm
        transaction={editingTransaction}
        onSave={handleSaveTransaction}
        onCancel={handleCancelForm}
      />
    );
  }

  if (viewingTransaction) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes da Movimentação</h2>
            <button
              onClick={() => setViewingTransaction(undefined)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="text-sm text-gray-900 flex items-center">
                    <span className="mr-2">{viewingTransaction.type === 'income' ? '💰' : '💸'}</span>
                    {viewingTransaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Descrição</dt>
                  <dd className="text-sm text-gray-900">{viewingTransaction.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Categoria</dt>
                  <dd className="text-sm text-gray-900">{viewingTransaction.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Valor</dt>
                  <dd className={`text-sm font-bold ${
                    viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {viewingTransaction.type === 'expense' ? '-' : '+'}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(viewingTransaction.amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Data</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(viewingTransaction.date).toLocaleDateString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      viewingTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      viewingTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {viewingTransaction.status === 'completed' ? 'Concluído' :
                       viewingTransaction.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes Adicionais</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Forma de Pagamento</dt>
                  <dd className="text-sm text-gray-900">
                    {viewingTransaction.payment_method === 'pix' ? 'PIX' :
                     viewingTransaction.payment_method === 'credit_card' ? 'Cartão de Crédito' :
                     viewingTransaction.payment_method === 'debit_card' ? 'Cartão de Débito' :
                     viewingTransaction.payment_method === 'bank_transfer' ? 'Transferência Bancária' :
                     viewingTransaction.payment_method === 'cash' ? 'Dinheiro' : 'Cheque'}
                  </dd>
                </div>
                {viewingTransaction.reference && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Referência</dt>
                    <dd className="text-sm text-gray-900">{viewingTransaction.reference}</dd>
                  </div>
                )}
                {viewingTransaction.tags && viewingTransaction.tags.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tags</dt>
                    <dd className="text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {viewingTransaction.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(viewingTransaction.created_at).toLocaleString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Atualizado em</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(viewingTransaction.updated_at).toLocaleString('pt-BR')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {viewingTransaction.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Observações</h3>
              <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                {viewingTransaction.notes}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => {
                setViewingTransaction(undefined);
                handleEditTransaction(viewingTransaction);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Editar Movimentação
            </button>
            <button
              onClick={() => setViewingTransaction(undefined)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimentação Financeira</h1>
          <p className="text-gray-600 mt-1">Controle suas receitas e despesas</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleNewTransaction()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <svg className="h-5 w-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Receita
          </button>
          <button
            onClick={() => {
              const expenseTransaction = {
                type: 'expense' as const,
                category: '',
                description: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                payment_method: 'pix' as const,
                status: 'completed' as const,
                reference: '',
                notes: '',
                tags: []
              };
              setEditingTransaction(expenseTransaction);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <svg className="h-5 w-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Despesa
          </button>
        </div>
      </div>

      <TransactionList
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onView={handleViewTransaction}
      />
    </div>
  );
}