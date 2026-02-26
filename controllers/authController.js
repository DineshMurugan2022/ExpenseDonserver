const supabase = require('../utils/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into 'profiles' table (assuming custom table for simplicity)
        const { data, error } = await supabase
            .from('profiles')
            .insert([
                { name, email, password: hashedPassword }
            ])
            .select();

        if (error) throw error;

        sendTokenResponse(data[0], 201, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user in 'profiles' table
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email);

        if (error || !users || users.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id);

        if (error || !users || users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: users[0],
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, currency } = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: req.user.id,
                name,
                email,
                currency,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                currency: data.currency
            },
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
