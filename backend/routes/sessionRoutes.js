const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const {authMiddleware} = require('../middleware/authMiddleware');


router.post('/create', authMiddleware ,sessionController.createSession);
router.get('/sessions', authMiddleware , sessionController.getAllSessions);
router.get('/sessions/:quizId', authMiddleware , sessionController.getSessionsByQuiz);
router.get('/sessions/:id', authMiddleware , sessionController.getSessionById);
router.put('/sessions/:id', authMiddleware , sessionController.updateSession);
router.delete('/sessions/:id', authMiddleware , sessionController.deleteSession);
router.patch('/sessions/:id/active', authMiddleware , sessionController.setActiveStatus);

router.get('/participants/get/session/:code', sessionController.getSessionByCode);

module.exports = router;
