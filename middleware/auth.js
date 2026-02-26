const jwt = require('jsonwebtoken');
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
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', decoded.id);

        if (error || !users || users.length === 0) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }

        req.user = users[0];

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};
