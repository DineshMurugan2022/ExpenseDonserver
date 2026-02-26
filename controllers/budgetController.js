const supabase = require('../utils/supabase');

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create or Update budget
// @route   POST /api/budgets
// @access  Private
exports.upsertBudget = async (req, res, next) => {
    try {
        const { category, amount, period = 'monthly' } = req.body;

        // Upsert logic: if user+category already exists, update it
        const { data, error } = await supabase
            .from('budgets')
            .upsert({
                user_id: req.user.id,
                category,
                amount: parseFloat(amount),
                period
            }, { onConflict: 'user_id, category' })
            .select();

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: data[0]
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
