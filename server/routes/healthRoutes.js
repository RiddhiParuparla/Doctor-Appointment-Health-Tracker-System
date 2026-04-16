const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const { 
  addRecord, 
  getPatientHistory, 
  getPatientHistoryForDoctor,
  getHighRiskPatients
} = require('../controllers/healthController');
const {
  uploadReport,
  uploadMyReport,
  getReportsForPatient,
  getMyReports
} = require('../controllers/reportController');

const { upload } = require('../utils/cloudinary');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

const recordValidation = [
  body('bloodPressure').notEmpty().withMessage('BP is required'),
  body('sugarLevel').isFloat({ min: 0, max: 10000 }).withMessage('Sugar level must be between 0 and 10000'),
  body('weight').isFloat({ min: 0, max: 10000 }).withMessage('Weight must be between 0 and 10000'),
  validate
];

router.post('/add', auth, checkRole(['patient']), recordValidation, addRecord);
router.get('/history', auth, checkRole(['patient']), getPatientHistory);
router.get('/history/:patientId', auth, checkRole(['doctor']), getPatientHistoryForDoctor);
router.get('/triage', auth, checkRole(['doctor']), getHighRiskPatients);

// Medical Reports
router.post('/reports/:patientId', auth, checkRole(['doctor']), upload.single('file'), uploadReport);
router.post('/reports', auth, checkRole(['patient']), upload.single('file'), uploadMyReport);
router.get('/reports/:patientId', auth, checkRole(['doctor']), getReportsForPatient);
router.get('/reports', auth, checkRole(['patient']), getMyReports);


module.exports = router;
