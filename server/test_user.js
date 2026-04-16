const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');
        await User.deleteMany({});
        const u = new User({ name: 'test', email: 'test@test.com', password: 'password123', role: 'admin' });
        await u.save();
        console.log('User created:', u);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

test();
