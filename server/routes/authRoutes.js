const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor']).withMessage('Invalid role'),
  validate
];

const adminRegisterValidation = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').equals('admin').withMessage('Role must be admin'),
    (req, res, next) => {
        const secretKey = req.headers['x-admin-key'];
        if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: 'Unauthorized: Invalid Admin Secret Key' });
        }
        next();
    },
    validate
];


const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

router.post('/register', registerValidation, register);
router.post('/register-admin', adminRegisterValidation, register);
router.post('/login', loginValidation, login);

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
