const supabase = require('../utils/supabase');

// @desc    Get all recurring transactions for a user
// @route   GET /api/recurring
// @access  Private
exports.getRecurringTransactions = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a recurring transaction
// @route   POST /api/recurring
// @access  Private
exports.addRecurringTransaction = async (req, res, next) => {
    try {
        const { text, amount, category, frequency, start_date, currency = 'INR' } = req.body;

        const { data, error } = await supabase
            .from('recurring_transactions')
            .insert([{
                user_id: req.user.id,
                text,
                amount,
                category,
                frequency,
                start_date,
                next_date: start_date, // Initially same as start_date
                is_active: true,
                currency
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: data[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a recurring transaction
// @route   DELETE /api/recurring/:id
// @access  Private
exports.deleteRecurringTransaction = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('recurring_transactions')
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

// @desc    Toggle recurring transaction status
// @route   PATCH /api/recurring/:id/toggle
// @access  Private
exports.toggleRecurringStatus = async (req, res, next) => {
    try {
        const { data: current } = await supabase
            .from('recurring_transactions')
            .select('is_active')
            .eq('id', req.params.id)
            .single();

        const { error } = await supabase
            .from('recurring_transactions')
            .update({ is_active: !current.is_active })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: { is_active: !current.is_active }
        });
    } catch (error) {
        next(error);
    }
};
