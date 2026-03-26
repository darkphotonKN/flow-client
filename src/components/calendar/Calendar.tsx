"use client";

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ChecklistItem } from '@/services/api';

interface CalendarProps {
  planId: string;
  className?: string;
  compact?: boolean;
}

export function Calendar({ planId, className = '', compact = false }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduledItems, setScheduledItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingItems();
  }, [planId]);

  const fetchUpcomingItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/plans/${planId}/checklists/upcoming`
      );

      if (response.ok) {
        const data = await response.json();
        setScheduledItems(data.result || []);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming items:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const getItemsForDay = (day: Date) => {
    return scheduledItems.filter(item => {
      if (!item.scheduledTime) return false;
      const itemDate = new Date(item.scheduledTime);
      return isSameDay(itemDate, day);
    });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (compact) {
    return (
      <div className={`bg-white/5 backdrop-blur-sm rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={handlePreviousMonth}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day[0]}
            </div>
          ))}

          {days.map((day, idx) => {
            const dayItems = getItemsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded text-xs relative
                  ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}
                  ${isToday ? 'bg-amber-500/20 text-amber-400 font-bold ring-1 ring-amber-500/50' : ''}
                  ${dayItems.length > 0 && !isToday ? 'bg-white/10' : ''}
                `}
              >
                <span>{format(day, 'd')}</span>
                {dayItems.length > 0 && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {dayItems.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-amber-400 rounded-full" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Loading scheduled items...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dayItems = getItemsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={`
                min-h-[80px] p-2 rounded-lg border transition-colors
                ${isCurrentMonth ? 'border-white/10 bg-white/5' : 'border-transparent opacity-50'}
                ${isToday ? 'ring-2 ring-amber-500/50 bg-amber-500/10' : ''}
                ${dayItems.length > 0 ? 'hover:bg-white/10' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${isToday ? 'text-amber-400' : ''}`}>
                  {format(day, 'd')}
                </span>
                {dayItems.length > 0 && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                    {dayItems.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="text-xs p-1 bg-white/5 rounded truncate"
                    title={item.description}
                  >
                    {item.description}
                  </div>
                ))}
                {dayItems.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayItems.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Loading scheduled items...
        </div>
      )}
    </div>
  );
}