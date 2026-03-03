const supabase = require('../utils/supabase');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
    try {
        // Support pagination via query params
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const offset = (page - 1) * limit;

        // Retrieve with count for pagination
        const { data, error, count } = await supabase
            .from('transactions')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            count,
            page,
            limit,
            data: data || []
        });
    } catch (err) {
        console.error('Error in getTransactions:', err);
        next(err);
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
        console.error('Error in addTransaction:', err);
        next(err);
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
        console.error('Error in deleteTransaction:', err);
        next(err);
    }
}

// @desc    Get aggregate stats
// @route   GET /api/transactions/stats
// @access  Private
exports.getTransactionStats = async (req, res, next) => {
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('category, amount, created_at')
            .eq('user_id', req.user.id);

        if (error) throw error;

        // 1. Group by Category
        const categoryStats = transactions.reduce((acc, curr) => {
            const found = acc.find(item => item.category === curr.category);
            const amount = parseFloat(curr.amount);
            if (found) {
                found.totalAmount += amount;
            } else {
                acc.push({ category: curr.category, totalAmount: amount });
            }
            return acc;
        }, []);

        // 2. Group by Month (for charts)
        const monthlyDataMap = transactions.reduce((acc, t) => {
            const date = new Date(t.created_at);
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const key = `${month} ${year}`;

            if (!acc[key]) {
                acc[key] = { name: month, income: 0, expense: 0, sortKey: new Date(year, date.getMonth(), 1) };
            }

            const amount = parseFloat(t.amount);
            if (amount > 0) {
                acc[key].income += amount;
            } else {
                acc[key].expense += Math.abs(amount);
            }
            return acc;
        }, {});

        // 3. Category Spent This Month (for Budgets)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const categorySpentThisMonth = transactions
            .filter(t => {
                const d = new Date(t.created_at);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((acc, curr) => {
                if (parseFloat(curr.amount) < 0) {
                    acc[curr.category] = (acc[curr.category] || 0) + Math.abs(parseFloat(curr.amount));
                }
                return acc;
            }, {});

        // Sort and get last 12 months (or fewer)
        const monthlyStats = Object.values(monthlyDataMap)
            .sort((a, b) => a.sortKey - b.sortKey)
            .map(({ name, income, expense }) => ({ name, income, expense }))
            .slice(-12);

        return res.status(200).json({
            success: true,
            data: {
                categoryStats,
                monthlyStats,
                categorySpentThisMonth
            }
        });
    } catch (err) {
        console.error('Error in getTransactionStats:', err);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}
