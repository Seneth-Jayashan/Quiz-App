// controllers/scoreController.js
const Score = require('../models/scores');
const Quiz = require('../models/quizes');
const mongoose = require('mongoose');

// Create new score (quiz attempt)
exports.createScore = async (req, res) => {
  try {
    const { stdId, stdName, quiz: quizId, sessionCode, answers, totalQuestions } = req.body;
    if (!stdId || !stdName || !quizId || !sessionCode || !answers || totalQuestions == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch quiz with questions and options from DB
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correctAnswersCount = 0;

    // Check each answer correctness
    const validatedAnswers = answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) return { ...answer, isCorrect: false };

      const correctOptionIds = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt._id.toString());

      const selectedOptionIds = answer.selectedAnswers || [];
      // Compare sets for correctness
      const isCorrect =
        correctOptionIds.length === selectedOptionIds.length &&
        correctOptionIds.every(id => selectedOptionIds.includes(id));

      if (isCorrect) correctAnswersCount++;

      return { ...answer, isCorrect };
    });
    const scorePercentage = (correctAnswersCount / totalQuestions) * 100;

    const score = new Score({
      stdId,
      stdName,
      quiz: quizId,
      sessionCode,
      answers: validatedAnswers,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      scorePercentage,
    });

    const savedScore = await score.save();
    res.status(201).json(savedScore);
  } catch (error) {
    console.error('Create score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all scores
exports.getAllScores = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate('quiz', 'title description')
      .sort({ createdAt: -1 });
    res.json(scores);
  } catch (error) {
    console.error('Get all scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get scores by student ID
exports.getAllScoresByStudent = async (req, res) => {
  try {
    const { stdId } = req.params;
    const scores = await Score.find({ stdId }).populate('quiz', 'title description questions');
    res.json(scores);
  } catch (error) {
    console.error('Get scores by student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get scores by student ID
exports.getScoresByStudent = async (req, res) => {
  try {
    const { stdId,sessionCode } = req.params;
    const scores = await Score.find({ stdId,sessionCode }).populate('quiz', 'title description questions').sort({ createdAt: -1 });
    res.json(scores);
  } catch (error) {
    console.error('Get scores by student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get scores by session code
exports.getScoresBySession = async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const scores = await Score.find({ sessionCode }).populate('quiz', 'title description').sort({ createdAt: -1 });
    res.json(scores);
  } catch (error) {
    console.error('Get scores by session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update score by ID
exports.updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid score ID' });

    const updatedScore = await Score.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedScore) return res.status(404).json({ message: 'Score not found' });

    res.json({ message: 'Score updated', score: updatedScore });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete score by ID
exports.deleteScore = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid score ID' });

    const deletedScore = await Score.findByIdAndDelete(id);
    if (!deletedScore) return res.status(404).json({ message: 'Score not found' });

    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
