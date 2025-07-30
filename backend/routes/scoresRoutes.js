const express = require('express');
const {
    createScore,
    getScores,
    clearScore,
    getSessionScores,
} = require('../controllers/scoresController');

const router = express.Router();

router.post('/',createScore);

router.get('/session/:sessionCode', getSessionScores);

router.get('/:stdId', getScores );

router.delete('/', clearScore);

module.exports = router;