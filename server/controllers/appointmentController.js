const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user._id;

    // Check if slot is taken (Duplicate booking prevention via Index + Query)
    const existing = await Appointment.findOne({ doctorId, date, time });
    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      time
    });

    await appointment.save();

    // Log booking
    const { createActivityLog } = require('../utils/logger');
    const doctor = await User.findById(doctorId).catch(() => null);
    await createActivityLog(patientId, `${req.user.name} booked a session with ${doctor?.name || 'a specialist'}`, 'patient');

    res.status(201).json(appointment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctorId: doctorProfile._id })
      .populate('patientId', 'name email')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
      .populate('patientId', 'name')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } });

    // Log status update
    const { createActivityLog } = require('../utils/logger');
    const action = status === 'approved' ? 'accepted' : 'rejected';
    await createActivityLog(req.user._id, `Dr. ${req.user.name} ${action} appointment with ${appointment.patientId?.name}`, 'doctor');

    res.json(appointment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id, patientId: req.user._id });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or unauthorized' });
    }

    appointment.status = 'rejected';
    await appointment.save();
    
    // Log cancellation
    const { createActivityLog } = require('../utils/logger');
    await createActivityLog(req.user._id, `Appointment cancelled by patient: ${req.user.name}`, 'warning');

    res.json({ message: 'Appointment cancelled successfully', appointment });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateStatus,
  cancelAppointment
};
