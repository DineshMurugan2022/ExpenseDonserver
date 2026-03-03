const validateTransaction = (req, res, next) => {
    const { text, amount, category } = req.body;

    if (!text || !amount || !category) {
        return res.status(400).json({
            success: false,
            error: 'text, amount, and category are required'
        });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) === 0) {
        return res.status(400).json({
            success: false,
            error: 'amount must be a non-zero number'
        });
    }

    next();
};

const validateBudget = (req, res, next) => {
    const { category, amount } = req.body;

    if (!category || !amount) {
        return res.status(400).json({
            success: false,
            error: 'category and amount are required'
        });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'amount must be a positive number'
        });
    }

    next();
};

const validateDebt = (req, res, next) => {
    const { name, total_amount, emi_amount } = req.body;

    if (!name || !total_amount || !emi_amount) {
        return res.status(400).json({
            success: false,
            error: 'name, total_amount, and emi_amount are required'
        });
    }

    if (isNaN(parseFloat(total_amount)) || parseFloat(total_amount) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'total_amount must be a positive number'
        });
    }

    if (isNaN(parseFloat(emi_amount)) || parseFloat(emi_amount) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'emi_amount must be a positive number'
        });
    }

    next();
};

const validateRecurring = (req, res, next) => {
    const { text, amount, category, frequency, start_date } = req.body;

    if (!text || !amount || !category || !frequency || !start_date) {
        return res.status(400).json({
            success: false,
            error: 'text, amount, category, frequency, and start_date are required'
        });
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({
            success: false,
            error: 'frequency must be one of: daily, weekly, monthly, yearly'
        });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) === 0) {
        return res.status(400).json({
            success: false,
            error: 'amount must be a non-zero number'
        });
    }

    next();
};

module.exports = {
    validateTransaction,
    validateBudget,
    validateDebt,
    validateRecurring
};
