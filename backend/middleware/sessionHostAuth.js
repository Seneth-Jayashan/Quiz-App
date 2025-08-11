// middleware/sessionAuth.js
const Session = require('../models/sessions');

async function sessionAuthMiddleware(req, res, next) {
  try {
    const userId = req.user.id;

    // You can pass sessionCode via params, query, or body depending on the route
    const sessionCode =
      req.params.sessionCode || req.query.sessionCode || req.body.sessionCode;

    if (!sessionCode) {
      return res.status(400).json({ message: 'Session code required' });
    }

    const session = await Session.findOne({ code: sessionCode });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.hostId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have access to this session' });
    }

    // Attach session to req for downstream handlers if needed
    req.session = session;
    next();
  } catch (error) {
    console.error('Session authorization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = sessionAuthMiddleware;
