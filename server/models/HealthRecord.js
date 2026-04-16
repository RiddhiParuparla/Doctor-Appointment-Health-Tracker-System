const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bloodPressure: {
    type: String, // e.g. "120/80"
    required: true,
  },
  sugarLevel: {
    type: Number, // mg/dL
    required: true,
  },
  weight: {
    type: Number, // kg
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  riskLevel: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    default: 'green',
  }
}, { timestamps: true });

// Pre-save logic for Health Risk Indicator (Modern Async Style)
healthRecordSchema.pre('save', async function() {
  try {
    if (!this.bloodPressure || !this.bloodPressure.includes('/')) {
      this.riskLevel = 'green';
      return;
    }

    // Handle BP as either "120/80" or just "120"
    let systolic = 0;
    let diastolic = 80; // Default diastolic if only systolic is provided

    if (this.bloodPressure.includes('/')) {
      const bp = this.bloodPressure.split('/');
      systolic = parseInt(bp[0]);
      diastolic = parseInt(bp[1]);
    } else {
      systolic = parseInt(this.bloodPressure);
    }

    if (isNaN(systolic)) {
        this.riskLevel = 'green';
        return;
    }

    if (systolic > 160 || diastolic > 100 || (this.sugarLevel && this.sugarLevel > 200)) {
      this.riskLevel = 'red';
    } else if (systolic > 140 || diastolic > 90 || (this.sugarLevel && this.sugarLevel > 140)) {
      this.riskLevel = 'yellow';
    } else {
      this.riskLevel = 'green';
    }
  } catch (err) {
    console.error("HealthRecord RiskLevel Logic failed:", err);
    this.riskLevel = 'green';
  }
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
module.exports = HealthRecord;
