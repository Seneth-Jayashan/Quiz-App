const express = require('express');
const {
    submitVote,
    getResults
} = require('../controllers/responsesControllers');

const router = express.Router();

router.post('/', submitVote);
router.get('/:sessionCode/:questionId', getResults);

module.exports = router;
