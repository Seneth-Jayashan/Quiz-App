const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const {authMiddleware} = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, quizController.createQuiz);
router.get('/quizzes', authMiddleware, quizController.getAllQuizzes);
router.get('/quizzes/published', authMiddleware, quizController.getPublishedQuizzes);
router.get('/quizzes/:id', authMiddleware, quizController.getQuizById);

router.put('/quizzes/:id', authMiddleware, quizController.updateQuiz);
router.delete('/quizzes/:id', authMiddleware, quizController.deleteQuiz);
router.patch('/quizzes/:id/publish', authMiddleware, quizController.setPublishStatus);


router.get('/participants/get/quiz/:id', quizController.getQuizBySessionQuizId);
module.exports = router;
