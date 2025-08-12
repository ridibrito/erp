"use client";
import { useState, useEffect } from 'react';
import { Mail, Search, Filter, Star, StarOff, Trash2, Archive, Reply, Forward, MoreHorizontal, Paperclip, User, Clock } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  priority: 'high' | 'normal' | 'low';
  category: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'high'>('all');
  const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent' | 'drafts' | 'spam' | 'trash'>('inbox');

  // Mock data
  useEffect(() => {
    setEmails([
      {
        id: '1',
        from: 'joao.silva@empresa.com',
        subject: 'Relatório Mensal - Janeiro 2024',
        preview: 'Segue em anexo o relatório mensal de vendas...',
        body: 'Prezados,\n\nSegue em anexo o relatório mensal de vendas de janeiro de 2024. As metas foram atingidas com sucesso, com crescimento de 15% em relação ao mês anterior.\n\nAtenciosamente,\nJoão Silva\nGerente de Vendas',
        timestamp: '2024-01-15T10:30:00',
        isRead: false,
        isStarred: true,
        hasAttachments: true,
        priority: 'high',
        category: 'inbox'
      },
      {
        id: '2',
        from: 'maria.santos@empresa.com',
        subject: 'Reunião de Equipe - Amanhã',
        preview: 'Lembrando que amanhã temos reunião de equipe às 14h...',
        body: 'Olá equipe,\n\nLembrando que amanhã temos reunião de equipe às 14h na sala de reuniões. Pauta: revisão de projetos em andamento e planejamento da próxima semana.\n\nAguardo todos!\nMaria Santos\nCoordenadora de Projetos',
        timestamp: '2024-01-15T09:15:00',
        isRead: true,
        isStarred: false,
        hasAttachments: false,
        priority: 'normal',
        category: 'inbox'
      },
      {
        id: '3',
        from: 'carlos.tech@empresa.com',
        subject: 'Atualização do Sistema',
        preview: 'Informamos que será realizada uma atualização do sistema...',
        body: 'Bom dia,\n\nInformamos que será realizada uma atualização do sistema na próxima sexta-feira, das 22h às 02h. Durante este período, o sistema ficará indisponível.\n\nPedimos desculpas pelo transtorno.\nCarlos Tech\nTI',
        timestamp: '2024-01-15T08:45:00',
        isRead: true,
        isStarred: false,
        hasAttachments: false,
        priority: 'normal',
        category: 'inbox'
      },
      {
        id: '4',
        from: 'cliente@abc.com',
        subject: 'Proposta Comercial',
        preview: 'Gostaríamos de solicitar uma proposta comercial...',
        body: 'Olá,\n\nGostaríamos de solicitar uma proposta comercial para nossos serviços. Podem nos enviar mais detalhes?\n\nObrigado,\nCliente ABC',
        timestamp: '2024-01-14T16:20:00',
        isRead: false,
        isStarred: false,
        hasAttachments: false,
        priority: 'high',
        category: 'inbox'
      }
    ]);
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' ||
                         (filter === 'unread' && !email.isRead) ||
                         (filter === 'starred' && email.isStarred) ||
                         (filter === 'high' && email.priority === 'high');

    return matchesSearch && matchesFilter && email.category === currentFolder;
  });

  const toggleStar = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const markAsRead = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Caixa de Entrada</h2>
          
          {/* Folders */}
          <div className="space-y-2">
            <button
              onClick={() => setCurrentFolder('inbox')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentFolder === 'inbox' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Caixa de Entrada</span>
              <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {emails.filter(e => e.category === 'inbox' && !e.isRead).length}
              </span>
            </button>
            
            <button
              onClick={() => setCurrentFolder('sent')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentFolder === 'sent' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Enviados</span>
            </button>
            
            <button
              onClick={() => setCurrentFolder('drafts')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentFolder === 'drafts' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Rascunhos</span>
            </button>
            
            <button
              onClick={() => setCurrentFolder('spam')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentFolder === 'spam' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Spam</span>
            </button>
            
            <button
              onClick={() => setCurrentFolder('trash')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentFolder === 'trash' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Lixeira</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentFolder === 'inbox' ? 'Caixa de Entrada' :
                 currentFolder === 'sent' ? 'Enviados' :
                 currentFolder === 'drafts' ? 'Rascunhos' :
                 currentFolder === 'spam' ? 'Spam' : 'Lixeira'}
              </h1>
              
              {/* Filter Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Não lidos
                </button>
                <button
                  onClick={() => setFilter('starred')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === 'starred' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Favoritos
                </button>
                <button
                  onClick={() => setFilter('high')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === 'high' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Alta Prioridade
                </button>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Mail className="w-4 h-4" />
              <span>Novo Email</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Email List and Content */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className="w-1/2 bg-white border-r border-gray-200">
            <div className="divide-y divide-gray-200">
              {filteredEmails.map(email => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    markAsRead(email.id);
                  }}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } ${!email.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                          {email.from}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${getPriorityColor(email.priority)}`}>
                            {email.priority === 'high' ? 'Alta' : email.priority === 'low' ? 'Baixa' : 'Normal'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(email.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm truncate mt-1 ${!email.isRead ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </p>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {email.preview}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {email.hasAttachments && (
                        <Paperclip className="w-4 h-4 text-gray-400" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email.id);
                        }}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        {email.isStarred ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 bg-gray-50">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                {/* Email Header */}
                <div className="bg-white border-b border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedEmail.subject}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>De: {selectedEmail.from}</span>
                        <span>•</span>
                        <span>{new Date(selectedEmail.timestamp).toLocaleString('pt-BR')}</span>
                        {selectedEmail.hasAttachments && (
                          <>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Paperclip className="w-3 h-3" />
                              <span>Anexos</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Reply className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Forward className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Archive className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="bg-white rounded-lg p-6">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-900">
                        {selectedEmail.body}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um email</h3>
                  <p className="text-gray-500">Escolha um email da lista para visualizar seu conteúdo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
