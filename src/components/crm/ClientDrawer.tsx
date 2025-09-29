'use client';

import { useState, useEffect } from 'react';
import { useToastHelpers } from '@/components/ui/toast';
import { Drawer } from '@/components/ui/drawer';
import { Trash2, Edit, Save, X } from 'lucide-react';

interface Client {
  id?: string;
  name: string;
  fantasy_name?: string;
  email: string;
  phone: string;
  document: string;
  document_type: 'cpf' | 'cnpj';
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  };
  status: 'active' | 'inactive' | 'prospect';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (client: Client) => void;
  onDelete?: (clientId: string) => void;
  mode: 'view' | 'edit' | 'create';
}

export default function ClientDrawer({ 
  isOpen, 
  onClose, 
  client, 
  onSave, 
  onDelete, 
  mode: initialMode 
}: ClientDrawerProps) {
  const { success, error, warning, info } = useToastHelpers();
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const [formData, setFormData] = useState<Client>({
    name: '',
    fantasy_name: '',
    email: '',
    phone: '',
    document: '',
    document_type: 'cpf',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: ''
    },
    status: 'prospect',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Atualizar modo quando prop muda
  useEffect(() => {
    // Se é um cliente existente e está em modo view, mudar para edit
    if (client && initialMode === 'view') {
      setMode('edit');
    } else {
      setMode(initialMode);
    }
  }, [initialMode, client]);

  // Atualizar dados do formulário quando cliente muda
  useEffect(() => {
    if (client && mode !== 'create') {
      setFormData(client);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        fantasy_name: '',
        email: '',
        phone: '',
        document: '',
        document_type: 'cpf',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipcode: ''
        },
        status: 'prospect',
        notes: ''
      });
    }
    setHasUnsavedChanges(false);
  }, [client, mode]);

  // Reset completo quando o drawer abrir em modo create
  useEffect(() => {
    if (isOpen && mode === 'create' && !client) {
      setFormData({
        name: '',
        fantasy_name: '',
        email: '',
        phone: '',
        document: '',
        document_type: 'cpf',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipcode: ''
        },
        status: 'prospect',
        notes: ''
      });
      setErrors({});
      setHasUnsavedChanges(false);
      setAvatar('');
    }
  }, [isOpen, mode, client]);

  // Detectar mudanças não salvas
  useEffect(() => {
    if (mode === 'edit' || mode === 'create') {
      const isDirty = JSON.stringify(formData) !== JSON.stringify(client || {
        name: '',
        fantasy_name: '',
        email: '',
        phone: '',
        document: '',
        document_type: 'cpf',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipcode: ''
        },
        status: 'prospect',
        notes: ''
      });
      setHasUnsavedChanges(isDirty);
    }
  }, [formData, client, mode]);

  // Carregar avatar salvo quando o drawer abrir
  useEffect(() => {
    if (isOpen && client?.id) {
      const savedAvatar = localStorage.getItem(`client_avatar_${client.id}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    } else if (isOpen && formData.id) {
      const savedAvatar = localStorage.getItem(`client_avatar_${formData.id}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
  }, [isOpen, client?.id, formData.id]);

  // Limpar campos quando o drawer for fechado
  useEffect(() => {
    if (!isOpen) {
      // Resetar todos os estados quando o drawer fechar
      setFormData({
        name: '',
        fantasy_name: '',
        email: '',
        phone: '',
        document: '',
        document_type: 'cpf',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipcode: ''
        },
        status: 'prospect',
        notes: ''
      });
      setErrors({});
      setHasUnsavedChanges(false);
      setAvatar('');
      setShowDeleteModal(false);
      setShowDiscardModal(false);
      setUploadingAvatar(false);
    }
  }, [isOpen]);

  // Funções de máscara
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .slice(0, 18);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14);
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  // Buscar dados do CEP
  const fetchCEPData = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setLoadingCEP(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.street || '',
            neighborhood: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
            zipcode: cep
          }
        }));
        success('CEP encontrado!', 'Endereço preenchido automaticamente.');
      } else {
        warning('CEP não encontrado', 'Verifique o CEP digitado.');
      }
    } catch (err) {
      error('Erro ao buscar CEP', 'Não foi possível consultar o CEP. Tente novamente.');
    } finally {
      setLoadingCEP(false);
    }
  };

  // Buscar dados do CNPJ
  const fetchCNPJData = async (cnpj: string) => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return;

    setLoadingCNPJ(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`, {
        headers: {
          'User-Agent': 'Cortus-ERP/1.0'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          name: data.razao_social || prev.name,
          fantasy_name: data.nome_fantasia || '',
          address: {
            ...prev.address,
            street: data.logradouro ? `${data.descricao_tipo_de_logradouro} ${data.logradouro}` : prev.address.street,
            number: data.numero || prev.address.number,
            neighborhood: data.bairro || prev.address.neighborhood,
            city: data.municipio || prev.address.city,
            state: data.uf || prev.address.state,
            zipcode: data.cep || prev.address.zipcode
          }
        }));
        success('CNPJ encontrado!', 'Dados da empresa preenchidos automaticamente.');
      } else {
        warning('CNPJ não encontrado', 'Verifique o CNPJ digitado.');
      }
    } catch (err) {
      error('Erro ao buscar CNPJ', 'Não foi possível consultar o CNPJ. Tente novamente.');
    } finally {
      setLoadingCNPJ(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Apenas o nome é obrigatório - clientes podem ser prospects
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    // Email opcional, mas se preenchido deve ser válido
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Todos os outros campos são opcionais para prospects

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Client] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      try {
        onSave(formData);
        setHasUnsavedChanges(false); // Reset do estado de mudanças
        success(
          mode === 'create' ? 'Cliente criado!' : 'Cliente atualizado!',
          mode === 'create' 
            ? `${formData.name} foi adicionado com sucesso.`
            : `Os dados de ${formData.name} foram atualizados com sucesso.`
        );
      } catch (err) {
        error('Erro ao salvar', 'Não foi possível salvar o cliente. Tente novamente.');
      }
    }
  };

  const handleDelete = () => {
    if (client?.id && onDelete) {
      onDelete(client.id);
      setShowDeleteModal(false);
      onClose();
    }
  };

  const handleBackdropClick = () => {
    // Se há mudanças não salvas, mostrar modal de confirmação
    if (hasUnsavedChanges && (mode === 'edit' || mode === 'create')) {
      setShowDiscardModal(true);
    } else {
      // Se não há mudanças, fechar diretamente
      onClose();
    }
  };

  const handleCloseDrawer = () => {
    // Mesma lógica do backdrop click
    if (hasUnsavedChanges && (mode === 'edit' || mode === 'create')) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      error('Arquivo inválido', 'Por favor, selecione apenas imagens.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Arquivo muito grande', 'A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Criar URL temporária para preview
      const tempUrl = URL.createObjectURL(file);
      setAvatar(tempUrl);

      // Salvar avatar no localStorage para persistir
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (client?.id) {
          localStorage.setItem(`client_avatar_${client.id}`, base64);
        } else if (formData.id) {
          localStorage.setItem(`client_avatar_${formData.id}`, base64);
        }
      };
      reader.readAsDataURL(file);
      
      // Aqui você pode implementar o upload real para o Supabase Storage
      // Por enquanto, vamos apenas simular o sucesso
      setTimeout(() => {
        success('Avatar atualizado!', 'A foto do cliente foi atualizada com sucesso.');
        setUploadingAvatar(false);
      }, 1000);
    } catch (err) {
      error('Erro no upload', 'Não foi possível fazer upload da imagem.');
      setUploadingAvatar(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Novo Cliente';
      case 'edit': return 'Cliente';
      case 'view': return 'Cliente';
      default: return 'Cliente';
    }
  };

  const isEditable = mode === 'edit' || mode === 'create';

  return (
    <>
      <Drawer 
        isOpen={isOpen} 
        onClose={onClose} 
        title={getTitle()} 
        size="xl"
        onBackdropClick={handleBackdropClick}
      >
        <div className="p-6 space-y-6">
          {/* Nome do cliente e ações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar clicável */}
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden cursor-pointer group">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-medium text-lg">
                      {formData.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Overlay de upload */}
                {isEditable && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white">
                        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-xs font-medium">Upload</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {formData.document_type === 'cnpj' && formData.fantasy_name 
                    ? formData.fantasy_name 
                    : formData.name}
                </h1>
                {formData.document_type === 'cnpj' && formData.fantasy_name && (
                  <p className="text-sm text-gray-600">{formData.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Botão salvar só aparece quando há mudanças */}
              {hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </button>
              )}
              
              {/* Botão excluir sempre visível para clientes existentes */}
              {client?.id && onDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </button>
              )}
              
              {/* Botão fechar */}
              <button
                onClick={handleCloseDrawer}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.document_type === 'cnpj' ? 'Razão Social' : 'Nome Completo'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } ${!isEditable ? 'bg-gray-50' : ''}`}
                  placeholder={formData.document_type === 'cnpj' ? 'Razão social da empresa' : 'Nome completo'}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditable ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            {/* Nome Fantasia (apenas para CNPJ) */}
            {formData.document_type === 'cnpj' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={formData.fantasy_name || ''}
                  onChange={(e) => handleInputChange('fantasy_name', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditable ? 'bg-gray-50' : ''
                  }`}
                  placeholder="Nome fantasia da empresa"
                />
              </div>
            )}

            {/* Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${!isEditable ? 'bg-gray-50' : ''}`}
                  placeholder="email@exemplo.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } ${!isEditable ? 'bg-gray-50' : ''}`}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => handleInputChange('document_type', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditable ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.document_type === 'cpf' ? 'CPF' : 'CNPJ'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => {
                      const formatted = formData.document_type === 'cpf' 
                        ? formatCPF(e.target.value) 
                        : formatCNPJ(e.target.value);
                      handleInputChange('document', formatted);
                    }}
                    disabled={!isEditable}
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.document ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditable ? 'bg-gray-50' : ''}`}
                    placeholder={formData.document_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                  {formData.document_type === 'cnpj' && isEditable && (
                    <button
                      type="button"
                      onClick={() => fetchCNPJData(formData.document)}
                      disabled={loadingCNPJ || formData.document.replace(/\D/g, '').length !== 14}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      title="Buscar dados na Receita Federal"
                    >
                      {loadingCNPJ ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
              </div>
            </div>

            {/* Endereço */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rua
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    disabled={!isEditable}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditable ? 'bg-gray-50' : ''}`}
                    placeholder="Nome da rua"
                  />
                  {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address.number', e.target.value)}
                    disabled={!isEditable}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.number ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditable ? 'bg-gray-50' : ''}`}
                    placeholder="123"
                  />
                  {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.address.complement}
                    onChange={(e) => handleInputChange('address.complement', e.target.value)}
                    disabled={!isEditable}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditable ? 'bg-gray-50' : ''
                    }`}
                    placeholder="Apto 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                    disabled={!isEditable}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.neighborhood ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditable ? 'bg-gray-50' : ''}`}
                    placeholder="Centro"
                  />
                  {errors.neighborhood && <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.address.zipcode}
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value);
                        handleInputChange('address.zipcode', formatted);
                      }}
                      onBlur={(e) => {
                        if (e.target.value.replace(/\D/g, '').length === 8 && isEditable) {
                          fetchCEPData(e.target.value);
                        }
                      }}
                      disabled={!isEditable}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.zipcode ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditable ? 'bg-gray-50' : ''}`}
                      placeholder="00000-000"
                    />
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => fetchCEPData(formData.address.zipcode)}
                        disabled={loadingCEP || formData.address.zipcode.replace(/\D/g, '').length !== 8}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        title="Buscar endereço"
                      >
                        {loadingCEP ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  {errors.zipcode && <p className="text-red-500 text-sm mt-1">{errors.zipcode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    disabled={!isEditable}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditable ? 'bg-gray-50' : ''}`}
                    placeholder="São Paulo"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    disabled={!isEditable}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditable ? 'bg-gray-50' : ''}`}
                    placeholder="SP"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={!isEditable}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditable ? 'bg-gray-50' : ''
                }`}
                placeholder="Informações adicionais sobre o cliente..."
              />
            </div>
          </div>
        </div>
      </Drawer>

      {/* Modal de confirmação para excluir */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Excluir Cliente</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o cliente <strong>{formData.name}</strong>? 
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação para descartar mudanças */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <X className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Descartar Mudanças</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Você tem mudanças não salvas. Tem certeza que deseja descartar essas alterações? 
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDiscard}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
