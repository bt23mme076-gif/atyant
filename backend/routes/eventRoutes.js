import express from 'express';
import EventRegistration from '../models/EventRegistration.js';
import EventApplication  from '../models/EventApplication.js';
import Event             from '../models/Event.js';
import protect           from '../middleware/authMiddleware.js';
import {
  sendEventRegistrationEmail,
  sendEventHostConfirmationEmail,
  sendEventHostNotificationEmail,
} from '../utils/emailService.js';

const router = express.Router();

/* ── Admin guard middleware ───────────────────────────────────────────────── */
const adminOnly = [protect, (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}];

/* ── GET /api/events/list  (public) ──────────────────────────────────────── */
router.get('/list', async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' }).sort({ createdAt: 1 }).lean();
    return res.json({ events });
  } catch (err) {
    console.error('Events list error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── POST /api/events/register ───────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { eventId, eventTitle, eventDate, eventMode, name, email, phone, college, yearOfStudy } = req.body;

    if (!eventId || !eventTitle || !eventDate || !name || !email || !phone || !college) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number.' });
    }

    const existing = await EventRegistration.findOne({ email: email.toLowerCase(), eventId });
    if (existing) {
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    const registration = await EventRegistration.create({
      eventId,
      eventTitle,
      eventDate,
      eventMode: eventMode || 'Online',
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      college: college.trim(),
      yearOfStudy: yearOfStudy || '',
    });

    sendEventRegistrationEmail({ email: registration.email, name: registration.name, eventTitle, eventDate, eventMode: registration.eventMode })
      .then(() => console.log(`✅ Event reg email → ${registration.email}`))
      .catch(err => console.error(`❌ Event reg email failed: ${err.message}`));

    return res.status(201).json({
      message: 'Registration successful! Check your email for confirmation.',
      registration: { id: registration._id, name: registration.name, email: registration.email, eventTitle, eventDate },
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You are already registered for this event.' });
    console.error('Event registration error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ── POST /api/events/host ───────────────────────────────────────────────── */
router.post('/host', async (req, res) => {
  try {
    const { eventType, eventName, date, mode, venue, attendees, prize, description, name, email, college, phone, notes } = req.body;

    if (!eventType || !eventName || !date || !mode || !name || !email || !college || !phone || !description || !attendees) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });

    const application = await EventApplication.create({
      eventType, eventName, date, mode,
      venue: venue || '',
      attendees: Number(attendees),
      prize: prize || '',
      description: description.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      college: college.trim(),
      phone: phone.trim(),
      notes: notes || '',
    });

    sendEventHostConfirmationEmail({ email: application.email, name: application.name, eventName, eventType, date })
      .then(() => console.log(`✅ Host confirmation → ${application.email}`))
      .catch(err => console.error(`❌ Host confirmation failed: ${err.message}`));

    sendEventHostNotificationEmail(application)
      .then(() => console.log(`✅ Host notification sent to team`))
      .catch(err => console.error(`❌ Host notification failed: ${err.message}`));

    return res.status(201).json({
      message: 'Application submitted! Our team will get back to you within 48 hours.',
      applicationId: application._id,
    });
  } catch (err) {
    console.error('Host application error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ── GET /api/events/:eventId/stats  (public) ────────────────────────────── */
router.get('/:eventId/stats', async (req, res) => {
  try {
    const count = await EventRegistration.countDocuments({ eventId: req.params.eventId });
    return res.json({ eventId: req.params.eventId, registered: count });
  } catch (err) {
    console.error('Event stats error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ════════════════════════════════════════════════════════════════════════════
   ADMIN ROUTES — all require admin JWT
   ════════════════════════════════════════════════════════════════════════════ */

/* ── GET /api/events/admin/events ────────────────────────────────────────── */
router.get('/admin/events', adminOnly, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return res.json({ events });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── POST /api/events/admin/events ───────────────────────────────────────── */
router.post('/admin/events', adminOnly, async (req, res) => {
  try {
    const { id, title, category, dateRange, mode, location, description, tags, isFree, prize, spotsTotal, registrationDeadline, featured, status } = req.body;
    if (!id || !title || !category || !dateRange || !description) {
      return res.status(400).json({ message: 'id, title, category, dateRange and description are required.' });
    }
    const event = await Event.create({ id, title, category, dateRange, mode, location, description, tags: tags || [], isFree: isFree !== false, prize, spotsTotal: spotsTotal || 200, registrationDeadline, featured: !!featured, status: status || 'active' });
    return res.status(201).json({ event });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'An event with that ID already exists.' });
    console.error('Create event error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── PUT /api/events/admin/events/:id ────────────────────────────────────── */
router.put('/admin/events/:id', adminOnly, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    return res.json({ event });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── DELETE /api/events/admin/events/:id ─────────────────────────────────── */
router.delete('/admin/events/:id', adminOnly, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ id: req.params.id });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    return res.json({ message: 'Event deleted.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── POST /api/events/admin/seed ─────────────────────────────────────────── */
router.post('/admin/seed', adminOnly, async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: 'Provide an array of events.' });
    }
    const ops = events.map(ev => ({
      updateOne: { filter: { id: ev.id }, update: { $setOnInsert: ev }, upsert: true }
    }));
    const result = await Event.bulkWrite(ops);
    return res.json({ inserted: result.upsertedCount, message: 'Seed complete.' });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── GET /api/events/admin/applications ──────────────────────────────────── */
router.get('/admin/applications', adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const [applications, total] = await Promise.all([
      EventApplication.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      EventApplication.countDocuments(filter),
    ]);
    return res.json({ applications, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── PATCH /api/events/admin/applications/:id/status ─────────────────────── */
router.patch('/admin/applications/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'under_review', 'approved', 'rejected'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    const app = await EventApplication.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!app) return res.status(404).json({ message: 'Application not found.' });
    return res.json({ application: app });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── GET /api/events/admin/registrations ─────────────────────────────────── */
router.get('/admin/registrations', adminOnly, async (req, res) => {
  try {
    const { eventId, page = 1, limit = 100 } = req.query;
    const filter = eventId ? { eventId } : {};
    const [registrations, total] = await Promise.all([
      EventRegistration.find(filter).sort({ registeredAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      EventRegistration.countDocuments(filter),
    ]);
    return res.json({ registrations, total });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* ── DELETE /api/events/admin/registrations/:id ──────────────────────────── */
router.delete('/admin/registrations/:id', adminOnly, async (req, res) => {
  try {
    const reg = await EventRegistration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found.' });
    return res.json({ message: 'Registration deleted.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

/* Legacy unprotected admin endpoints (keep for backward compat) */
router.get('/applications', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const [applications, total] = await Promise.all([
      EventApplication.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      EventApplication.countDocuments(filter),
    ]);
    return res.json({ applications, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/registrations/:eventId', async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.eventId }).sort({ registeredAt: -1 });
    return res.json({ registrations, total: registrations.length });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
