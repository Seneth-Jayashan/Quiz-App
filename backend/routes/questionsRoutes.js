const express = require('express');
const {
    createQuestion,
    getAllQuestionsById,
    getAllQuestionsByHostId,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionsControllers');

const {authMiddleware} = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createQuestion);
router.get('/', getAllQuestionsById);
router.get('/questions', authMiddleware, getAllQuestionsByHostId);
router.put('/', updateQuestion);
router.delete('/', deleteQuestion);

module.exports = router;
