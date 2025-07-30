const express = require('express');
const {
    createScore,
    getScores,
    clearScore
} = require('../controllers/scoresController');

const {authMiddleware} = require('../middleware/authMiddleware');


const router = express.Router();

router.post('/',createScore);
router.get('/:stdId', getScores );
router.delete('/', clearScore);

module.exports = router;