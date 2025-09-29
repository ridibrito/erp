'use client';

import { useState, useEffect } from 'react';
import { Save, X, Edit3 } from 'lucide-react';
import { useToastHelpers } from '@/components/ui/toast';

interface EditFormProps {
  data: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  type: 'contact' | 'company';
}

export function EditForm({ data, onSave, onCancel, type }: EditFormProps) {
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToastHelpers();

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
      success('Dados salvos', 'Informações atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      error('Erro ao salvar', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const isContact = type === 'contact';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados básicos */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Edit3 className="h-4 w-4 mr-2" />
          DADOS BÁSICOS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isContact ? (
            <>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nome"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Sobrenome
                </label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Sobrenome"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Cargo"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={formData.fantasy_name || ''}
                  onChange={(e) => handleInputChange('fantasy_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nome Fantasia"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Razão Social"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="E-mail"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Telefone"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              {isContact ? 'CPF' : 'CNPJ'}
            </label>
            <input
              type="text"
              value={formData.document || ''}
              onChange={(e) => handleInputChange('document', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={isContact ? 'CPF' : 'CNPJ'}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Status
            </label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Edit3 className="h-4 w-4 mr-2" />
          ENDEREÇO
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Rua
            </label>
            <input
              type="text"
              value={formData.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Rua"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Número
            </label>
            <input
              type="text"
              value={formData.address?.number || ''}
              onChange={(e) => handleAddressChange('number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Número"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Complemento
            </label>
            <input
              type="text"
              value={formData.address?.complement || ''}
              onChange={(e) => handleAddressChange('complement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Complemento"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Bairro
            </label>
            <input
              type="text"
              value={formData.address?.neighborhood || ''}
              onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Bairro"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Cidade
            </label>
            <input
              type="text"
              value={formData.address?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Cidade"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              Estado
            </label>
            <input
              type="text"
              value={formData.address?.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Estado"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
              CEP
            </label>
            <input
              type="text"
              value={formData.address?.zipcode || ''}
              onChange={(e) => handleAddressChange('zipcode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="CEP"
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Edit3 className="h-4 w-4 mr-2" />
          OBSERVAÇÕES
        </h3>
        
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            Notas
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Observações sobre o contato/empresa..."
          />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4 mr-2 inline" />
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
