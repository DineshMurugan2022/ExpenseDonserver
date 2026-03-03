const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const supabase = require('./utils/supabase');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Apply rate limiting to all API routes (except in development)
app.use('/api/', apiLimiter);

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://expense-don.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean).map(origin => origin.replace(/\/$/, ''));

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/recurring', require('./routes/recurringRoutes'));
app.use('/api/debts', require('./routes/debtRoutes'));

app.use(require('./middleware/error'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message || err);
    console.error('Stack:', err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message || err);
    console.error('Stack:', err.stack);
    // Exit process on critical error
    process.exit(1);
});

// Debug why it exits
process.on('exit', (code) => {
    if (code !== 0) {
        console.log(`Process is exiting with code: ${code}`);
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('❌ Server Listener Error:', err.message || err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
});
