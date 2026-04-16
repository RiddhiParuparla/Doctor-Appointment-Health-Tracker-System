// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const bcrypt = require('bcryptjs');
// const User = require('./models/User');
// const Doctor = require('./models/Doctor');
// const Appointment = require('./models/Appointment');
// const HealthRecord = require('./models/HealthRecord');
// const Prescription = require('./models/Prescription');

// dotenv.config();

// const firstNames = ['Amit', 'Priya', 'Rahul', 'Sarah', 'John', 'Vikram', 'Anjali', 'Deepak', 'Sonia', 'Rohan', 'Sneha', 'Arun', 'Kiran', 'Meera', 'Ravi', 'Maya', 'Sameer', 'Nisha', 'Vijay', 'Pooja'];
// const lastNames = ['Sharma', 'Singh', 'Smith', 'Verma', 'Kumar', 'Das', 'Gupta', 'Patel', 'Reddy', 'Chawla', 'Agarwal', 'Malhotra', 'Iyer', 'Kapoor'];
// const specializations = ['Cardiology', 'Pediatrics', 'Neurology', 'Dermatology', 'Oncology', 'Orthopedics', 'General Medicine', 'ENT', 'Gynecology', 'Psychiatry'];
// const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
// const randomDate = (daysAgo) => {
//   const date = new Date();
//   date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
//   return date;
// };

// const seedData = async () => {
//   try {
//     console.log('🚀 INITIATING DATA EXPLOSION...');
//     await mongoose.connect(process.env.MONGO_URI);
    
//     console.log('🧹 Purging old records...');
//     await User.deleteMany({});
//     await Doctor.deleteMany({});
//     await Appointment.deleteMany({});
//     await HealthRecord.deleteMany({});
//     await Prescription.deleteMany({});

//     const hashedPass = 'admin123'; // Pass plain to allow Mongoose hook to handle encryption Correctlly

//     // 1. CREATE ADMIN
//     await User.create({ name: 'System Admin', email: 'admin@healthtrack.com', password: hashedPass, role: 'admin' });
//     console.log('✅ Master Admin Created.');

//     // 2. GENERATE 10 DOCTORS
//     console.log('👨‍⚕️ Generating 10 Doctors...');
//     const doctorsList = [];
//     for (let i = 1; i <= 10; i++) {
//       const name = `Dr. ${randomItem(firstNames)} ${randomItem(lastNames)}`;
//       const user = await User.create({
//         name,
//         email: `doctor${i}@healthtrack.com`,
//         password: hashedPass,
//         role: 'doctor'
//       });
//       const doctor = await Doctor.create({
//         userId: user._id,
//         specialization: randomItem(specializations),
//         experience: 5 + Math.floor(Math.random() * 20),
//         fees: 500 + Math.floor(Math.random() * 1000),
//         isApproved: Math.random() > 0.2 // 80% approved
//       });
//       doctorsList.push(doctor);
//     }

//     // 3. GENERATE 50 PATIENTS
//     console.log('👥 Generating 50 Patients...');
//     const patientsList = [];
//     for (let i = 1; i <= 50; i++) {
//       const name = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
//       const user = await User.create({
//         name,
//         email: `patient${i}@testmail.com`,
//         password: hashedPass,
//         role: 'patient',
//         emergencyInfo: {
//           bloodGroup: randomItem(bloodGroups),
//           allergies: i % 3 === 0 ? ['Peanuts', 'Penicillin'] : []
//         }
//       });
//       patientsList.push(user);
//     }

//     // 4. GENERATE 35 APPOINTMENTS
//     console.log('📅 Generating 35 Appointments...');
//     for (let i = 0; i < 35; i++) {
//       const patient = randomItem(patientsList);
//       const doctor = randomItem(doctorsList);
//       await Appointment.create({
//         patientId: patient._id,
//         doctorId: doctor._id,
//         date: randomDate(30), // Last 30 days
//         time: `${9 + Math.floor(Math.random() * 8)}:00`,
//         status: randomItem(['pending', 'approved', 'completed', 'rejected']),
//         notes: "Routine checkup and consultation."
//       });
//     }

//     // 5. GENERATE 30 HEALTH RECORDS (VITALS)
//     console.log('📊 Generating 30+ Vitals Records...');
//     for (let i = 0; i < 30; i++) {
//       const patient = randomItem(patientsList);
//       await HealthRecord.create({
//         patientId: patient._id,
//         bloodPressure: `${110 + Math.floor(Math.random() * 30)}/${70 + Math.floor(Math.random() * 20)}`,
//         sugarLevel: 80 + Math.floor(Math.random() * 120),
//         weight: 50 + Math.floor(Math.random() * 40),
//         date: randomDate(60) // Last 60 days
//       });
//     }

//     // 6. GENERATE 15 PRESCRIPTIONS
//     console.log('💊 Generating 15 Prescriptions...');
//     for (let i = 0; i < 15; i++) {
//       const patient = randomItem(patientsList);
//       const doctor = randomItem(doctorsList);
//       await Prescription.create({
//         patientId: patient._id,
//         doctorId: doctor._id,
//         date: randomDate(20),
//         medicines: [
//           { name: 'Paracetamol', dosage: '500mg', duration: '5 days', frequency: 'Twice daily' },
//           { name: 'Amoxicillin', dosage: '250mg', duration: '7 days', frequency: 'Once daily' }
//         ],
//         notes: "Take after meals."
//       });
//     }

//     console.log('\n💥 DATA EXPLOSION COMPLETE!');
//     console.log('---------------------------');
//     console.log('TOTAL USERS: 61');
//     console.log('DOCTORS: 10');
//     console.log('PATIENTS: 50');
//     console.log('APPOINTMENTS: 35');
//     console.log('---------------------------');
//     console.log('Login: admin@healthtrack.com / admin123');
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ SEEDING FAILED:', err);
//     process.exit(1);
//   }
// };
// seedData();
