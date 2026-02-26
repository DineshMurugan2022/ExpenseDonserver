const supabase = require('../utils/supabase');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', req.user.id);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
exports.addTransaction = async (req, res, next) => {
    try {
        const { text, amount, category, currency = 'INR' } = req.body;

        const { data, error } = await supabase
            .from('transactions')
            .insert([
                { text, amount, category, user_id: req.user.id, currency }
            ])
            .select();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            data: data[0]
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            data: {}
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

// @desc    Get aggregate stats
// @route   GET /api/transactions/stats
// @access  Private
exports.getTransactionStats = async (req, res, next) => {
    try {
        // Supabase doesn't have a direct $group like Mongo, but we can do it via JS or RPC
        // For now, let's fetch all and aggregate in JS
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('category, amount')
            .eq('user_id', req.user.id);

        if (error) throw error;

        const stats = transactions.reduce((acc, curr) => {
            const found = acc.find(item => item.category === curr.category);
            if (found) {
                found.totalAmount += parseFloat(curr.amount);
            } else {
                acc.push({ category: curr.category, totalAmount: parseFloat(curr.amount) });
            }
            return acc;
        }, []);

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}
