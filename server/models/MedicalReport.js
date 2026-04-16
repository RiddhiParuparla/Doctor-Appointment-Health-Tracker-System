const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Lab Report', 'Imaging', 'Prescription', 'Vaccination', 'Other'],
    default: 'Other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String, // pdf, image
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
}, { timestamps: true });

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
module.exports = MedicalReport;
