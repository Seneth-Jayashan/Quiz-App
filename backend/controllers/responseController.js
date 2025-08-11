const Response = require('../models/responses');
const mongoose = require('mongoose');
const Quiz = require('../models/quizes');
const Session = require('../models/sessions');

// Helper: find or create a response
async function findOrCreateResponse(sessionCode, quizId, questionId) {
  let response = await Response.findOne({ sessionCode, quizId, questionId });
  if (!response) {
    response = new Response({
      sessionCode,
      quizId,
      questionId,
      answerCount: [],
      correctCount: 0,
      totalResponses: 0,
    });
    await response.save();
  }
  return response;
}

exports.incrementAnswerCounts = async (req, res) => {
  try {
    const { sessionCode, quizId, questionId, selectedOptions } = req.body;

    if (!sessionCode || !quizId || !questionId || !Array.isArray(selectedOptions)) {
      return res.status(400).json({ message: 'Missing or invalid fields' });
    }

    // Validate sessionCode as number
    const sessionCodeNum = Number(sessionCode);
    if (isNaN(sessionCodeNum)) {
      return res.status(400).json({ message: 'Invalid session code' });
    }

    // Verify session exists and user has access (optional, add if needed)

    // Fetch the quiz and question
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = quiz.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if answer is correct (assuming multiple correct options possible)
    const correctOptionIds = question.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt._id.toString());

    const isCorrect =
      correctOptionIds.length === selectedOptions.length &&
      correctOptionIds.every(id => selectedOptions.includes(id));

    // Find or create response document
    const response = await findOrCreateResponse(sessionCodeNum, quizId, questionId);

    response.totalResponses += 1;
    if (isCorrect) {
      response.correctCount += 1;
    }

    selectedOptions.forEach(optionId => {
      const answerItem = response.answerCount.find(
        a => a.optionId && a.optionId.toString() === optionId
      );
      if (answerItem) {
        answerItem.count += 1;
      } else {
        const objId = new mongoose.Types.ObjectId(optionId);
        response.answerCount.push({ optionId: objId, count: 1 });
      }
    });

    await response.save();
    res.json({ message: 'Response counts updated', isCorrect, response });
  } catch (error) {
    console.error('Increment answer counts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all responses for a session
exports.getAllResponses = async (req, res) => {
  try {
    const {sessionCode} = req.params;
    const userId = req.user.id;
    if (!sessionCode) {
      return res.status(400).json({ message: 'Session code is required' });
    }

    const session = await Session.findOne({ code: sessionCode });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.hostId !== userId) {
      return res.status(403).json({ message: 'You do not have access to this session' });
    }

    const responses = await Response.find({ sessionCode }).populate('quizId', 'title description questions').sort({ createdAt: -1 });

    res.json(responses);
  } catch (error) {
    console.error('Get all responses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get one response by composite keys
exports.getResponseByIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionCode, quizId, questionId } = req.params;

    if (
      !sessionCode ||
      !mongoose.Types.ObjectId.isValid(quizId) ||
      !mongoose.Types.ObjectId.isValid(questionId)
    ) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const sessionCodeNum = Number(sessionCode);
    if (isNaN(sessionCodeNum)) {
      return res.status(400).json({ message: 'Invalid session code' });
    }

    const session = await Session.findOne({ code: sessionCodeNum });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.hostId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have access to this session' });
    }

    const response = await Response.findOne({ sessionCode: sessionCodeNum, quizId, questionId }).populate(
      'quizId',
      'title'
    );
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    res.json(response);
  } catch (error) {
    console.error('Get response by IDs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete one response by ID
exports.deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid response ID' });
    }

    const deleted = await Response.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Response not found' });
    }

    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ======================
   RESETTING FUNCTIONS
====================== */

// Reset all responses for a session
exports.resetSessionResponses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionCode } = req.params;

    if (!sessionCode) {
      return res.status(400).json({ message: 'Session code required' });
    }

    const sessionCodeNum = Number(sessionCode);
    if (isNaN(sessionCodeNum)) {
      return res.status(400).json({ message: 'Invalid session code' });
    }

    const session = await Session.findOne({ code: sessionCodeNum });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.hostId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have access to this session' });
    }

    const result = await Response.deleteMany({ sessionCode: sessionCodeNum });
    res.json({ message: `All responses for session ${sessionCodeNum} reset`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Reset session responses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset all responses for a quiz in a session
exports.resetQuizResponses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionCode, quizId } = req.params;

    if (!sessionCode || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid session code or quiz ID' });
    }

    const sessionCodeNum = Number(sessionCode);
    if (isNaN(sessionCodeNum)) {
      return res.status(400).json({ message: 'Invalid session code' });
    }

    const session = await Session.findOne({ code: sessionCodeNum });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.hostId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have access to this session' });
    }

    const result = await Response.deleteMany({ sessionCode: sessionCodeNum, quizId });
    res.json({
      message: `Responses for quiz ${quizId} in session ${sessionCodeNum} reset`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Reset quiz responses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset responses for a single question
exports.resetQuestionResponses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionCode, quizId, questionId } = req.params;

    if (
      !sessionCode ||
      !mongoose.Types.ObjectId.isValid(quizId) ||
      !mongoose.Types.ObjectId.isValid(questionId)
    ) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const sessionCodeNum = Number(sessionCode);
    if (isNaN(sessionCodeNum)) {
      return res.status(400).json({ message: 'Invalid session code' });
    }

    const session = await Session.findOne({ code: sessionCodeNum });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.hostId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have access to this session' });
    }

    const result = await Response.deleteOne({ sessionCode: sessionCodeNum, quizId, questionId });
    res.json({ message: `Responses for question ${questionId} reset`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Reset question responses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
