import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  id:                   { type: String, required: true, unique: true, trim: true },
  title:                { type: String, required: true, trim: true },
  category:             { type: String, enum: ['hackathon', 'webinar', 'workshop', 'competition', 'community'], required: true },
  dateRange:            { type: String, required: true, trim: true },
  mode:                 { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Online' },
  location:             { type: String, default: '', trim: true },
  description:          { type: String, required: true, trim: true },
  tags:                 [{ type: String, trim: true }],
  isFree:               { type: Boolean, default: true },
  prize:                { type: String, default: '', trim: true },
  spotsTotal:           { type: Number, default: 200, min: 1 },
  registrationDeadline: { type: String, default: '' },
  featured:             { type: Boolean, default: false },
  status:               { type: String, enum: ['active', 'draft', 'closed'], default: 'active' },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
