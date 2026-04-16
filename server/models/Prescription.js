const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
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
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
  }],
  notes: {
    type: String,
  },
  fileUrl: {
    type: String, // Path to PDF/Report if uploaded
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;
