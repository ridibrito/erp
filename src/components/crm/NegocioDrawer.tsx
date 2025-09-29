'use client';

import { useState, useEffect, useRef } from 'react';
import { Negocio, NegocioFormData, Pipeline, PipelineStage } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CRMService, Contact } from '@/services/crmService';
import { X, Save, User, Building, DollarSign, Calendar, FileText, Users, Search, ChevronDown } from 'lucide-react';

interface NegocioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (negocio: NegocioFormData) => void;
  pipelines: Pipeline[];
  selectedPipeline?: Pipeline;
  loading?: boolean;
  orgId?: string;
}

export function NegocioDrawer({
  isOpen,
  onClose,
  onSave,
  pipelines,
  selectedPipeline,
  loading = false,
  orgId
}: NegocioDrawerProps) {
  const [formData, setFormData] = useState<NegocioFormData>({
    title: '',
    client: '',
    value: 0,
    probability: 0,
    stageId: '',
    pipelineId: selectedPipeline?.id || '',
    nextContact: '',
    responsible: '',
    description: '',
    contactId: '',
    companyId: ''
  });

  const [selectedPipelineStages, setSelectedPipelineStages] = useState<PipelineStage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const contactDropdownRef = useRef<HTMLDivElement>(null);

  // Atualizar stages quando pipeline muda
  useEffect(() => {
    if (formData.pipelineId) {
      const pipeline = pipelines.find(p => p.id === formData.pipelineId);
      if (pipeline) {
        setSelectedPipelineStages(pipeline.stages || []);
        // Selecionar primeira etapa se não houver seleção
        if (!formData.stageId && pipeline.stages && pipeline.stages.length > 0) {
          setFormData(prev => ({ ...prev, stageId: pipeline.stages[0].id }));
        }
      }
    } else {
      setSelectedPipelineStages([]);
    }
  }, [formData.pipelineId, pipelines]);

  // Carregar contatos quando drawer abre
  useEffect(() => {
    if (isOpen && orgId) {
      loadContacts();
    }
  }, [isOpen, orgId]);

  // Resetar form quando drawer abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        client: '',
        value: 0,
        probability: 0,
        stageId: selectedPipeline?.stages?.[0]?.id || '',
        pipelineId: selectedPipeline?.id || '',
        nextContact: '',
        responsible: '',
        description: '',
        contactId: '',
        companyId: ''
      });
      setContactSearchTerm('');
      setIsContactDropdownOpen(false);
    }
  }, [isOpen, selectedPipeline]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target as Node)) {
        setIsContactDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadContacts = async () => {
    if (!orgId) return;
    
    try {
      setLoadingContacts(true);
      console.log('Carregando contatos para orgId:', orgId);
      const contactsData = await CRMService.getContacts(orgId);
      console.log('Contatos carregados:', contactsData);
      setContacts(contactsData);
    } catch (err) {
      console.error('Erro ao carregar contatos:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleInputChange = (field: keyof NegocioFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSelect = (contact: Contact) => {
    const contactName = contact.name || 
                       (contact.first_name && contact.last_name ? `${contact.first_name} ${contact.last_name}` : '') ||
                       contact.fantasy_name || 
                       'Nome não informado';
    
    setFormData(prev => ({
      ...prev,
      contactId: contact.id,
      client: contactName
    }));
    setContactSearchTerm(contactName);
    setIsContactDropdownOpen(false);
  };

  const filteredContacts = contacts.filter(contact => {
    const searchTerm = contactSearchTerm?.toLowerCase() || '';
    
    // Se não há termo de busca, mostrar todos os contatos
    if (!searchTerm.trim()) {
      return true;
    }
    
    const matches = (
      contact.name?.toLowerCase().includes(searchTerm) ||
      contact.first_name?.toLowerCase().includes(searchTerm) ||
      contact.last_name?.toLowerCase().includes(searchTerm) ||
      contact.fantasy_name?.toLowerCase().includes(searchTerm) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm))
    );
    return matches;
  });

  // Debug logs
  console.log('Estado atual:', {
    contacts: contacts.length,
    contactSearchTerm,
    filteredContacts: filteredContacts.length,
    isContactDropdownOpen
  });

  const selectedContact = contacts.find(c => c.id === formData.contactId);

  const handleSave = () => {
    // Nenhum campo é obrigatório, então podemos salvar com dados parciais
    onSave(formData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end"
      onClick={onClose}
    >
      <div 
        className={`bg-white shadow-xl w-full max-w-2xl h-full overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Novo Negócio</h2>
              <p className="text-sm text-muted-foreground">
                Preencha as informações do negócio
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Negócio</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Implementação de ERP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Cliente (Contato)</Label>
                <div className="relative" ref={contactDropdownRef}>
                  <div className="relative">
                    <Input
                      id="contact"
                      value={contactSearchTerm}
                      onChange={(e) => {
                        setContactSearchTerm(e.target.value);
                        setIsContactDropdownOpen(true);
                      }}
                      onFocus={() => setIsContactDropdownOpen(true)}
                      placeholder="Buscar contato..."
                      disabled={loadingContacts}
                      className="pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {loadingContacts ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {isContactDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredContacts.length > 0 ? (
                        filteredContacts.map(contact => (
                          <div
                            key={contact.id}
                            onClick={() => handleContactSelect(contact)}
                            className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex flex-col">
                              <div className="font-medium text-gray-900">
                                {contact.name || 
                                 (contact.first_name && contact.last_name ? `${contact.first_name} ${contact.last_name}` : '') ||
                                 contact.fantasy_name || 
                                 'Nome não informado'}
                              </div>
                              {contact.fantasy_name && contact.fantasy_name !== contact.name && (
                                <div className="text-sm text-gray-600">{contact.fantasy_name}</div>
                              )}
                              {contact.email && (
                                <div className="text-sm text-gray-500">{contact.email}</div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                          {contactSearchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato disponível'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Nome do Cliente (Manual)</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                placeholder="Ex: TechCorp Ltda (ou será preenchido automaticamente)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o negócio..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                rows={3}
              />
            </div>
          </div>

          {/* Pipeline e Etapa */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="w-4 h-4" />
              Pipeline e Etapa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pipeline">Pipeline</Label>
                <select
                  id="pipeline"
                  value={formData.pipelineId}
                  onChange={(e) => handleInputChange('pipelineId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <option value="">Selecionar Pipeline</option>
                  {pipelines.map(pipeline => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Etapa</Label>
                <select
                  id="stage"
                  value={formData.stageId}
                  onChange={(e) => handleInputChange('stageId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={!formData.pipelineId}
                >
                  <option value="">Selecionar Etapa</option>
                  {selectedPipelineStages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Valores e Probabilidade */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Valores e Probabilidade
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="text"
                  value={formData.value > 0 ? formatCurrency(formData.value) : ''}
                  onChange={(e) => {
                    const numericValue = parseCurrency(e.target.value);
                    handleInputChange('value', numericValue);
                  }}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability">Probabilidade (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${formData.probability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsável e Próximo Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Responsável e Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextContact">Próximo Contato</Label>
                <Input
                  id="nextContact"
                  type="date"
                  value={formData.nextContact}
                  onChange={(e) => handleInputChange('nextContact', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
