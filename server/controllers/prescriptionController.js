const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');

const addPrescription = async (req, res) => {
  try {
    const { patientId, medicines, notes } = req.body;
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });

    if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

    const prescription = new Prescription({
      patientId,
      doctorId: doctorProfile._id,
      medicines: JSON.parse(medicines), // Medicines sent as stringified JSON from frontend
      notes,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    await prescription.save();
    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPrescriptionsForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patientId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addPrescription, getPatientPrescriptions, getPrescriptionsForDoctor };
