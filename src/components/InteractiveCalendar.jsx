import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function InteractiveCalendar({ selectedDate, onSelectDate, paydayDay = 1 }) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewDate, setViewDate] = useState(initialDate);

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

  const todayStr = new Date().toISOString().substring(0, 10);

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

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      width: '100%',
      boxShadow: 'var(--shadow-ios)'
    }}>
      {/* Calendar Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button 
          type="button"
          onClick={handlePrevMonth}
          className="btn btn-secondary btn-sm"
          style={{ width: '32px', height: '32px', padding: 0 }}
        >
          <ChevronLeft size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarIcon size={16} color="var(--ios-blue)" />
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </span>
        </div>

        <button 
          type="button"
          onClick={handleNextMonth}
          className="btn btn-secondary btn-sm"
          style={{ width: '32px', height: '32px', padding: 0 }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday Labels Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        {dayNames.map((d, index) => (
          <span key={d} style={{
            fontSize: '11px',
            fontWeight: 800,
            color: index === 0 ? 'var(--ios-red)' : 'var(--text-tertiary)',
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
        gap: '4px'
      }}>
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div 
                key={idx} 
                style={{
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  opacity: 0.35
                }}
              >
                {cell.day}
              </div>
            );
          }

          const isPaydaySelected = cell.day === paydayDay;
          const isToday = cell.dateStr === todayStr;

          let bg = 'transparent';
          let textColor = 'var(--text-primary)';
          let borderStyle = 'none';
          let shadowStyle = 'none';

          if (isPaydaySelected) {
            bg = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            textColor = '#ffffff';
            shadowStyle = '0 4px 12px rgba(37, 99, 235, 0.4)';
          } else if (isToday) {
            bg = 'var(--ios-blue-bg)';
            textColor = 'var(--ios-blue)';
            borderStyle = '1.5px solid var(--ios-blue)';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(cell.dateStr, cell.day)}
              style={{
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                border: borderStyle,
                background: bg,
                color: textColor,
                fontSize: '13px',
                fontWeight: isPaydaySelected || isToday ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: shadowStyle
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
        Tap any date to select Allowance Credit Day ({paydayDay}{paydayDay === 1 ? 'st' : paydayDay === 2 ? 'nd' : paydayDay === 3 ? 'rd' : 'th'} of month)
      </div>
    </div>
  );
}
