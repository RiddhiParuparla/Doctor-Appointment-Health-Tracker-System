const HealthRecord = require('../models/HealthRecord');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const addRecord = async (req, res) => {
  try {
    const { bloodPressure, sugarLevel, weight } = req.body;
    const patientId = req.user._id;

    const record = new HealthRecord({
      patientId,
      bloodPressure,
      sugarLevel,
      weight
    });

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientHistory = async (req, res) => {
  try {
    const history = await HealthRecord.find({ patientId: req.user._id })
      .populate('patientId', 'name email emergencyInfo')
      .sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientHistoryForDoctor = async (req, res) => {
    try {
      const { patientId } = req.params;
      const history = await HealthRecord.find({ patientId })
        .populate('patientId', 'name email phone emergencyInfo')
        .sort({ date: -1 });
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

const getHighRiskPatients = async (req, res) => {
    try {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });
  
      // Find all unique patient IDs from appointments
      const patientIds = await Appointment.distinct('patientId', { doctorId: doctorProfile._id });
  
      // Find records with RED risk levels for these patients
      // We populate the patient name and email for the triage list
      const highRiskPatients = await HealthRecord.find({
        patientId: { $in: patientIds },
        riskLevel: 'red'
      })
      .populate('patientId', 'name email')
      .sort({ date: -1 });
  
      res.json(highRiskPatients);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

module.exports = { 
  addRecord, 
  getPatientHistory, 
  getPatientHistoryForDoctor,
  getHighRiskPatients
};
