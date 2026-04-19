const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow images to be loaded from this server
}));

// Enable CORS
app.use(cors());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const auth = require('./routes/auth.routes');
const guests = require('./routes/guest.routes');
const rooms = require('./routes/room.routes');
const reports = require('./routes/report.routes');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/guests', guests);
app.use('/api/v1/rooms', rooms);
app.use('/api/v1/reports', reports);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
