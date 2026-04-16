const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide appointment date'],
  },
  time: {
    type: String,
    required: [true, 'Please provide appointment time slot'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

// Prevent double booking for same doctor at same date and time
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
