const express = require('express');
const router = express.Router();
const {
    getRecurringTransactions,
    addRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringStatus
} = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getRecurringTransactions)
    .post(addRecurringTransaction);

router.route('/:id')
    .delete(deleteRecurringTransaction);

router.route('/:id/toggle')
    .patch(toggleRecurringStatus);

module.exports = router;
