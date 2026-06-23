import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../services/api';
import './EventsAdmin.css';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const CATEGORY_OPTIONS = ['hackathon', 'webinar', 'workshop', 'competition', 'community'];
const MODE_OPTIONS     = ['Online', 'Offline', 'Hybrid'];
const STATUS_OPTIONS   = ['active', 'draft', 'closed'];
const APP_STATUS_MAP   = {
  pending:      { label: 'Pending',      color: '#d97706' },
  under_review: { label: 'Under Review', color: '#2563eb' },
  approved:     { label: 'Approved',     color: '#16a34a' },
  rejected:     { label: 'Rejected',     color: '#dc2626' },
};

const EMPTY_EVENT = {
  id: '', title: '', category: 'hackathon', dateRange: '',
  mode: 'Online', location: '', description: '', tags: '',
  isFree: true, prize: '', spotsTotal: 200, registrationDeadline: '',
  featured: false, status: 'active',
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* ── EventFormModal ───────────────────────────────────────────────────────── */
function EventFormModal({ initial, onClose, onSave }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(initial ? {
    ...initial,
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags || '',
  } : { ...EMPTY_EVENT });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTitleChange = (v) => {
    set('title', v);
    if (!isEdit) set('id', slugify(v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        spotsTotal: Number(form.spotsTotal),
        isFree: form.isFree === true || form.isFree === 'true',
        featured: form.featured === true || form.featured === 'true',
      };
      const url    = isEdit ? `${API_URL}/api/events/admin/events/${initial.id}` : `${API_URL}/api/events/admin/events`;
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed.');
      onSave(data.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ea-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ea-modal">
        <div className="ea-modal__head">
          <h2>{isEdit ? 'Edit Event' : 'Add New Event'}</h2>
          <button className="ea-modal__close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="ea-form">
          <div className="ea-form__row ea-form__row--2">
            <div className="ea-form__field">
              <label>Event Title *</label>
              <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} required placeholder="e.g. AI Hackathon 2026" />
            </div>
            <div className="ea-form__field">
              <label>URL Slug / ID *</label>
              <input type="text" value={form.id} onChange={e => set('id', e.target.value)} required placeholder="ai-hackathon-2026" disabled={isEdit} />
            </div>
          </div>

          <div className="ea-form__row ea-form__row--3">
            <div className="ea-form__field">
              <label>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="ea-form__field">
              <label>Mode</label>
              <select value={form.mode} onChange={e => set('mode', e.target.value)}>
                {MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="ea-form__field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="ea-form__row ea-form__row--2">
            <div className="ea-form__field">
              <label>Date Range *</label>
              <input type="text" value={form.dateRange} onChange={e => set('dateRange', e.target.value)} required placeholder="15–17 Aug 2026" />
            </div>
            <div className="ea-form__field">
              <label>Registration Deadline</label>
              <input type="text" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} placeholder="2026-08-10T23:59:59" />
            </div>
          </div>

          <div className="ea-form__row ea-form__row--2">
            <div className="ea-form__field">
              <label>Location / Venue</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="VNIT Nagpur / Online" />
            </div>
            <div className="ea-form__field">
              <label>Total Spots</label>
              <input type="number" min={1} value={form.spotsTotal} onChange={e => set('spotsTotal', e.target.value)} />
            </div>
          </div>

          <div className="ea-form__field">
            <label>Description *</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Short event description shown on the card..." />
          </div>

          <div className="ea-form__row ea-form__row--2">
            <div className="ea-form__field">
              <label>Tags <small>(comma-separated)</small></label>
              <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="AI, Machine Learning, Python" />
            </div>
            <div className="ea-form__field">
              <label>Prize / Reward</label>
              <input type="text" value={form.prize} onChange={e => set('prize', e.target.value)} placeholder="₹1,00,000 + Internship" />
            </div>
          </div>

          <div className="ea-form__row ea-form__row--2">
            <div className="ea-form__field ea-form__field--check">
              <label>
                <input type="checkbox" checked={!!form.isFree} onChange={e => set('isFree', e.target.checked)} />
                Free event
              </label>
            </div>
            <div className="ea-form__field ea-form__field--check">
              <label>
                <input type="checkbox" checked={!!form.featured} onChange={e => set('featured', e.target.checked)} />
                Featured (show in hero)
              </label>
            </div>
          </div>

          {error && <p className="ea-form__error">{error}</p>}

          <div className="ea-form__actions">
            <button type="button" className="ea-btn ea-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="ea-btn ea-btn--primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── SEED DATA — mirrors EventsPage hardcoded list ───────────────────────── */
const SEED_EVENTS = [
  {
    id: 'ai-hackathon-2026',
    title: 'AI Hackathon 2026',
    category: 'hackathon',
    dateRange: '15–17 Aug 2026',
    mode: 'Offline',
    location: 'VNIT Nagpur',
    description: 'Build AI-powered solutions for real-world problems. Team up with the brightest minds and compete for ₹1,00,000 in prizes.',
    tags: ['AI', 'Machine Learning', 'Python', 'Hackathon'],
    isFree: true,
    prize: '₹1,00,000',
    spotsTotal: 300,
    registrationDeadline: '2026-08-10T23:59:59',
    featured: true,
    status: 'active',
  },
  {
    id: 'webinar-gen-ai',
    title: 'Generative AI: The Future is Now',
    category: 'webinar',
    dateRange: '10th July, 2026',
    mode: 'Online',
    location: '',
    description: 'Expert talk on LLMs, Diffusion Models, and AI career paths. Live Q&A with industry leaders.',
    tags: ['GenAI', 'LLMs', 'Career'],
    isFree: true,
    prize: '',
    spotsTotal: 500,
    registrationDeadline: '2026-07-09T23:59:59',
    featured: false,
    status: 'active',
  },
  {
    id: 'fullstack-workshop',
    title: 'Full Stack Workshop',
    category: 'workshop',
    dateRange: '20–21 July 2026',
    mode: 'Online',
    location: '',
    description: 'Hands-on MERN stack bootcamp. Build and deploy a complete project in 2 days with mentor support.',
    tags: ['MERN', 'React', 'Node.js'],
    isFree: false,
    prize: '',
    spotsTotal: 80,
    registrationDeadline: '2026-07-18T23:59:59',
    featured: false,
    status: 'active',
  },
  {
    id: 'competitive-coding-2026',
    title: 'Competitive Coding Championship',
    category: 'competition',
    dateRange: '5th Aug 2026',
    mode: 'Online',
    location: '',
    description: 'Multi-round DSA competition. Prove your problem-solving skills and win internship opportunities.',
    tags: ['DSA', 'Competitive Programming', 'C++'],
    isFree: true,
    prize: '₹25,000',
    spotsTotal: 1000,
    registrationDeadline: '2026-08-03T23:59:59',
    featured: false,
    status: 'active',
  },
];

/* ══════════════════════════════════════════════════════════════════
   MAIN ADMIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function EventsAdmin() {
  const [tab, setTab]         = useState('events');
  const [authed, setAuthed]   = useState(null); // null=checking, true, false

  /* auth check */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setAuthed(false); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAuthed(payload.role === 'admin');
    } catch {
      setAuthed(false);
    }
  }, []);

  if (authed === null) return <div className="ea-loading">Checking access…</div>;
  if (!authed) return (
    <div className="ea-denied">
      <div className="ea-denied__box">
        <div className="ea-denied__icon">🔒</div>
        <h2>Admin Access Required</h2>
        <p>You must be logged in as an admin to view this page.</p>
        <a href="/login" className="ea-btn ea-btn--primary">Go to Login</a>
      </div>
    </div>
  );

  return (
    <div className="ea-page">
      <header className="ea-header">
        <div className="ea-header__inner">
          <div>
            <h1 className="ea-header__title">Events Admin</h1>
            <p className="ea-header__sub">Manage events, registrations, and host applications</p>
          </div>
          <a href="/events" className="ea-btn ea-btn--ghost">← Back to Events Page</a>
        </div>
        <nav className="ea-tabs">
          {[['events', 'Events'], ['registrations', 'Registrations'], ['applications', 'Host Applications']].map(([key, label]) => (
            <button key={key} className={`ea-tab ${tab === key ? 'ea-tab--active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="ea-main">
        {tab === 'events'        && <EventsTab />}
        {tab === 'registrations' && <RegistrationsTab />}
        {tab === 'applications'  && <ApplicationsTab />}
      </main>
    </div>
  );
}

/* ── EventsTab ────────────────────────────────────────────────────────────── */
function EventsTab() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [modal, setModal]     = useState(null); // null | 'new' | event object

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/events/admin/events`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEvents(data.events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSeed = async () => {
    if (!window.confirm(`Seed ${SEED_EVENTS.length} default events? Existing events with the same ID will be skipped.`)) return;
    try {
      const res  = await fetch(`${API_URL}/api/events/admin/seed`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ events: SEED_EVENTS }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(`Seeded ${data.inserted} new events.`);
      load();
    } catch (err) {
      alert('Seed failed: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete event "${id}"? This cannot be undone.`)) return;
    try {
      await fetch(`${API_URL}/api/events/admin/events/${id}`, { method: 'DELETE', headers: authHeaders() });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {
      alert('Delete failed.');
    }
  };

  const handleSave = (savedEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === savedEvent.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = savedEvent; return next; }
      return [savedEvent, ...prev];
    });
    setModal(null);
  };

  const STATUS_COLORS = { active: '#16a34a', draft: '#d97706', closed: '#6b7280' };

  return (
    <section>
      <div className="ea-section-head">
        <h2>All Events <span className="ea-count">{events.length}</span></h2>
        <div className="ea-section-head__actions">
          <button className="ea-btn ea-btn--ghost" onClick={handleSeed}>Seed Defaults</button>
          <button className="ea-btn ea-btn--primary" onClick={() => setModal('new')}>+ Add Event</button>
        </div>
      </div>

      {loading && <p className="ea-state">Loading…</p>}
      {error   && <p className="ea-state ea-state--error">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <div className="ea-empty">
          <p>No events yet.</p>
          <button className="ea-btn ea-btn--primary" onClick={handleSeed}>Seed Default Events</button>
        </div>
      )}

      {events.length > 0 && (
        <div className="ea-table-wrap">
          <table className="ea-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Spots</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id}>
                  <td>
                    <div className="ea-cell-title">{ev.title}</div>
                    <div className="ea-cell-sub">{ev.id}</div>
                  </td>
                  <td><span className="ea-badge ea-badge--category">{ev.category}</span></td>
                  <td>{ev.dateRange}</td>
                  <td>{ev.mode}</td>
                  <td>{ev.spotsTotal}</td>
                  <td><span className="ea-badge" style={{ background: STATUS_COLORS[ev.status] + '22', color: STATUS_COLORS[ev.status] }}>{ev.status}</span></td>
                  <td>{ev.featured ? '⭐ Yes' : '—'}</td>
                  <td>
                    <div className="ea-row-actions">
                      <button className="ea-btn ea-btn--xs" onClick={() => setModal(ev)}>Edit</button>
                      <button className="ea-btn ea-btn--xs ea-btn--danger" onClick={() => handleDelete(ev.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <EventFormModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

/* ── RegistrationsTab ─────────────────────────────────────────────────────── */
function RegistrationsTab() {
  const [events, setEvents]             = useState([]);
  const [selectedEventId, setSelected]  = useState('');
  const [regs, setRegs]                 = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/events/admin/events`, { headers: authHeaders() })
      .then(r => r.json()).then(d => setEvents(d.events || []));
  }, []);

  const loadRegs = useCallback(async (eventId) => {
    setLoading(true);
    try {
      const url  = eventId ? `${API_URL}/api/events/admin/registrations?eventId=${eventId}` : `${API_URL}/api/events/admin/registrations`;
      const res  = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      setRegs(data.registrations || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRegs(selectedEventId); }, [selectedEventId, loadRegs]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this registration?')) return;
    await fetch(`${API_URL}/api/events/admin/registrations/${id}`, { method: 'DELETE', headers: authHeaders() });
    setRegs(prev => prev.filter(r => r._id !== id));
    setTotal(t => t - 1);
  };

  const exportCSV = () => {
    if (!regs.length) return;
    const headers = ['Name', 'Email', 'Phone', 'College', 'Year', 'Event', 'Date', 'Registered At'];
    const rows = regs.map(r => [
      r.name, r.email, r.phone, r.college, r.yearOfStudy,
      r.eventTitle, r.eventDate, new Date(r.registeredAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `registrations-${selectedEventId || 'all'}.csv`; a.click();
  };

  return (
    <section>
      <div className="ea-section-head">
        <h2>Registrations <span className="ea-count">{total}</span></h2>
        <div className="ea-section-head__actions">
          <select className="ea-select" value={selectedEventId} onChange={e => setSelected(e.target.value)}>
            <option value="">All Events</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
          <button className="ea-btn ea-btn--ghost" onClick={exportCSV} disabled={!regs.length}>Export CSV</button>
        </div>
      </div>

      {loading && <p className="ea-state">Loading…</p>}
      {!loading && regs.length === 0 && <p className="ea-state">No registrations found.</p>}

      {regs.length > 0 && (
        <div className="ea-table-wrap">
          <table className="ea-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>College</th>
                <th>Year</th>
                <th>Event</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {regs.map(r => (
                <tr key={r._id}>
                  <td><strong>{r.name}</strong></td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.college}</td>
                  <td>{r.yearOfStudy || '—'}</td>
                  <td>
                    <div className="ea-cell-title">{r.eventTitle}</div>
                    <div className="ea-cell-sub">{r.eventDate}</div>
                  </td>
                  <td>{new Date(r.registeredAt).toLocaleDateString()}</td>
                  <td>
                    <button className="ea-btn ea-btn--xs ea-btn--danger" onClick={() => handleDelete(r._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ── ApplicationsTab ──────────────────────────────────────────────────────── */
function ApplicationsTab() {
  const [apps, setApps]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  const load = useCallback(async (status) => {
    setLoading(true);
    try {
      const url  = status ? `${API_URL}/api/events/admin/applications?status=${status}` : `${API_URL}/api/events/admin/applications`;
      const res  = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      setApps(data.applications || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const updateStatus = async (id, status) => {
    try {
      const res  = await fetch(`${API_URL}/api/events/admin/applications/${id}/status`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApps(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  return (
    <section>
      <div className="ea-section-head">
        <h2>Host Applications <span className="ea-count">{total}</span></h2>
        <div className="ea-section-head__actions">
          <select className="ea-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.entries(APP_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="ea-state">Loading…</p>}
      {!loading && apps.length === 0 && <p className="ea-state">No applications found.</p>}

      {apps.length > 0 && (
        <div className="ea-table-wrap">
          <table className="ea-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Date</th>
                <th>Organizer</th>
                <th>Email</th>
                <th>Attendees</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(a => {
                const s = APP_STATUS_MAP[a.status] || APP_STATUS_MAP.pending;
                return (
                  <tr key={a._id}>
                    <td>
                      <div className="ea-cell-title">{a.eventName}</div>
                      <div className="ea-cell-sub">{a.mode} · {a.venue || 'TBD'}</div>
                    </td>
                    <td><span className="ea-badge ea-badge--category">{a.eventType}</span></td>
                    <td>{a.date}</td>
                    <td>
                      <div>{a.name}</div>
                      <div className="ea-cell-sub">{a.college}</div>
                    </td>
                    <td>{a.email}</td>
                    <td>{a.attendees}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="ea-status-select"
                        value={a.status}
                        onChange={e => updateStatus(a._id, e.target.value)}
                        style={{ color: s.color, borderColor: s.color }}
                      >
                        {Object.entries(APP_STATUS_MAP).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
