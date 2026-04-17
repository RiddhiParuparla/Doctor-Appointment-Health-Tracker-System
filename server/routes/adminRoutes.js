const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllDoctors,
  approveDoctor,
  getAllAppointments,
  updateAppointmentStatus,
  deleteUser
} = require('../controllers/adminController');

// All routes here require Admin role
router.use(auth, checkRole(['admin']));

// Stats & Analytics
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/status/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Doctor Management
router.get('/doctors', getAllDoctors);
router.patch('/doctors/approve/:id', approveDoctor);

// Appointment Management
router.get('/appointments', getAllAppointments);
router.patch('/appointments/status/:id', updateAppointmentStatus);

module.exports = router;
