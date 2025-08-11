// controllers/quizController.js
const Quiz = require('../models/quizes');
const mongoose = require('mongoose');

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, category, questions, timeLimit } = req.body;
    const createdBy = req.user.id;
    if (!title || !createdBy) {
      return res.status(400).json({ message: 'Title and createdBy are required' });
    }

    const quiz = new Quiz({
      title,
      description: description || '',
      category: category || null,
      createdBy,
      questions: questions || [],
      timeLimit: timeLimit || null,
      isPublished: false
    });

    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  const createdBy = req.user.id;
  try {
    const quizzes = await Quiz.find({createdBy});
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Get all quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID' });

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get quiz by ID
exports.getQuizBySessionQuizId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID' });

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update quiz by ID
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID' });

    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json({ message: 'Quiz updated', quiz: updatedQuiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete quiz by ID
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID' });

    const deletedQuiz = await Quiz.findByIdAndDelete(id);
    if (!deletedQuiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Publish/unpublish quiz
exports.setPublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID' });
    if (typeof isPublished !== 'boolean') return res.status(400).json({ message: 'isPublished must be boolean' });

    const quiz = await Quiz.findByIdAndUpdate(id, { isPublished }, { new: true });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json({ message: `Quiz ${isPublished ? 'published' : 'unpublished'}`, quiz });
  } catch (error) {
    console.error('Set publish status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all published quizzes
exports.getPublishedQuizzes = async (req, res) => {
  const createdBy = req.user.id;
  try {
    const quizzes = await Quiz.find({createdBy, isPublished: true });
    res.json(quizzes);
  } catch (error) {
    console.error('Get published quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
