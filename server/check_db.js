const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await User.countDocuments();
        const users = await User.find({}, 'name email role');
        console.log(`--- DB Report ---`);
        console.log(`Database: ${mongoose.connection.name}`);
        console.log(`User Count: ${count}`);
        console.log(`Users:`, users);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
