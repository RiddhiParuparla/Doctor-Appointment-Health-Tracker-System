const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Remove existing admin
        await User.deleteMany({ email: 'admin@healthtrack.com' });
        
        const hashedAdmin = bcrypt.hashSync('admin123', 10);
        
        // Using insertMany to bypass the pre-save double-hashing hook
        await User.insertMany([{
            name: 'System Admin',
            email: 'admin@healthtrack.com',
            password: hashedAdmin,
            role: 'admin'
        }]);
        
        console.log('Admin account created successfully (Bypassed double-hashing)!');
        console.log('Email: admin@healthtrack.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
