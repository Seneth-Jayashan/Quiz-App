// controllers/sessionController.js
const Session = require('../models/sessions');
const mongoose = require('mongoose');

// Create new session
exports.createSession = async (req, res) => {
  try {
    const hostId = req.user.id
    const { code, title, quizId, description } = req.body;
    if (!code || !hostId || !title || !quizId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check unique code
    const existing = await Session.findOne({ code });
    if (existing) return res.status(409).json({ message: 'Session code already exists' });

    const session = new Session({
      code,
      hostId,
      title,
      quizId,
      description: description || '',
      active: false
    });

    const saved = await session.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sessions
exports.getAllSessions = async (req, res) => {
  const hostId = req.user.id
  try {
    const sessions = await Session.find({hostId})
      .populate('quizId', 'title description');
    res.json(sessions);
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sessions
exports.getSessionsByQuiz = async (req, res) => {
  const quizId = req.params.quizId;
  try {
    const sessions = await Session.find({quizId})
    res.json(sessions);
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid session ID' });

    const session = await Session.findById(id)
      .populate('quizId', 'title description');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    res.json(session);
  } catch (error) {
    console.error('Get session by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get session by Code
exports.getSessionByCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) return res.status(404).json({ message: 'Required session Code' });

    const session = await Session.findOne({code})
    if (!session) return res.status(404).json({ message: 'Session not found' });

    res.json(session);
  } catch (error) {
    console.error('Get session by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update session by ID
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid session ID' });

    // Prevent code duplication on update if code is changing
    if (updateData.code) {
      const exists = await Session.findOne({ code: updateData.code, _id: { $ne: id } });
      if (exists) return res.status(409).json({ message: 'Session code already exists' });
    }

    const updatedSession = await Session.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedSession) return res.status(404).json({ message: 'Session not found' });

    res.json({ message: 'Session updated', session: updatedSession });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete session by ID
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid session ID' });

    const deletedSession = await Session.findByIdAndDelete(id);
    if (!deletedSession) return res.status(404).json({ message: 'Session not found' });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Activate or deactivate session
exports.setActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid session ID' });
    if (typeof active !== 'boolean') return res.status(400).json({ message: 'Active must be boolean' });

    const session = await Session.findByIdAndUpdate(id, { active }, { new: true });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    res.json({ message: `Session ${active ? 'activated' : 'deactivated'}`, session });
  } catch (error) {
    console.error('Set active status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
