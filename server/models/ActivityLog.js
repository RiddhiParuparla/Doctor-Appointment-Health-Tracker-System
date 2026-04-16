const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Sometimes system-wide logs might not have a specific user
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'doctor', 'patient', 'warning'],
    default: 'system'
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
