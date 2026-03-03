const supabase = require('../utils/supabase');
const { validatePasswordStrength } = require('../utils/passwordValidator');


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            const failedRequirements = Object.values(passwordValidation.requirements)
                .filter(r => !r.met)
                .map(r => r.description)
                .join(', ');
            return res.status(400).json({
                success: false,
                error: `Password must have: ${failedRequirements}`
            });
        }

        // Create user with admin API to auto-confirm email
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        });

        if (authError) {
            console.error('Registration error:', authError);
            return res.status(authError.status || 400).json({ success: false, error: authError.message });
        }

        if (!authData.user) {
            return res.status(500).json({ success: false, error: 'Failed to create user' });
        }

        // Sync with profiles table (if not handled by trigger)
        // We use the ID from authData.user
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
                {
                    id: authData.user.id,
                    name,
                    email,
                    email_verified: authData.user.email_confirmed_at ? true : false
                }
            ]);

        if (profileError) {
            console.warn('Profile sync warning:', profileError.message);
            // We don't fail registration if profile sync fails, as the user is created in Auth
        }

        res.status(201).json({
            success: true,
            message: authData.session ? 'Registration successful!' : 'Registration successful, please check your email for verification.'
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(400).json({ success: false, error: err.message || 'Registration failed' });
    }
};

// @desc    Verify email (Mocked - Supabase handles this via redirect)
exports.verifyEmail = async (req, res, next) => {
    res.status(200).json({ success: true, message: 'Email verified successfully or handled by Supabase.' });
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

        // Use Supabase Auth to sign in
        let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            // If email is not confirmed, auto-confirm it and retry login
            // (Since we are using service role key, we can do this)
            if (authError.message.includes('Email not confirmed')) {
                console.log('Auto-confirming email for user:', email);

                // We need the user ID. We can get it by listing users with this email via admin
                const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
                const user = users.find(u => u.email === email);

                if (user) {
                    const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
                        email_confirm: true
                    });

                    if (!confirmError) {
                        // Retry login
                        const retry = await supabase.auth.signInWithPassword({ email, password });
                        authData = retry.data;
                        authError = retry.error;
                    }
                }
            }

            if (authError) {
                console.error('Login error:', authError);
                return res.status(authError.status || 401).json({ success: false, error: authError.message });
            }
        }

        // Fetch user profile for name and currency
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            console.warn('Profile fetch warning during login:', profileError.message);
        }

        const userResponse = {
            id: authData.user.id,
            name: profile?.name || authData.user.user_metadata?.name || 'User',
            email: authData.user.email,
            currency: profile?.currency || 'INR'
        };

        res.status(200).json({
            success: true,
            token: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            user: userResponse
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ success: false, error: err.message || 'Login failed' });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, error: 'Refresh token required' });
        }

        const { data, error } = await supabase.auth.refreshSession({ refresh_token: token });

        if (error) {
            return res.status(error.status || 401).json({ success: false, error: error.message });
        }

        res.status(200).json({
            success: true,
            token: data.session.access_token,
            refreshToken: data.session.refresh_token
        });
    } catch (err) {
        console.error('Refresh token error:', err);
        res.status(400).json({ success: false, error: err.message || 'Could not refresh token' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Logged out' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(400).json({ success: false, error: err.message });
    }
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

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Delete from Supabase Auth (requires service role key to use admin methods)
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Auth delete error:', authError);
            return res.status(400).json({ success: false, error: 'Failed to delete authentication record' });
        }

        // Note: Cascade deletes in Postgres should handle the rest (profiles, transactions, etc.)
        // If not, we'd manually delete them here.

        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ success: false, error: 'Server error during account deletion' });
    }
};
