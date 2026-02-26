const supabase = require('../utils/supabase');

// @desc    Get all debts
// @route   GET /api/debts
// @access  Private
exports.getDebts = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('debts')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add new debt
// @route   POST /api/debts
// @access  Private
exports.addDebt = async (req, res, next) => {
    try {
        const { name, total_amount, remaining_amount, interest_rate, next_emi_date, category, emi_amount, currency = 'INR' } = req.body;

        const { data, error } = await supabase
            .from('debts')
            .insert([
                {
                    user_id: req.user.id,
                    name,
                    total_amount,
                    remaining_amount: remaining_amount || total_amount,
                    interest_rate,
                    next_emi_date,
                    category,
                    emi_amount,
                    currency
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update debt (e.g., record a payment)
// @route   PATCH /api/debts/:id
// @access  Private
exports.updateDebt = async (req, res, next) => {
    try {
        const { remaining_amount, next_emi_date } = req.body;

        const { data, error } = await supabase
            .from('debts')
            .update({
                remaining_amount,
                next_emi_date,
                updated_at: new Date()
            })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            const error = new Error('Debt not found');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete debt
// @route   DELETE /api/debts/:id
// @access  Private
exports.deleteDebt = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('debts')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
