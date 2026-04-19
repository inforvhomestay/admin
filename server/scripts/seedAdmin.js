const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config();
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

const seedAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        const email = process.env.ADMIN_EMAIL || 'superadmin@homestay.com';
        const password = process.env.ADMIN_PASSWORD || 'adminpassword123';

        let admin = await User.findOne({ email });

        if (admin) {
            console.log(`Super Admin (${email}) already exists. Updating password...`);
            admin.password = password;
            await admin.save();
            console.log('Super Admin password updated successfully');
            process.exit();
        }

        admin = await User.create({
            name: 'Super Admin',
            email,
            password,
            role: 'super-admin',
        });

        console.log('Super Admin created successfully');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
