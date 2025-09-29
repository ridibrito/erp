'use client';

import { useState, useEffect } from 'react';
import { useToastHelpers } from '@/components/ui/toast';
import { Drawer } from '@/components/ui/drawer';
import { Trash2, Edit, Save, X, Users, Building2, Upload } from 'lucide-react';
import { Contact } from '@/services/crmService';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  onSave: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => void;
  onDelete?: (contactId: string) => void;
  mode: 'view' | 'edit' | 'create';
}

export default function ContactDrawer({ 
  isOpen, 
  onClose, 
  contact, 
  onSave, 
  onDelete, 
  mode: initialMode 
}: ContactDrawerProps) {
  const { success, error, warning, info } = useToastHelpers();
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const [formData, setFormData] = useState<Contact>({
    type: 'person',
    first_name: '',
    last_name: '',
    name: '',
    fantasy_name: '',
    email: '',
    phone: '',
    document: '',
    document_type: 'cpf',
    position: '',
    account_id: '',
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
    // Se é um contato existente e está em modo view, mudar para edit
    if (contact && initialMode === 'view') {
      setMode('edit');
    } else {
      setMode(initialMode);
    }
  }, [initialMode, contact]);

  // Atualizar dados do formulário quando contato muda
  useEffect(() => {
    if (contact && contact.id && mode !== 'create') {
      setFormData(contact);
    } else if (mode === 'create') {
      setFormData({
        type: 'person',
        first_name: '',
        last_name: '',
        name: '',
        fantasy_name: '',
        email: '',
        phone: '',
        document: '',
        document_type: 'cpf',
        position: '',
        account_id: '',
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
  }, [contact, mode]);

  // Detectar mudanças não salvas
  useEffect(() => {
    if (contact && mode === 'edit') {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(contact);
      setHasUnsavedChanges(hasChanges);
    } else if (mode === 'create') {
      const hasChanges = formData.first_name || formData.last_name || formData.name || 
                        formData.email || formData.phone || formData.document;
      setHasUnsavedChanges(!!hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [formData, contact, mode]);

  // Carregar avatar do localStorage
  useEffect(() => {
    if (isOpen && contact?.id) {
      const savedAvatar = localStorage.getItem(`contact_avatar_${contact.id}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
  }, [isOpen, contact?.id]);

  // Resetar estados quando drawer fecha
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        type: 'person',
        first_name: '',
        last_name: '',
        name: '',
        fantasy_name: '',
        email: '',
        phone: '',
        document: '',
        document_type: 'cpf',
        position: '',
        account_id: '',
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
    }
  }, [isOpen]);

  // Resetar dados quando abrir em modo create
  useEffect(() => {
    if (isOpen && mode === 'create' && !contact) {
      setFormData({
        type: 'person',
        first_name: '',
        last_name: '',
        name: '',
        fantasy_name: '',
        email: '',
        phone: '',
        document: '',
        document_type: 'cpf',
        position: '',
        account_id: '',
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
  }, [isOpen, mode, contact]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Contact] as any),
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações específicas por tipo
    if (formData.type === 'person') {
      if (!formData.first_name?.trim()) {
        newErrors.first_name = 'Nome é obrigatório';
      }
      if (!formData.last_name?.trim()) {
        newErrors.last_name = 'Sobrenome é obrigatório';
      }
    } else {
      if (!formData.name?.trim()) {
        newErrors.name = 'Nome da empresa é obrigatório';
      }
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      error('Formulário inválido', 'Por favor, corrija os erros antes de salvar.');
      return;
    }

    try {
      onSave(formData);
      setHasUnsavedChanges(false);
      success('Contato salvo!', 'Contato salvo com sucesso.');
    } catch (err) {
      error('Erro ao salvar', 'Não foi possível salvar o contato. Tente novamente.');
    }
  };

  const handleDelete = () => {
    if (contact?.id && onDelete) {
      onDelete(contact.id);
      setShowDeleteModal(false);
      success('Contato excluído!', 'Contato removido com sucesso.');
    }
  };

  const handleBackdropClick = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    onClose();
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  const handleCloseDrawer = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  // Buscar CEP
  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
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
              zipcode: cleanCEP
            }
          }));
          success('CEP encontrado!', 'Endereço preenchido automaticamente.');
        } else {
          warning('CEP não encontrado', 'Verifique o CEP digitado.');
        }
      } catch (err) {
        error('Erro ao buscar CEP', 'Não foi possível buscar o endereço. Tente novamente.');
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  // Buscar dados do CNPJ
  const handleCNPJChange = async (cnpj: string) => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length === 14) {
      setLoadingCNPJ(true);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            name: data.razao_social || '',
            fantasy_name: data.nome_fantasia || '',
            address: {
              ...prev.address,
              street: data.logradouro || '',
              number: data.numero || '',
              complement: data.complemento || '',
              neighborhood: data.bairro || '',
              city: data.municipio || '',
              state: data.uf || '',
              zipcode: data.cep?.replace(/\D/g, '') || ''
            }
          }));
          success('CNPJ encontrado!', 'Dados da empresa preenchidos automaticamente.');
        } else {
          warning('CNPJ não encontrado', 'Verifique o CNPJ digitado.');
        }
      } catch (err) {
        error('Erro ao buscar CNPJ', 'Não foi possível buscar os dados da empresa. Tente novamente.');
      } finally {
        setLoadingCNPJ(false);
      }
    }
  };

  // Upload de avatar
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('Arquivo muito grande', 'O arquivo deve ter no máximo 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      error('Tipo de arquivo inválido', 'Apenas imagens são permitidas.');
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatar(result);
      
      // Salvar no localStorage
      if (contact?.id) {
        localStorage.setItem(`contact_avatar_${contact.id}`, result);
      }
      
      setUploadingAvatar(false);
      success('Avatar atualizado!', 'Foto do contato atualizada com sucesso.');
    };
    reader.readAsDataURL(file);
  };

  // Função para obter o nome de exibição
  const getDisplayName = () => {
    if (formData.type === 'person') {
      return `${formData.first_name} ${formData.last_name}`.trim() || 'Novo Contato';
    } else {
      return formData.fantasy_name || formData.name || 'Nova Empresa';
    }
  };

  const isEditable = mode === 'edit' || mode === 'create';

  return (
    <>
      <Drawer isOpen={isOpen} onClose={handleCloseDrawer} onBackdropClick={handleBackdropClick}>
        <div className="h-full flex flex-col">
          {/* Header com nome e ações */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    formData.type === 'person' ? (
                      <Users className="h-8 w-8 text-gray-600" />
                    ) : (
                      <Building2 className="h-8 w-8 text-gray-600" />
                    )
                  )}
                </div>
                {isEditable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingAvatar}
                    />
                    <div className="text-center text-white">
                      <Upload className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-xs">Upload</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{getDisplayName()}</h1>
                <p className="text-sm text-gray-500">
                  {formData.type === 'person' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              )}
              {contact?.id && onDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </button>
              )}
              <button
                onClick={handleCloseDrawer}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Conteúdo do formulário */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Tipo de contato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Contato
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="person"
                      checked={formData.type === 'person'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      disabled={!isEditable}
                      className="mr-2"
                    />
                    <Users className="h-4 w-4 mr-1" />
                    Pessoa Física
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="company"
                      checked={formData.type === 'company'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      disabled={!isEditable}
                      className="mr-2"
                    />
                    <Building2 className="h-4 w-4 mr-1" />
                    Pessoa Jurídica
                  </label>
                </div>
              </div>

              {/* Campos específicos por tipo */}
              {formData.type === 'person' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razão Social *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      value={formData.fantasy_name || ''}
                      onChange={(e) => handleInputChange('fantasy_name', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Cargo (apenas para pessoas) */}
              {formData.type === 'person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditable}
                    placeholder="Ex: Gerente, Diretor, etc."
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                  />
                </div>
              )}

              {/* Email e telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditable}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditable ? 'bg-gray-50' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditable}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditable ? 'bg-gray-50' : ''}`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === 'person' ? 'CPF' : 'CNPJ'}
                </label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => {
                    handleInputChange('document', e.target.value);
                    if (formData.type === 'company' && e.target.value.replace(/\D/g, '').length === 14) {
                      handleCNPJChange(e.target.value);
                    }
                  }}
                  disabled={!isEditable}
                  placeholder={formData.type === 'person' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                />
                {loadingCNPJ && (
                  <p className="mt-1 text-sm text-blue-600">Buscando dados da empresa...</p>
                )}
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.address.zipcode}
                      onChange={(e) => {
                        handleInputChange('address.zipcode', e.target.value);
                        if (e.target.value.replace(/\D/g, '').length === 8) {
                          handleCEPChange(e.target.value);
                        }
                      }}
                      disabled={!isEditable}
                      placeholder="00000-000"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                    {loadingCEP && (
                      <p className="mt-1 text-sm text-blue-600">Buscando endereço...</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rua
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.address.number}
                      onChange={(e) => handleInputChange('address.number', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.address.complement || ''}
                      onChange={(e) => handleInputChange('address.complement', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.address.neighborhood}
                      onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      disabled={!isEditable}
                      maxLength={2}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={!isEditable}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${!isEditable ? 'bg-gray-50' : ''}`}
                  placeholder="Observações sobre o contato..."
                />
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar exclusão
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de descarte */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Descartar alterações
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Você tem alterações não salvas. Tem certeza que deseja descartá-las?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDiscard}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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
