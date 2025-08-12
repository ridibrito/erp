import { useState, useCallback } from 'react';
import { VCalendarEvent, CalEvent } from '@/types/database';

interface CalendarFilters {
  from: string;
  to: string;
  calendar_id?: string;
}

interface CreateEventData {
  calendar_id: string;
  title: string;
  description?: string;
  location?: string;
  all_day: boolean;
  starts_at: string;
  ends_at: string;
  attendees?: Array<{
    user_id?: string;
    contact_id?: string;
    email?: string;
    role?: 'required' | 'optional';
  }>;
}

interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export function useCalendar() {
  const [events, setEvents] = useState<VCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar eventos
  const fetchEvents = useCallback(async (filters: CalendarFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        ...(filters.calendar_id && { calendar_id: filters.calendar_id })
      });

      const response = await fetch(`/api/calendar?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar eventos');
      }

      setEvents(data.data || []);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error fetching events:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar evento
  const createEvent = useCallback(async (eventData: CreateEventData): Promise<CalEvent | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar evento');
      }

      // Atualizar lista de eventos
      const newEvent = data.data;
      setEvents(prev => [...prev, newEvent]);

      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error creating event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar evento
  const updateEvent = useCallback(async (eventData: UpdateEventData): Promise<CalEvent | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/calendar/${eventData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar evento');
      }

      // Atualizar lista de eventos
      const updatedEvent = data.data;
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));

      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error updating event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar evento
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar evento');
      }

      // Remover evento da lista
      setEvents(prev => prev.filter(event => event.id !== eventId));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error deleting event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar data de vencimento de tarefa (para eventos task_due)
  const updateTaskDueDate = useCallback(async (taskId: string, dueDate: string | null): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ due_date: dueDate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar data de vencimento');
      }

      // O trigger do banco vai atualizar automaticamente o evento
      // Aqui podemos recarregar os eventos se necessário
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error updating task due date:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Buscar eventos por período
  const fetchEventsByPeriod = useCallback((start: Date, end: Date, calendarId?: string) => {
    return fetchEvents({
      from: start.toISOString(),
      to: end.toISOString(),
      calendar_id: calendarId,
    });
  }, [fetchEvents]);

  // Buscar eventos do mês atual
  const fetchCurrentMonthEvents = useCallback((calendarId?: string) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return fetchEventsByPeriod(start, end, calendarId);
  }, [fetchEventsByPeriod]);

  // Buscar eventos da semana atual
  const fetchCurrentWeekEvents = useCallback((calendarId?: string) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return fetchEventsByPeriod(start, end, calendarId);
  }, [fetchEventsByPeriod]);

  // Buscar eventos do dia atual
  const fetchCurrentDayEvents = useCallback((calendarId?: string) => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    
    return fetchEventsByPeriod(start, end, calendarId);
  }, [fetchEventsByPeriod]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateTaskDueDate,
    clearError,
    fetchEventsByPeriod,
    fetchCurrentMonthEvents,
    fetchCurrentWeekEvents,
    fetchCurrentDayEvents,
  };
}
