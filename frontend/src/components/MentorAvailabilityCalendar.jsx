import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import addDays from 'date-fns/addDays';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
import './MentorAvailabilityCalendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { API_URL } from '../services/api.js';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const dayIndexToKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

function timeToHM(date) {
  const h = date.getHours().toString().padStart(2,'0');
  const m = date.getMinutes().toString().padStart(2,'0');
  return `${h}:${m}`;
}

export default function MentorAvailabilityCalendar({ availability, setAvailability, token }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' ? window.innerWidth < 720 : false);
  const [popoverEvent, setPopoverEvent] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverEvent(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [viewDate, setViewDate] = useState(new Date());

  const events = useMemo(() => {
    if (!availability || !availability.weeklySchedule) return [];

    const evts = [];
    const daysToGenerate = isMobileView ? 14 : 60; // Generate roughly 2 months of preview
    
    // Calculate start of current viewed week/month to generate around
    const start = startOfWeek(viewDate, { weekStartsOn: 1 });
    const startDate = addDays(start, -14); // Start 2 weeks before current view
    
    for (let i = 0; i < daysToGenerate; i++) {
      const date = addDays(startDate, i);
      const dayKey = dayIndexToKey[date.getDay()];
      const dayCfg = availability.weeklySchedule[dayKey];
      
      if (dayCfg && dayCfg.enabled && dayCfg.slots) {
        dayCfg.slots.forEach((slot, idx) => {
          const [sh, sm] = slot.start.split(':').map(Number);
          const [eh, em] = slot.end.split(':').map(Number);
          
          const startDateTime = setMinutes(setHours(new Date(date), sh), sm);
          const endDateTime = setMinutes(setHours(new Date(date), eh), em);
          
          evts.push({
            id: `${date.toISOString()}-${dayKey}-${idx}`,
            title: slot.label || 'Available',
            start: startDateTime,
            end: endDateTime,
            dayKey,
            slot,
            isRepeating: true // purely for internal reference if needed
          });
        });
      }
    }
    return evts;
  }, [availability, viewDate, isMobileView]);

  const handleSelectSlot = ({ start, end }) => {
    const weekday = start.getDay(); 
    const dayKey = dayIndexToKey[weekday];
    const startHM = timeToHM(start);
    const endHM = timeToHM(end);

    if (isMobileView) {
      setSelectedDate(start);
      setShowDayModal(true);
      const temp = { ...availability };
      if (!temp.weeklySchedule) temp.weeklySchedule = {};
      if (!temp.weeklySchedule[dayKey]) temp.weeklySchedule[dayKey] = { enabled: true, slots: [] };
      temp._prefill = { start: startHM, end: endHM };
      setAvailability(temp);
      return;
    }

    const newAvailability = { ...availability };
    if (!newAvailability.weeklySchedule) newAvailability.weeklySchedule = {};
    if (!newAvailability.weeklySchedule[dayKey]) newAvailability.weeklySchedule[dayKey] = { enabled: true, slots: [] };
    newAvailability.weeklySchedule[dayKey].enabled = true;
    newAvailability.weeklySchedule[dayKey].slots = newAvailability.weeklySchedule[dayKey].slots || [];
    
    const isDuplicate = newAvailability.weeklySchedule[dayKey].slots.some(s => s.start === startHM && s.end === endHM);
    if (isDuplicate) return;

    newAvailability.weeklySchedule[dayKey].slots.push({ start: startHM, end: endHM, label: 'Available' });
    setAvailability(newAvailability);
  };

  const handleSelectEvent = (event, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverEvent({ 
      ...event, 
      position: { 
        top: rect.top + window.scrollY - 10, 
        left: rect.left + rect.width / 2 
      } 
    });
  };

  const removeEvent = (event) => {
    const { dayKey, slot } = event;
    const newAvailability = { ...availability };
    const slots = (newAvailability.weeklySchedule?.[dayKey]?.slots || []).filter(s => !(s.start === slot.start && s.end === slot.end));
    if (newAvailability.weeklySchedule && newAvailability.weeklySchedule[dayKey]) {
      newAvailability.weeklySchedule[dayKey].slots = slots;
      if (slots.length === 0) newAvailability.weeklySchedule[dayKey].enabled = false;
    }
    setAvailability(newAvailability);
    setPopoverEvent(null);
  };

  const openDayEditor = (date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const closeDayEditor = () => {
    if (availability && availability._prefill) {
      const a = { ...availability };
      delete a._prefill;
      setAvailability(a);
    }
    setShowDayModal(false);
    setSelectedDate(null);
  };

  const saveDaySlots = async (slots) => {
    const dayKey = dayIndexToKey[(selectedDate || new Date()).getDay()];
    const newAvailability = { ...availability };
    if (!newAvailability.weeklySchedule) newAvailability.weeklySchedule = {};
    newAvailability.weeklySchedule[dayKey] = { enabled: slots.length > 0, slots };
    setAvailability(newAvailability);
    closeDayEditor();
  };

  const handleNavigate = (newDate) => {
    setViewDate(newDate);
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <div>
          <h3>Weekly Schedule</h3>
          <p className="calendar-info">
            {isMobileView ? 'Tap a day to manage slots' : 'Click and drag to add availability'}
          </p>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        date={viewDate}
        onNavigate={handleNavigate}
        defaultView={isMobileView ? 'day' : 'week'}
        views={{ week: true, day: true, month: true }}
        step={30}
        timeslots={1}
        style={{ height: isMobileView ? 520 : 500 }}
        onDrillDown={(date, view) => {
          if (isMobileView || view === 'month') openDayEditor(date);
        }}
        messages={{
          allDay: 'All Day',
          previous: 'Back',
          next: 'Next',
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
      />

      {popoverEvent && (
        <div 
          className="event-popover-overlay"
          ref={popoverRef}
          style={{ 
            top: popoverEvent.position.top, 
            left: popoverEvent.position.left,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="event-popover-header">
            <p className="event-popover-title">{popoverEvent.title}</p>
            <button className="modal-close-btn" onClick={() => setPopoverEvent(null)} style={{ width: 24, height: 24, fontSize: 14 }}>✕</button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>
            {format(popoverEvent.start, 'p')} - {format(popoverEvent.end, 'p')}
          </p>
          <button className="delete-event-btn" onClick={() => removeEvent(popoverEvent)}>
            Remove Slot
          </button>
        </div>
      )}

      {showDayModal && selectedDate && (
        <DayEditorModal
          date={selectedDate}
          availability={availability}
          prefill={availability?._prefill}
          onClose={closeDayEditor}
          onSave={saveDaySlots}
        />
      )}
    </div>
  );
}

function DayEditorModal({ date, availability, prefill, onClose, onSave }) {
  const dayKey = dayIndexToKey[date.getDay()];
  const existing = availability?.weeklySchedule?.[dayKey]?.slots || [];
  const [slots, setSlots] = useState(() => {
    if (prefill) {
      const isDuplicate = existing.some(s => s.start === prefill.start && s.end === prefill.end);
      if (!isDuplicate) return [...existing, { start: prefill.start, end: prefill.end }];
    }
    return [...existing];
  });

  const updateSlot = (idx, field, value) => {
    const s = [...slots];
    s[idx] = { ...s[idx], [field]: value };
    setSlots(s);
  };

  const removeSlot = (idx) => {
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const addSlot = () => {
    setSlots([...slots, { start: '09:00', end: '10:00' }]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Edit {format(date, 'EEEE')}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="slots-list">
          {slots.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#a0aec0' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⏰</span>
              <p>No availability slots for this day.</p>
            </div>
          )}
          {slots.map((slot, idx) => (
            <div key={idx} className="slot-item">
              <div className="slot-time-group">
                <input 
                  type="time" 
                  value={slot.start} 
                  onChange={e => updateSlot(idx, 'start', e.target.value)} 
                />
                <span className="slot-to">to</span>
                <input 
                  type="time" 
                  value={slot.end} 
                  onChange={e => updateSlot(idx, 'end', e.target.value)} 
                />
              </div>
              <button className="remove-slot-btn" onClick={() => removeSlot(idx)}>✕</button>
            </div>
          ))}
        </div>

        <button className="add-slot-btn" onClick={addSlot}>
          <span>+</span> Add Time Slot
        </button>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={() => onSave(slots)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

 
