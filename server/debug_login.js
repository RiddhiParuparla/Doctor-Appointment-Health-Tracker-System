const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const debugLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'admin@healthtrack.com';
        const rawPassword = 'admin123';
        
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        
        console.log('User found:', user.email);
        console.log('Hashed password in DB:', user.password);
        
        const isMatch = await bcrypt.compare(rawPassword, user.password);
        console.log('Manual check - passwords match?', isMatch);
        
        const methodMatch = await user.comparePassword(rawPassword, user.password);
        console.log('Model method check - passwords match?', methodMatch);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

debugLogin();
