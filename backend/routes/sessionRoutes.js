const express = require('express');
const {
    createSession,
    getSession,
    getSessionsByHostId,
    updateSession,
    deleteSession
} = require('../controllers/sessionControllers');

const { authMiddleware } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post('/', authMiddleware, createSession);
router.get('/', authMiddleware, getSessionsByHostId);
router.get('/code/:code', getSession);
router.put('/:code', updateSession);
router.delete('/', deleteSession);

module.exports = router;
