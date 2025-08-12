"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { VCalendarEvent } from '@/types/database';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<VCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<VCalendarEvent | null>(null);

  // Função para buscar eventos
  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar?from=${start.toISOString()}&to=${end.toISOString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular datas de início e fim baseado no modo de visualização
  const getDateRange = useCallback((date: Date, mode: ViewMode) => {
    const start = new Date(date);
    const end = new Date(date);

    switch (mode) {
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }, []);

  // Buscar eventos quando mudar data ou modo
  useEffect(() => {
    const { start, end } = getDateRange(currentDate, viewMode);
    fetchEvents(start, end);
  }, [currentDate, viewMode, fetchEvents, getDateRange]);

  // Navegação
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formatação de data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: viewMode === 'month' ? 'long' : 'short',
      day: 'numeric'
    });
  };

  // Renderizar visualização mensal
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    while (currentDay <= lastDay || currentDay.getDay() !== 0) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}

        {/* Dias do mês */}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = events.filter(event => {
            const eventDate = new Date(event.starts_at);
            return eventDate.toDateString() === day.toDateString();
          });

          return (
            <div
              key={index}
              className={`min-h-[120px] bg-white p-2 ${
                !isCurrentMonth ? 'text-gray-400' : ''
              } ${isToday ? 'bg-blue-50' : ''}`}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              
              {/* Eventos do dia */}
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`text-xs p-1 rounded cursor-pointer truncate ${
                      event.kind === 'task_due' 
                        ? 'bg-orange-100 text-orange-800 border-l-2 border-orange-500'
                        : 'bg-blue-100 text-blue-800 border-l-2 border-blue-500'
                    }`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar visualização semanal
  const renderWeekView = () => {
    const { start } = getDateRange(currentDate, 'week');
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = events.filter(event => {
            const eventDate = new Date(event.starts_at);
            return eventDate.toDateString() === day.toDateString();
          });

          return (
            <div
              key={index}
              className={`min-h-[400px] bg-white p-2 ${
                isToday ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                {day.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
              </div>
              
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`text-xs p-2 rounded cursor-pointer ${
                      event.kind === 'task_due' 
                        ? 'bg-orange-100 text-orange-800 border-l-2 border-orange-500'
                        : 'bg-blue-100 text-blue-800 border-l-2 border-blue-500'
                    }`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {!event.all_day && (
                      <div className="text-xs opacity-75">
                        {new Date(event.starts_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar visualização diária
  const renderDayView = () => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.starts_at);
      return eventDate.toDateString() === currentDate.toDateString();
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-2">
        {hours.map(hour => {
          const hourEvents = dayEvents.filter(event => {
            const eventHour = new Date(event.starts_at).getHours();
            return eventHour === hour;
          });

          return (
            <div key={hour} className="flex border-b border-gray-200">
              <div className="w-16 p-2 text-sm text-gray-500 border-r border-gray-200">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 p-2 min-h-[60px]">
                {hourEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`text-sm p-2 rounded cursor-pointer mb-1 ${
                      event.kind === 'task_due' 
                        ? 'bg-orange-100 text-orange-800 border-l-2 border-orange-500'
                        : 'bg-blue-100 text-blue-800 border-l-2 border-blue-500'
                    }`}
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.description && (
                      <div className="text-xs opacity-75 truncate">{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
            <p className="text-muted-foreground">Gerencie seus eventos e tarefas</p>
          </div>
          
          <button className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </button>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevious}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hoje
              </button>
              
              <button
                onClick={goToNext}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="text-lg font-semibold">
              {formatDate(currentDate)}
            </h2>
          </div>

          {/* Modos de visualização */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'month' && 'Mês'}
                {mode === 'week' && 'Semana'}
                {mode === 'day' && 'Dia'}
              </button>
            ))}
          </div>
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-xl border border-border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando eventos...</p>
            </div>
          ) : (
            <div className="p-4">
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
            </div>
          )}
        </div>

        {/* Modal de detalhes do evento */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {selectedEvent.description && (
                  <p className="text-gray-600">{selectedEvent.description}</p>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {new Date(selectedEvent.starts_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {!selectedEvent.all_day && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(selectedEvent.starts_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(selectedEvent.ends_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.kind === 'task_due' && selectedEvent.task_status && (
                  <div className="flex items-center space-x-2 text-sm">
                    {selectedEvent.task_status === 'done' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="capitalize">{selectedEvent.task_status}</span>
                  </div>
                )}

                {selectedEvent.calendar_name && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedEvent.calendar_color }}
                    ></div>
                    <span>{selectedEvent.calendar_name}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-6">
                <button className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Editar
                </button>
                <button className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
