const express = require('express');
const { getTransactions, addTransaction, deleteTransaction, getTransactionStats } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All transaction routes are protected

router.route('/')
    .get(getTransactions)
    .post(addTransaction);

router.get('/stats', getTransactionStats);

router.route('/:id')
    .delete(deleteTransaction);

module.exports = router;
