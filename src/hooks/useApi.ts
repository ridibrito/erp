import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse, PaginatedResponse } from '@/types/database';

interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  immediate?: boolean;
  cache?: boolean;
  cacheTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  transform?: (data: any) => T;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (params?: Partial<UseApiOptions<T>>) => Promise<T | null>;
  refetch: () => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
}

// Cache global para as requisições
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function useApi<T = any>(options: UseApiOptions<T>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheKey = `${options.method || 'GET'}:${options.url}`;

  const execute = useCallback(async (params?: Partial<UseApiOptions<T>>): Promise<T | null> => {
    const finalOptions = { ...options, ...params };
    const finalCacheKey = `${finalOptions.method || 'GET'}:${finalOptions.url}`;

    // Verificar cache
    if (finalOptions.cache !== false) {
      const cached = apiCache.get(finalCacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        setState(prev => ({ ...prev, data: cached.data, loading: false, error: null }));
        return cached.data;
      }
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(finalOptions.url, {
        method: finalOptions.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...finalOptions.headers,
        },
        body: finalOptions.body ? JSON.stringify(finalOptions.body) : undefined,
        signal: abortControllerRef.current.signal,
      });

      setState(prev => ({ ...prev, status: response.status }));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Erro ${response.status}: ${response.statusText}`;
        
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage,
          data: null 
        }));
        
        finalOptions.onError?.(errorMessage);
        return null;
      }

      const responseData = await response.json();
      const transformedData = finalOptions.transform ? finalOptions.transform(responseData) : responseData;

      // Salvar no cache se habilitado
      if (finalOptions.cache !== false) {
        apiCache.set(finalCacheKey, {
          data: transformedData,
          timestamp: Date.now(),
          ttl: finalOptions.cacheTime || 5 * 60 * 1000, // 5 minutos por padrão
        });
      }

      setState(prev => ({ 
        ...prev, 
        data: transformedData, 
        loading: false, 
        error: null 
      }));

      finalOptions.onSuccess?.(transformedData);
      return transformedData;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null; // Requisição foi cancelada
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        data: null 
      }));
      
      finalOptions.onError?.(errorMessage);
      return null;
    }
  }, [options]);

  const refetch = useCallback(() => {
    // Limpar cache para forçar nova requisição
    apiCache.delete(cacheKey);
    return execute();
  }, [execute, cacheKey]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      status: null,
    });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  // Executar automaticamente se immediate for true
  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }

    // Cleanup: cancelar requisição quando componente desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, options.immediate]);

  return {
    ...state,
    execute,
    refetch,
    reset,
    setData,
  };
}

// Hook especializado para listagens paginadas
export function usePaginatedApi<T = any>(
  options: Omit<UseApiOptions<PaginatedResponse<T>>, 'transform'> & {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  const [page, setPage] = useState(options.page || 1);
  const [limit, setLimit] = useState(options.limit || 20);
  const [sortBy, setSortBy] = useState(options.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(options.sortOrder || 'desc');

  const buildUrl = useCallback(() => {
    const url = new URL(options.url, window.location.origin);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    if (sortBy) {
      url.searchParams.set('sort_by', sortBy);
      url.searchParams.set('sort_order', sortOrder);
    }
    return url.toString();
  }, [options.url, page, limit, sortBy, sortOrder]);

  const api = useApi<PaginatedResponse<T>>({
    ...options,
    url: buildUrl(),
    cache: false, // Desabilitar cache para listagens
  });

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Voltar para primeira página
  }, []);

  const changeSort = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc' = 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Voltar para primeira página
  }, []);

  const refresh = useCallback(() => {
    setPage(1);
  }, []);

  return {
    ...api,
    pagination: {
      page,
      limit,
      sortBy,
      sortOrder,
      goToPage,
      changeLimit,
      changeSort,
      refresh,
    },
  };
}

// Hook para operações CRUD
export function useCrudApi<T = any>(baseUrl: string) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const list = useApi<PaginatedResponse<T>>({
    url: baseUrl,
    method: 'GET',
    cache: false,
  });

  const create = useApi<T>({
    url: baseUrl,
    method: 'POST',
    immediate: false,
  });

  const update = useApi<T>({
    url: selectedItem ? `${baseUrl}/${(selectedItem as any).id}` : baseUrl,
    method: 'PUT',
    immediate: false,
  });

  const remove = useApi<{ success: boolean }>({
    url: selectedItem ? `${baseUrl}/${(selectedItem as any).id}` : baseUrl,
    method: 'DELETE',
    immediate: false,
  });

  const getById = useApi<T>({
    url: selectedItem ? `${baseUrl}/${(selectedItem as any).id}` : baseUrl,
    method: 'GET',
    immediate: false,
  });

  const handleCreate = useCallback(async (data: Partial<T>) => {
    const result = await create.execute({ body: data });
    if (result) {
      list.refetch(); // Recarregar lista
    }
    return result;
  }, [create, list]);

  const handleUpdate = useCallback(async (data: Partial<T>) => {
    const result = await update.execute({ body: data });
    if (result) {
      list.refetch(); // Recarregar lista
      setIsEditing(false);
      setSelectedItem(null);
    }
    return result;
  }, [update, list]);

  const handleDelete = useCallback(async () => {
    const result = await remove.execute();
    if (result?.success) {
      list.refetch(); // Recarregar lista
      setSelectedItem(null);
    }
    return result;
  }, [remove, list]);

  const handleEdit = useCallback((item: T) => {
    setSelectedItem(item);
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedItem(null);
    setIsEditing(false);
  }, []);

  return {
    // Estados
    selectedItem,
    isEditing,
    
    // Operações
    list,
    create,
    update,
    remove,
    getById,
    
    // Handlers
    handleCreate,
    handleUpdate,
    handleDelete,
    handleEdit,
    handleCancel,
    setSelectedItem,
    setIsEditing,
  };
}

// Hook para upload de arquivos
export function useFileUpload(options: {
  url: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File, additionalData?: Record<string, any>) => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(percentComplete);
            options.onProgress?.(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              setUploading(false);
              setProgress(100);
              options.onSuccess?.(response);
              resolve(response);
            } catch (error) {
              setUploading(false);
              setProgress(0);
              options.onError?.('Erro ao processar resposta');
              reject(new Error('Erro ao processar resposta'));
            }
          } else {
            setUploading(false);
            setProgress(0);
            options.onError?.(`Erro ${xhr.status}: ${xhr.statusText}`);
            reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          setUploading(false);
          setProgress(0);
          options.onError?.('Erro de rede');
          reject(new Error('Erro de rede'));
        });

        xhr.open('POST', options.url);
        xhr.send(formData);
      });

    } catch (error) {
      setUploading(false);
      setProgress(0);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  return {
    uploading,
    progress,
    upload,
  };
}
