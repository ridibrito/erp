'use client';

import { useState, useEffect } from 'react';
import { useToastHelpers } from '@/components/ui/toast';
import { Drawer } from '@/components/ui/drawer';
import { Trash2, Save, X } from 'lucide-react';

export interface EditDrawerField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'custom';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  render?: (value: any, onChange: (value: any) => void, isEditable: boolean) => React.ReactNode;
  className?: string;
}

export interface EditDrawerSection {
  title: string;
  fields: EditDrawerField[];
  className?: string;
}

export interface EditDrawerProps<T> {
  isOpen: boolean;
  onClose: () => void;
  item?: T | null;
  onSave: (item: T) => void;
  onDelete?: (itemId: string) => void;
  mode: 'view' | 'edit' | 'create';
  title: string;
  sections: EditDrawerSection[];
  keyField: keyof T;
  getItemTitle: (item: T) => string;
  getItemSubtitle?: (item: T) => string;
  validateItem?: (item: T) => Record<string, string>;
  getInitialData?: () => T;
  showDeleteButton?: boolean;
  showSaveButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function EditDrawer<T extends Record<string, any>>({
  isOpen,
  onClose,
  item,
  onSave,
  onDelete,
  mode: initialMode,
  title,
  sections,
  keyField,
  getItemTitle,
  getItemSubtitle,
  validateItem,
  getInitialData,
  showDeleteButton = true,
  showSaveButton = true,
  size = 'xl',
  className = ''
}: EditDrawerProps<T>) {
  const { success, error, warning, info } = useToastHelpers();
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const [formData, setFormData] = useState<T>({} as T);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Atualizar modo quando prop muda
  useEffect(() => {
    if (item && initialMode === 'view') {
      setMode('edit');
    } else {
      setMode(initialMode);
    }
  }, [initialMode, item]);

  // Atualizar dados do formulário quando item muda
  useEffect(() => {
    if (item && mode !== 'create') {
      setFormData(item);
    } else if (mode === 'create') {
      setFormData(getInitialData ? getInitialData() : ({} as T));
    }
    setHasUnsavedChanges(false);
  }, [item, mode, getInitialData]);

  // Reset completo quando o drawer abrir em modo create
  useEffect(() => {
    if (isOpen && mode === 'create' && !item) {
      setFormData(getInitialData ? getInitialData() : ({} as T));
      setErrors({});
      setHasUnsavedChanges(false);
    }
  }, [isOpen, mode, item, getInitialData]);

  // Detectar mudanças não salvas
  useEffect(() => {
    if (mode === 'edit' || mode === 'create') {
      const isDirty = JSON.stringify(formData) !== JSON.stringify(item || (getInitialData ? getInitialData() : {}));
      setHasUnsavedChanges(isDirty);
    }
  }, [formData, item, mode, getInitialData]);

  // Limpar campos quando o drawer for fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({} as T);
      setErrors({});
      setHasUnsavedChanges(false);
      setShowDeleteModal(false);
      setShowDiscardModal(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof T] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (validateItem) {
      const newErrors = validateItem(formData);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      try {
        onSave(formData);
        setHasUnsavedChanges(false);
        success(
          mode === 'create' ? `${title} criado!` : `${title} atualizado!`,
          mode === 'create' 
            ? `${getItemTitle(formData)} foi adicionado com sucesso.`
            : `Os dados de ${getItemTitle(formData)} foram atualizados com sucesso.`
        );
      } catch (err) {
        error('Erro ao salvar', `Não foi possível salvar o ${title.toLowerCase()}. Tente novamente.`);
      }
    }
  };

  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(String(item[keyField]));
      setShowDeleteModal(false);
    }
  };

  const handleBackdropClick = () => {
    if (hasUnsavedChanges && (mode === 'edit' || mode === 'create')) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  const handleCloseDrawer = () => {
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

  const isEditable = mode === 'edit' || mode === 'create';

  const renderField = (field: EditDrawerField) => {
    const fieldKey = field.key;
    const value = formData[fieldKey];
    const hasError = errors[fieldKey];

    if (field.render) {
      return field.render(value, (newValue) => handleInputChange(fieldKey, newValue), isEditable);
    }

    const commonProps = {
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(fieldKey, e.target.value),
      disabled: !isEditable,
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } ${!isEditable ? 'bg-gray-50' : ''} ${field.className || ''}`,
      placeholder: field.placeholder
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Selecione...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleInputChange(fieldKey, e.target.checked)}
            disabled={!isEditable}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
              !isEditable ? 'opacity-50' : ''
            }`}
          />
        );
      
      default:
        return (
          <input
            type={field.type}
            {...commonProps}
          />
        );
    }
  };

  return (
    <>
      <Drawer 
        isOpen={isOpen} 
        onClose={onClose} 
        title={title} 
        size={size}
        onBackdropClick={handleBackdropClick}
      >
        <div className={`p-6 space-y-6 ${className}`}>
          {/* Cabeçalho com título e ações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {getItemTitle(formData)}
                </h1>
                {getItemSubtitle && (
                  <p className="text-sm text-gray-600">{getItemSubtitle(formData)}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Botão salvar só aparece quando há mudanças */}
              {showSaveButton && hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </button>
              )}
              
              {/* Botão excluir sempre visível para itens existentes */}
              {showDeleteButton && item && onDelete && (
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

          {/* Seções do formulário */}
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={section.className || ''}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{section.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                  <div key={field.key} className={field.className || ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderField(field)}
                    {errors[field.key] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Drawer>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Excluir {title}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Tem certeza que deseja excluir este {title.toLowerCase()}? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
        </div>
      )}

      {/* Modal de Confirmação de Descarte */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Descartar Alterações?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Você tem alterações não salvas. Deseja descartá-las e fechar o {title.toLowerCase()}?
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleCancelDiscard}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
        </div>
      )}
    </>
  );
}
