const express = require('express');
const { getBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All budget routes protected

router.route('/')
    .get(getBudgets)
    .post(upsertBudget);

router.route('/:id')
    .delete(deleteBudget);

module.exports = router;
