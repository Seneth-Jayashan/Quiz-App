// routes/responseRoutes.js
const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const {authMiddleware} = require('../middleware/authMiddleware');


router.post('/increment', responseController.incrementAnswerCounts);
router.get('/session/:sessionCode', authMiddleware, responseController.getAllResponses);
router.get('/:sessionCode/:quizId/:questionId', authMiddleware, responseController.getResponseByIds);
router.delete('/:id', authMiddleware, responseController.deleteResponse);

// Reset endpoints
router.delete('/reset/session/:sessionCode', authMiddleware, responseController.resetSessionResponses);
router.delete('/reset/session/:sessionCode/quiz/:quizId', authMiddleware, responseController.resetQuizResponses);
router.delete('/reset/session/:sessionCode/quiz/:quizId/question/:questionId', authMiddleware, responseController.resetQuestionResponses);

module.exports = router;
