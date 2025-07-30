const express = require('express');
const {
    submitVote,
    getResults,
    clearResponses
} = require('../controllers/responsesControllers');

const router = express.Router();

router.post('/', submitVote);
router.get('/:sessionCode/:questionId', getResults);
router.delete('/delete',  clearResponses )

module.exports = router;
