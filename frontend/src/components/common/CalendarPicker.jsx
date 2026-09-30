import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarPicker.css';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function toDate(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a, b) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function CalendarPicker({
  value = '',
  onChange,
  placeholder = 'Select a date',
  minDate,
  maxDate,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selected = toDate(value);
  const min = toDate(minDate);
  const max = toDate(maxDate);

  const [viewYear, setViewYear] = useState(() => selected?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selected?.getMonth() ?? new Date().getMonth());

  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onDocMouseDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function onDocKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDocMouseDown);
      document.addEventListener('keydown', onDocKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [open]);

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startOffset = first.getDay();
    const numDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let d = 1; d <= numDays; d += 1) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDisabled = (day) => {
    if (min && day < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
    if (max && day > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
    return false;
  };

  const display =
    selected &&
    selected.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`cp-wrap ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`cp-trigger ${display ? 'cp-trigger--has-value' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Calendar size={16} className="cp-trigger__icon" />
        <span className="cp-trigger__text">{display || placeholder}</span>
      </button>

      {open && (
        <div className="cp-panel" role="dialog" aria-label="Date picker">
          <div className="cp-header">
            <button
              type="button"
              className="cp-nav"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="cp-title">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              className="cp-nav"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cp-grid cp-grid--weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className="cp-weekday">
                {w}
              </span>
            ))}
          </div>

          <div className="cp-grid">
            {days.map((day, i) => {
              if (!day) return <span key={`empty-${i}`} />;
              const disabled = isDisabled(day);
              const isSelected = sameDay(day, selected);
              const isToday = sameDay(day, new Date());
              const classes = ['cp-day'];
              if (isSelected) classes.push('cp-day--selected');
              if (isToday && !isSelected) classes.push('cp-day--today');
              if (disabled) classes.push('cp-day--disabled');
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={classes.join(' ')}
                  disabled={disabled}
                  onClick={() => {
                    onChange(toISO(day));
                    setOpen(false);
                  }}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPicker;
