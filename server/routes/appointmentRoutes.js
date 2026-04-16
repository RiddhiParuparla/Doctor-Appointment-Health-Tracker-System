const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const { 
  bookAppointment, 
  getPatientAppointments, 
  getDoctorAppointments, 
  updateStatus,
  cancelAppointment 
} = require('../controllers/appointmentController');

router.post('/book', auth, checkRole(['patient']), bookAppointment);
router.get('/patient', auth, checkRole(['patient']), getPatientAppointments);
router.get('/doctor', auth, checkRole(['doctor']), getDoctorAppointments);
router.patch('/status/:id', auth, checkRole(['doctor']), updateStatus);
router.patch('/cancel/:id', auth, checkRole(['patient']), cancelAppointment);

module.exports = router;
