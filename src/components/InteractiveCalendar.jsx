import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { formatLocalYMD } from '../utils/storage';

const parseLocalYMD = (str) => {
  if (!str) return new Date();
  if (typeof str === 'string' && str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
};

export default function InteractiveCalendar({ selectedDate, onSelectDate, paydayDay = null }) {
  const [viewDate, setViewDate] = useState(() => parseLocalYMD(selectedDate));

  useEffect(() => {
    if (selectedDate) {
      setViewDate(parseLocalYMD(selectedDate));
    }
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const todayStr = formatLocalYMD(new Date());

  const calendarCells = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateStr: null
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const monthFormatted = String(month + 1).padStart(2, '0');
    const dayFormatted = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
    calendarCells.push({
      day,
      isCurrentMonth: true,
      dateStr
    });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      dateStr: null
    });
  }

  const handleSelectQuick = (str, day) => {
    if (onSelectDate) {
      onSelectDate(str, day);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      width: '100%',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Calendar Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <button 
          type="button"
          onClick={handlePrevMonth}
          className="btn btn-secondary btn-sm"
          style={{ width: '26px', height: '26px', padding: 0 }}
        >
          <ChevronLeft size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarIcon size={14} color="var(--text-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </span>
        </div>

        <button 
          type="button"
          onClick={handleNextMonth}
          className="btn btn-secondary btn-sm"
          style={{ width: '26px', height: '26px', padding: 0 }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekday Labels Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        textAlign: 'center',
        marginBottom: '4px'
      }}>
        {dayNames.map((d, index) => (
          <span key={d} style={{
            fontSize: '10px',
            fontWeight: 700,
            color: index === 0 ? 'var(--notion-red-text)' : 'var(--text-tertiary)',
            textTransform: 'uppercase'
          }}>
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px'
      }}>
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div 
                key={idx} 
                style={{
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  opacity: 0.3
                }}
              >
                {cell.day}
              </div>
            );
          }

          // Accurate selection checking:
          // 1. If selectedDate is provided (e.g. '2026-08-21'), match dateStr exactly
          // 2. If paydayDay is provided (e.g. 15), match day number
          const isSelected = selectedDate 
            ? cell.dateStr === selectedDate 
            : (paydayDay !== null && paydayDay !== undefined ? cell.day === Number(paydayDay) : false);

          const isToday = cell.dateStr === todayStr;

          let bg = 'transparent';
          let textColor = 'var(--text-primary)';
          let borderStyle = 'none';

          if (isSelected) {
            bg = 'var(--text-primary)';
            textColor = 'var(--bg-app)';
          } else if (isToday) {
            bg = 'var(--bg-card-subtle)';
            textColor = 'var(--ios-blue)';
            borderStyle = '1.5px solid var(--ios-blue)';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectQuick(cell.dateStr, cell.day)}
              style={{
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                border: borderStyle,
                background: bg,
                color: textColor,
                fontSize: '12px',
                fontWeight: isSelected ? 700 : (isToday ? 700 : 500),
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
