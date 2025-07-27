const Question = require('../models/questions');


exports.createQuestion = async (req, res) => {
  const { text, options, correctAnswer } = req.body;

  try {
    const hostId = req.user.id; 

    const newQuestion = new Question({
      text,
      hostId,
      options: options.map((opt, index) => ({
        optionNumber: index + 1,
        optionText: opt
      })),
      correctAnswer
    });

    await newQuestion.save();
    res.status(200).json({ message: "Question created successfully", question: newQuestion });
  } catch (error) {
    res.status(500).json({ error: "Failed to create question", details: error.message });
  }
};

exports.getAllQuestionsById = async (req, res) => {
  try {
    const { questionIds } = req.body;

    const questions = await Question.find({ _id: { $in: questionIds } });
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found for these IDs" });
    }

    res.status(200).json({ message: "Questions retrieved successfully", questions });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve questions", details: error.message });
  }
};

exports.getAllQuestionsByHostId = async (req, res) => {
  try {
    const hostId = req.user.id;

    const questions = await Question.find({ hostId });
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    res.status(200).json({ message: "Questions retrieved successfully", questions });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve questions", details: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { questionId, text, options, correctAnswer } = req.body;

    // Format options with numbering if provided
    let updatedData = { text, correctAnswer };
    if (options) {
      updatedData.options = options.map((opt, index) => ({
        optionNumber: index + 1,
        optionText: opt
      }));
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      updatedData,
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question updated successfully", question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ error: "Failed to update question", details: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.body;

    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question", details: error.message });
  }
};
