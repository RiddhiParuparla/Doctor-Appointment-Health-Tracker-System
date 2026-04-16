const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../utils/upload');
const { 
  addPrescription, 
  getPatientPrescriptions,
  getPrescriptionsForDoctor
} = require('../controllers/prescriptionController');

router.post('/add', auth, checkRole(['doctor']), upload.single('report'), addPrescription);
router.get('/patient', auth, checkRole(['patient']), getPatientPrescriptions);
router.get('/doctor/view/:patientId', auth, checkRole(['doctor']), getPrescriptionsForDoctor);

module.exports = router;
