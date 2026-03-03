const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error('❌ ERROR:', err.message || err);
    if (err.stack) {
        console.error('Stack:', err.stack);
    }

    // Supabase / Database Error
    if (err.code === '23505') {
        const message = 'Duplicate field value entered';
        error = new Error(message);
        error.statusCode = 400;
    }

    if (err.code === '42P01') {
        const message = 'Database table does not exist. Please run migrations.';
        error = new Error(message);
        error.statusCode = 500;
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new Error(message);
        error.statusCode = 400;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
    });
};

module.exports = errorHandler;
