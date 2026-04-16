const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const HealthRecord = require('../models/HealthRecord');

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorStats = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

    // 1. Total Appointments (Approved/Pending for today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const appointmentsToday = await Appointment.countDocuments({
      doctorId: doctorProfile._id,
      date: { $gte: today, $lt: tomorrow }
    });

    // 2. Unique Patients who have visited this doctor
    const uniquePatients = await Appointment.distinct('patientId', { doctorId: doctorProfile._id });
    const totalPatients = uniquePatients.length;

    // 3. Pending Actions (Prescriptions yet to be issued for completed appointments)
    // For now, we'll count approved appointments that don't have prescriptions in the last 24h
    // This is a simplified clinical metric for demo
    const pendingPrescriptions = await Appointment.countDocuments({
      doctorId: doctorProfile._id,
      status: 'approved'
    });

    res.json({
      appointmentsToday,
      totalPatients,
      pendingPrescriptions,
      specialization: doctorProfile.specialization
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorPatients = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

    // Find all patients who have an appointment history with this doctor
    const patientIds = await Appointment.distinct('patientId', { doctorId: doctorProfile._id });
    
    // Fetch patient details (Emergency Info is critical for doctors)
    const patients = await User.find({ _id: { $in: patientIds } })
      .select('name email phone emergencyInfo');

    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email');
    if (!doctor) return res.status(404).json({ message: 'Specialist profile not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, experience, slots, availability } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { specialization, experience, slots, availability },
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Specialist profile not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  getAllDoctors,
  getDoctorStats, 
  getDoctorPatients, 
  getDoctorProfile, 
  updateDoctorProfile 
};
