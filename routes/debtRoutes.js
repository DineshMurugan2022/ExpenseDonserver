const express = require('express');
const router = express.Router();
const {
    getDebts,
    addDebt,
    updateDebt,
    deleteDebt
} = require('../controllers/debtController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getDebts)
    .post(addDebt);

router.route('/:id')
    .patch(updateDebt)
    .delete(deleteDebt);

module.exports = router;
