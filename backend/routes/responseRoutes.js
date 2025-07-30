const express = require('express');
const {
    submitVote,
    getResults,
    clearResponses
} = require('../controllers/responsesControllers');
const {authMiddleware} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', submitVote);
router.get('/:sessionCode/:questionId', getResults);
router.delete('/delete', authMiddleware, clearResponses )

module.exports = router;
