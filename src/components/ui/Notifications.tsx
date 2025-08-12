"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TIPOS =====
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// ===== CONTEXT =====
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// ===== PROVIDER =====
interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  position = 'top-right',
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    // Auto-remove se duration for especificado
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  }, [maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      <NotificationContainer position={position} />
    </NotificationContext.Provider>
  );
}

// ===== CONTAINER =====
interface NotificationContainerProps {
  position: string;
}

function NotificationContainer({ position }: NotificationContainerProps) {
  const { notifications, removeNotification, clearAll } = useNotifications();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  if (notifications.length === 0) return null;

  return (
    <div className={cn(
      'fixed z-50 space-y-2 max-w-sm w-full',
      positionClasses[position as keyof typeof positionClasses]
    )}>
      {/* Header com botão de limpar tudo */}
      {notifications.length > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {notifications.length} notificação{notifications.length > 1 ? 'es' : ''}
            </span>
          </div>
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Limpar todas
          </button>
        </div>
      )}

      {/* Notificações */}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}

// ===== ITEM =====
interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colorMap = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      message: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      message: 'text-blue-700',
    },
  };

  const colors = colorMap[notification.type];
  const Icon = iconMap[notification.type];

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-lg border p-4 transition-all duration-300 transform',
        colors.border,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isRemoving ? 'translate-x-full opacity-0' : '',
        'hover:shadow-xl'
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', colors.icon)} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={cn('text-sm font-medium', colors.title)}>
              {notification.title}
            </h4>
            <button
              onClick={handleRemove}
              className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {notification.message && (
            <p className={cn('text-sm mt-1', colors.message)}>
              {notification.message}
            </p>
          )}
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={cn(
                'text-sm font-medium mt-2 hover:underline transition-colors',
                colors.title
              )}
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== HOOKS CONVENIÊNCIA =====
export function useNotificationHelpers() {
  const { addNotification } = useNotifications();

  const success = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const error = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const info = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  return {
    success,
    error,
    warning,
    info,
  };
}

// ===== COMPONENTE DE EXEMPLO =====
export function NotificationExample() {
  const { success, error, warning, info } = useNotificationHelpers();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Testar Notificações</h3>
      <div className="flex space-x-2">
        <button
          onClick={() => success('Sucesso!', 'Operação realizada com sucesso.')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Sucesso
        </button>
        <button
          onClick={() => error('Erro!', 'Algo deu errado.')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Erro
        </button>
        <button
          onClick={() => warning('Atenção!', 'Verifique os dados informados.')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Aviso
        </button>
        <button
          onClick={() => info('Informação', 'Aqui está uma informação importante.')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Info
        </button>
      </div>
    </div>
  );
}
