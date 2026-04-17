const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const ActivityLog = require('../models/ActivityLog');
const { createActivityLog } = require('../utils/logger');


const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();

    // Stats for Charts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const appointmentsPerDay = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Real Recent Activity from DB
    const recentActivity = await ActivityLog.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Humanize time for logs (simple version for backend)
    const formattedLogs = recentActivity.map(log => ({
      id: log._id,
      text: log.text,
      time: 'Just now', // Will be humanized on frontend
      rawTime: log.createdAt,
      type: log.type
    }));

    // Aggregate status counts for Pie Chart
    const statusCounts = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Map status counts to labels
    const statusMap = { 'approved': 0, 'pending': 0, 'rejected': 0, 'completed': 0 };
    statusCounts.forEach(s => { if(statusMap.hasOwnProperty(s._id)) statusMap[s._id] = s.count; });

    res.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      appointmentsPerDay,
      recentActivity: formattedLogs,
      statusCounts: statusMap
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(id, { status }, { new: true });

    // Log status update
    await createActivityLog(req.user._id, `Admin ${status === 'blocked' ? 'blocked' : 'unblocked'} user: ${user.name}`, 'warning');

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email status')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(id, { isApproved }, { new: true })
      .populate('userId', 'name email');

    // Log approval
    await createActivityLog(req.user._id, `Admin ${isApproved ? 'approved' : 'revoked'} Dr. ${doctor.userId.name}`, 'doctor');

    res.json(doctor);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
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

const updateAppointmentStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
      res.json(appointment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascading Delete Logic
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: id });
      if (doctorProfile) {
        // Delete appointments associated with this doctor
        await Appointment.deleteMany({ doctorId: doctorProfile._id });
        // Delete doctor profile
        await Doctor.findByIdAndDelete(doctorProfile._id);
      }
    } else if (user.role === 'patient') {
      // Delete appointments associated with this patient
      await Appointment.deleteMany({ patientId: id });
    }

    // Log deletion before removing user
    try {
      await createActivityLog(req.user._id, `Admin deleted ${user.role}: ${user.name}`, 'danger');
    } catch (logErr) {
      console.error("Deletion Log Error:", logErr);
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User and associated records deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllDoctors,
  approveDoctor,
  getAllAppointments,
  updateAppointmentStatus,
  deleteUser
};
