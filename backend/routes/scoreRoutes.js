const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.post('/create', scoreController.createScore);
router.get('/scores', scoreController.getAllScores);
router.get('/scores/student/:stdId', scoreController.getAllScoresByStudent);
router.get('/scores/student/:sessionCode/:stdId', scoreController.getScoresByStudent);
router.get('/scores/session/:sessionCode', scoreController.getScoresBySession);
router.put('/scores/:id', scoreController.updateScore);
router.delete('/scores/:id', scoreController.deleteScore);

module.exports = router;
