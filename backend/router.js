const express = require('express');
const router = express.Router();

const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

router.use('/user', userRoutes);
router.use('/session', sessionRoutes);
router.use('/response', responseRoutes);
router.use('/quiz', quizRoutes);
router.use('/score', scoreRoutes);
router.use('/payment', paymentRoutes);
router.use('/subscription', subscriptionRoutes);

module.exports = router;
