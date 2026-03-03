const supabase = require('../utils/supabase');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }

        // Fetch profile for data compatibility (name, currency, etc.)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.warn('Profile fetch warning in middleware:', profileError.message);
        }

        // Attach both auth user and profile info for flexibility
        req.user = {
            ...user,
            ...(profile || {})
        };

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};
