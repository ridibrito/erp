"use client";
import { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, User, Tag } from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string;
  category: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  location?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Mock data
  useEffect(() => {
    setTasks([
      {
        id: '1',
        title: 'Reunião com cliente',
        description: 'Apresentar proposta comercial',
        due_date: '2024-01-15T10:00:00',
        priority: 'high',
        status: 'pending',
        assigned_to: 'João Silva',
        category: 'Vendas'
      },
      {
        id: '2',
        title: 'Relatório mensal',
        description: 'Preparar relatório financeiro',
        due_date: '2024-01-20T17:00:00',
        priority: 'medium',
        status: 'in_progress',
        assigned_to: 'Maria Santos',
        category: 'Financeiro'
      },
      {
        id: '3',
        title: 'Backup do sistema',
        description: 'Executar backup automático',
        due_date: '2024-01-18T23:00:00',
        priority: 'low',
        status: 'completed',
        assigned_to: 'Carlos Tech',
        category: 'TI'
      }
    ]);

    setEvents([
      {
        id: '1',
        title: 'Reunião de Equipe',
        description: 'Discussão sobre projetos em andamento',
        start_time: '2024-01-15T09:00:00',
        end_time: '2024-01-15T10:00:00',
        attendees: ['João Silva', 'Maria Santos', 'Carlos Tech'],
        location: 'Sala de Reuniões'
      },
      {
        id: '2',
        title: 'Apresentação Cliente',
        description: 'Demonstração do produto',
        start_time: '2024-01-16T14:00:00',
        end_time: '2024-01-16T15:30:00',
        attendees: ['João Silva', 'Cliente ABC'],
        location: 'Online'
      }
    ]);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty days for previous month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <ProtectedLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600">Gerencie suas tarefas e eventos</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === v 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-lg font-semibold text-gray-900 capitalize">
              {monthName}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add Event Button */}
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isToday = day?.toDateString() === new Date().toDateString();
            const isSelected = day?.toDateString() === selectedDate.toDateString();
            const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();
            
            const dayTasks = day ? getTasksForDate(day) : [];
            const dayEvents = day ? getEventsForDate(day) : [];

            return (
              <div
                key={index}
                onClick={() => day && setSelectedDate(day)}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 cursor-pointer transition-colors ${
                  isToday ? 'bg-blue-50' : ''
                } ${isSelected ? 'bg-blue-100' : ''} ${
                  !isCurrentMonth ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600' : 
                      !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Tasks */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${getPriorityColor(task.priority)}`}
                          title={task.title}
                        >
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayTasks.length - 2} mais
                        </div>
                      )}
                    </div>

                    {/* Events */}
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 1).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 bg-purple-100 text-purple-800 rounded truncate"
                          title={event.title}
                        >
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {formatDate(selectedDate)}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Tarefas
              </h4>
              <div className="space-y-3">
                {getTasksForDate(selectedDate).map(task => (
                  <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                          <span className="text-xs text-gray-500">{task.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{task.assigned_to}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {getTasksForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhuma tarefa para esta data</p>
                )}
              </div>
            </div>

            {/* Events */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Eventos
              </h4>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{event.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(event.start_time).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(event.end_time).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          {event.location && (
                            <span className="text-sm text-gray-500">{event.location}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Participantes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.attendees.map((attendee, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {attendee}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhum evento para esta data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedLayout>
  );
}
