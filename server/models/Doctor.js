const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialization: {
    type: String,
    required: [true, 'Please provide specialization'],
  },
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience'],
  },
  availability: {
    type: [String], // e.g. ["Monday", "Wednesday"]
    default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  slots: {
    type: [String], // e.g. ["09:00", "10:00"]
    default: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  fees: {
    type: Number,
    default: 500,
  }

}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
