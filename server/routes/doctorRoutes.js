const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { 
  getDoctorStats, 
  getDoctorPatients, 
  getDoctorProfile, 
  updateDoctorProfile,
  getAllDoctors 
} = require('../controllers/doctorController');

router.get('/', auth, getAllDoctors);

router.get('/stats', auth, checkRole(['doctor']), getDoctorStats);
router.get('/patients', auth, checkRole(['doctor']), getDoctorPatients);
router.get('/profile', auth, checkRole(['doctor']), getDoctorProfile);
router.put('/profile', auth, checkRole(['doctor']), updateDoctorProfile);

module.exports = router;
