'use client';

import { useState, useEffect } from 'react';
import { useToastHelpers } from '@/components/ui/toast';
import { Drawer } from '@/components/ui/drawer';
import { Trash2, Edit, Save, X, Building2, Upload } from 'lucide-react';
import { Company } from '@/services/crmService';

interface CompanyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Company | null;
  onSave: (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => void;
  onDelete?: (companyId: string) => void;
  mode: 'view' | 'edit' | 'create';
}

export default function CompanyDrawer({ 
  isOpen, 
  onClose, 
  company, 
  onSave, 
  onDelete, 
  mode 
}: CompanyDrawerProps) {
  const { success, error } = useToastHelpers();
  const [formData, setFormData] = useState({
    name: '',
    fantasy_name: '',
    email: '',
    phone: '',
    document: '',
    document_type: 'cnpj' as 'cnpj',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: ''
    },
    status: 'active' as 'active' | 'inactive' | 'prospect',
    notes: ''
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Reset form when drawer opens/closes or contact changes
  useEffect(() => {
    if (isOpen) {
      if (company && company.id && mode !== 'create') {
        setFormData({
          name: company.name || '',
          fantasy_name: company.fantasy_name || '',
          email: company.email || '',
          phone: company.phone || '',
          document: company.document || '',
          document_type: company.document_type || 'cnpj',
          address: company.address || {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipcode: ''
          },
          status: company.status || 'active',
          notes: company.notes || ''
        });
        
        // Load existing avatar
        const existingAvatar = localStorage.getItem(`company_avatar_${company.id}`);
        if (existingAvatar) {
          setAvatarPreview(existingAvatar);
        } else {
          setAvatarPreview('');
        }
      } else {
        // Reset form for new company
        setFormData({
          name: '',
          fantasy_name: '',
          email: '',
          phone: '',
          document: '',
          document_type: 'cnpj',
          address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipcode: ''
          },
          status: 'active',
          notes: ''
        });
        setAvatarPreview('');
      }
      setHasUnsavedChanges(false);
      setAvatarFile(null);
    }
  }, [isOpen, company, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Upload avatar if new file selected
      if (avatarFile && company?.id) {
        setUploadingAvatar(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          localStorage.setItem(`company_avatar_${company.id}`, result);
          setAvatarPreview(result);
          setUploadingAvatar(false);
        };
        reader.readAsDataURL(avatarFile);
      }

      await onSave(formData);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Erro ao salvar empresa:', err);
    }
  };

  const handleDelete = () => {
    if (company?.id && onDelete) {
      onDelete(company.id);
    }
  };

  const handleBackdropClick = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  const handleCloseDrawer = () => {
    if (hasUnsavedChanges) {
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setHasUnsavedChanges(true);
    }
  };

  const getDisplayName = () => {
    if (company) {
      return company.fantasy_name || company.name || 'Empresa';
    }
    return 'Nova Empresa';
  };

  // Função para buscar dados do CNPJ
  const handleCNPJSearch = async () => {
    const cnpj = formData.document.replace(/\D/g, '');
    if (cnpj.length !== 14) {
      error('CNPJ inválido', 'Por favor, digite um CNPJ válido com 14 dígitos.');
      return;
    }

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!response.ok) {
        throw new Error('CNPJ não encontrado');
      }

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        name: data.razao_social || '',
        fantasy_name: data.nome_fantasia || '',
        address: {
          street: data.logradouro || '',
          number: data.numero || '',
          complement: data.complemento || '',
          neighborhood: data.bairro || '',
          city: data.municipio || '',
          state: data.uf || '',
          zipcode: data.cep || ''
        }
      }));
      
      success('CNPJ encontrado!', 'Dados da empresa carregados com sucesso.');
    } catch (err) {
      error('Erro ao buscar CNPJ', 'Não foi possível encontrar os dados do CNPJ. Verifique se o número está correto.');
    }
  };

  // Função para buscar dados do CEP
  const handleCEPSearch = async () => {
    const cep = formData.address.zipcode.replace(/\D/g, '');
    if (cep.length !== 8) {
      error('CEP inválido', 'Por favor, digite um CEP válido com 8 dígitos.');
      return;
    }

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (!response.ok) {
        throw new Error('CEP não encontrado');
      }

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          street: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || ''
        }
      }));
      
      success('CEP encontrado!', 'Endereço carregado com sucesso.');
    } catch (err) {
      error('Erro ao buscar CEP', 'Não foi possível encontrar o endereço. Verifique se o CEP está correto.');
    }
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={handleBackdropClick}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-600" />
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200">
                    <Upload className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{getDisplayName()}</h2>
                <p className="text-sm text-gray-500">
                  {company ? 'Editar empresa' : 'Criar nova empresa'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'edit' && onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Excluir empresa"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleCloseDrawer}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      value={formData.fantasy_name}
                      onChange={(e) => handleInputChange('fantasy_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome fantasia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.document}
                        onChange={(e) => handleInputChange('document', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="00.000.000/0000-00"
                      />
                      <button
                        type="button"
                        onClick={handleCNPJSearch}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Buscar dados do CNPJ"
                      >
                        <img src="/rfb.png" alt="RFB" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="prospect">Prospect</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.address.number}
                      onChange={(e) => handleAddressChange('number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.address.complement}
                      onChange={(e) => handleAddressChange('complement', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Sala 101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.address.neighborhood}
                      onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.address.zipcode}
                        onChange={(e) => handleAddressChange('zipcode', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="01234-567"
                      />
                      <button
                        type="button"
                        onClick={handleCEPSearch}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        title="Buscar endereço pelo CEP"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Observações</h3>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações sobre a empresa..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDrawer}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              {hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
                >
                  {uploadingAvatar ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Descartar Alterações?</h3>
            <p className="text-gray-700 mb-6">
              Você tem alterações não salvas. Tem certeza que deseja descartá-las?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
