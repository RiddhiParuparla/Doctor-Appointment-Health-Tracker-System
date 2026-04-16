const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Prescription = require('./models/Prescription');

const seedPrescriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Find the Patient (Priya Trivedi)
    const patient = await User.findOne({ name: /Priya Trivedi/ });
    if (!patient) throw new Error("Patient Priya not found");

    // 2. Find Doctors
    const amitDoc = await Doctor.findOne().populate({
        path: 'userId',
        match: { name: /Amit Sharma/ }
    });
    const priyaDoc = await Doctor.findOne().populate({
        path: 'userId',
        match: { name: /Priya Patel/ }
    });

    if (!amitDoc || !priyaDoc) throw new Error("Doctors not found");

    // 3. Clear old test data (optional)
    await Prescription.deleteMany({ patientId: patient._id });

    // 4. Create Cardiologist Prescription
    const p1 = new Prescription({
      patientId: patient._id,
      doctorId: amitDoc._id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      medicines: [
        { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily (Night)' },
        { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily (After Breakfast)' }
      ],
      notes: "Patient shows signs of early stage hypertension. Strictly avoid high-sodium foods and processed sugars. Return for follow-up BP check in 14 days."
    });

    // 5. Create Gynecologist Prescription
    const p2 = new Prescription({
      patientId: patient._id,
      doctorId: priyaDoc._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      medicines: [
        { name: 'Ferrous Sulfate', dosage: '325mg', frequency: 'Twice daily' },
        { name: 'Folic Acid', dosage: '5mg', frequency: 'Once daily' }
      ],
      notes: "Iron levels are slightly below baseline. Maintain a diet rich in green leafy vegetables. Next blood work scheduled for next month."
    });

    await p1.save();
    await p2.save();

    console.log("✅ Clinical prescriptions seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedPrescriptions();
