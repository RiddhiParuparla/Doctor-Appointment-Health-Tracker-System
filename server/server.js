const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Route Imports
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const healthRoutes = require('./routes/healthRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // For serving static files/images if needed
  crossOriginEmbedderPolicy: false
})); 

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // Check if origin is allowed or if it's a vercel.app subdomain
    const isAllowed = !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked Origin:', origin);
      callback(new Error('CORS Not Allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json()); // Body parser

app.use(morgan('dev')); // Professional logging

// Rate Limiting (Pro Security)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development agility
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);

// Professional Global Error Handler
app.use((err, req, res, next) => {
  console.log("❌ GLOBAL ERROR CAUGHT:");
  console.log(err);
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HealthTracker API' });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then((conn) => console.log(`✅ MongoDB Connected: ${conn.connection.name}`))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
