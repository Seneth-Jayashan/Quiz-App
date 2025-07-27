const express = require('express');
const {
    createSession,
    getSession,
    updateSession,
    deleteSession
} = require('../controllers/sessionControllers');

const { authMiddleware } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post('/', authMiddleware, createSession);
router.get('/:code', getSession);
router.put('/:code', updateSession);
router.delete('/:code', deleteSession);

module.exports = router;
