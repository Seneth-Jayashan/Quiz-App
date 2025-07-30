const express = require('express');
const router = express.Router();

const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const questionRoutes = require('./routes/questionsRoutes');
const scoreRoutes = require('./routes/scoresRoutes');

router.use('/user', userRoutes);
router.use('/session', sessionRoutes);
router.use('/response', responseRoutes);
router.use('/question', questionRoutes);
router.use('/score', scoreRoutes);

module.exports = router;
