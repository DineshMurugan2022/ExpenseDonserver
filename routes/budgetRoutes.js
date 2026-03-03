const express = require('express');
const { getBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const { validateBudget } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All budget routes protected

router.route('/')
    .get(getBudgets)
    .post(validateBudget, upsertBudget);

router.route('/:id')
    .delete(deleteBudget);

module.exports = router;
