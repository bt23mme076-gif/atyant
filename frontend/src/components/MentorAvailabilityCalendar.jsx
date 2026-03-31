import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import addDays from 'date-fns/addDays';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
import isEqual from 'date-fns/isEqual';
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

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []); // Monday

  const events = useMemo(() => {
    if (!availability || !availability.weeklySchedule) return [];

    const evts = [];
    Object.keys(availability.weeklySchedule).forEach((dayKey) => {
      const dayCfg = availability.weeklySchedule[dayKey];
      if (!dayCfg || !dayCfg.enabled) return;
      const dayIndex = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].indexOf(dayKey);
      if (dayIndex === -1) return;
      const date = addDays(weekStart, dayIndex);
      (dayCfg.slots || []).forEach((slot, idx) => {
        const [sh, sm] = slot.start.split(':').map(Number);
        const [eh, em] = slot.end.split(':').map(Number);
        const start = setMinutes(setHours(new Date(date), sh), sm);
        const end = setMinutes(setHours(new Date(date), eh), em);
        evts.push({
          id: `${dayKey}-${idx}-${slot.start}-${slot.end}`,
          title: 'Available',
          start,
          end,
          dayKey,
          slot
        });
      });
    });
    return evts;
  }, [availability, weekStart]);

  const persistAvailability = async (newAvailability) => {
    setAvailability(newAvailability);
    try {
      await fetch(`${API_URL}/api/monetization/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAvailability)
      });
    } catch (err) {
      console.error('Failed to save availability', err);
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    // On mobile open the day editor modal; on desktop keep existing quick-add behavior
    const weekday = start.getDay(); // 0=Sun
    const dayKey = dayIndexToKey[weekday];
    const startHM = timeToHM(start);
    const endHM = timeToHM(end);

    if (isMobileView) {
      // open modal and prefill a slot candidate
      setSelectedDate(start);
      setShowDayModal(true);
      // store a temporary prefill on availability object so modal can pick it up
      const temp = { ...availability };
      if (!temp.weeklySchedule) temp.weeklySchedule = {};
      if (!temp.weeklySchedule[dayKey]) temp.weeklySchedule[dayKey] = { enabled: true, slots: [] };
      temp._prefill = { start: startHM, end: endHM };
      setAvailability(temp);
      return;
    }

    const title = window.prompt('Add availability slot (optional label)', 'Available');

    const newAvailability = { ...availability };
    if (!newAvailability.weeklySchedule) newAvailability.weeklySchedule = {};
    if (!newAvailability.weeklySchedule[dayKey]) newAvailability.weeklySchedule[dayKey] = { enabled: true, slots: [] };
    newAvailability.weeklySchedule[dayKey].enabled = true;
    newAvailability.weeklySchedule[dayKey].slots = newAvailability.weeklySchedule[dayKey].slots || [];
    newAvailability.weeklySchedule[dayKey].slots.push({ start: startHM, end: endHM, label: title || 'Available' });

    persistAvailability(newAvailability);
  };

  const handleSelectEvent = (event) => {
    if (!confirm('Remove this availability slot?')) return;
    const { dayKey, slot } = event;
    const newAvailability = { ...availability };
    const slots = (newAvailability.weeklySchedule?.[dayKey]?.slots || []).filter(s => !(s.start === slot.start && s.end === slot.end));
    if (newAvailability.weeklySchedule && newAvailability.weeklySchedule[dayKey]) {
      newAvailability.weeklySchedule[dayKey].slots = slots;
      if (slots.length === 0) newAvailability.weeklySchedule[dayKey].enabled = false;
    }
    persistAvailability(newAvailability);
  };

  const dateToDayKey = (date) => {
    // map JS getDay() 0..6 -> sunday..saturday
    return dayIndexToKey[date.getDay()];
  };

  // Day modal: edit a single day's slots on mobile or when user requests
  const openDayEditor = (date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const closeDayEditor = () => {
    // remove any prefill temp
    if (availability && availability._prefill) {
      const a = { ...availability };
      delete a._prefill;
      setAvailability(a);
    }
    setShowDayModal(false);
    setSelectedDate(null);
  };

  const saveDaySlots = async (slots) => {
    const dayKey = dateToDayKey(selectedDate || new Date());
    const newAvailability = { ...availability };
    if (!newAvailability.weeklySchedule) newAvailability.weeklySchedule = {};
    newAvailability.weeklySchedule[dayKey] = { enabled: slots.length > 0, slots };
    await persistAvailability(newAvailability);
    closeDayEditor();
  };

  return (
    <div style={{ marginTop: 12 }}>
      <h4 style={{ marginBottom: 8 }}>Calendar View (tap a day to edit on mobile)</h4>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        defaultView={isMobileView ? 'day' : 'week'}
        views={{ week: true, day: true, month: true }}
        step={30}
        timeslots={1}
        style={{ height: isMobileView ? 520 : 450 }}
        onDrillDown={(date, view) => {
          // when user taps a day in month view, open editor
          if (isMobileView || view === 'month') openDayEditor(date);
        }}
        onNavigate={() => { /* noop - keep calendar responsive */ }}
      />

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
  const dayIndex = date.getDay();
  const dayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][dayIndex];
  const existing = availability?.weeklySchedule?.[dayKey]?.slots || [];
  const [slots, setSlots] = useState(() => {
    if (prefill) return [...existing, { start: prefill.start, end: prefill.end }];
    return [...existing];
  });

  useEffect(() => {
    // if availability changes externally, update slots list
    setSlots(existing.slice());
  }, [availability]);

  const updateSlot = (idx, field, value) => {
    const s = slots.slice(); s[idx] = { ...s[idx], [field]: value }; setSlots(s);
  };
  const removeSlot = (idx) => { setSlots(slots.filter((_,i) => i !== idx)); };
  const addSlot = () => { setSlots([...slots, { start: '09:00', end: '10:00' }]); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ width: '92%', maxWidth: 520, background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Edit Availability — {date.toDateString()}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20 }}>✕</button>
        </div>

        <div>
          {slots.length === 0 && <p style={{ color: '#666' }}>No slots yet. Add one below.</p>}
          {slots.map((slot, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input type="time" value={slot.start} onChange={e => updateSlot(idx, 'start', e.target.value)} />
              <span>to</span>
              <input type="time" value={slot.end} onChange={e => updateSlot(idx, 'end', e.target.value)} />
              <button onClick={() => removeSlot(idx)} style={{ marginLeft: 'auto' }}>Remove</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button onClick={addSlot}>+ Add Time Slot</button>
          <div>
            <button onClick={onClose} style={{ marginRight: 8 }}>Cancel</button>
            <button onClick={() => onSave(slots)}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
