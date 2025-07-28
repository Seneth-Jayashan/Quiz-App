const express = require('express');
const {
    createQuestion,
    getAllQuestionsById,
    getQuestion,
    getAllQuestionsByHostId,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionsControllers');

const {authMiddleware} = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createQuestion);
router.get('/', getAllQuestionsById);
router.get('/my', authMiddleware, getAllQuestionsByHostId);
router.get('/:questionId', getQuestion);
router.put('/', updateQuestion);
router.delete('/', deleteQuestion);

module.exports = router;
