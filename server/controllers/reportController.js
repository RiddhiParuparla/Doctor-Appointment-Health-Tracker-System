const MedicalReport = require('../models/MedicalReport');
const User = require('../models/User');

const uploadReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { title, category, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const report = new MedicalReport({
      patientId,
      title,
      category,
      notes,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype.split('/')[1]
    });

    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadMyReport = async (req, res) => {
  try {
    const { title, category, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const report = new MedicalReport({
      patientId: req.user._id,
      title,
      category,
      notes,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype.split('/')[1]
    });

    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getReportsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    // Doctor viewing a specific patient
    const reports = await MedicalReport.find({ patientId }).sort({ createdAt: -1 });
    res.json(reports || []);
  } catch (err) {
    console.error(`Error fetching reports for patient: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

const getMyReports = async (req, res) => {
  try {
    // Patient viewing their own reports
    const reports = await MedicalReport.find({ patientId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports || []);
  } catch (err) {
    console.error(`Error fetching my reports: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  uploadReport,
  uploadMyReport,
  getReportsForPatient,
  getMyReports
};

