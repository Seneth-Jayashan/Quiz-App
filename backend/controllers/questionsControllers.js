const Question = require('../models/questions');


exports.createQuestion = async (req, res) => {
  const { text, options, correctAnswer } = req.body;
  console.log(req.body);

  try {
    const hostId = req.user.id; 
  console.log(hostId);

    const newQuestion = new Question({
      text,
      hostId,
      options: options.map((opt, index) => ({
        optionNumber: opt.optionNumber || index + 1,  // or just use the provided optionNumber
        optionText: opt.optionText // <-- This is the string, not the whole object
      })),
      correctAnswer
    });

    await newQuestion.save();
    res.status(200).json({ message: "Question created successfully", question: newQuestion });
  } catch (error) {
    console.log(error);
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
    console.log(hostId);
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
    console.log('updatedQuestion:', JSON.stringify(req.body, null, 2));

    if (!questionId) {
      return res.status(400).json({ message: "Question ID is required" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Question text is required" });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "At least two options are required" });
    }

    // Sanitize options: trim strings and validate
    const sanitizedOptions = options.map((opt, index) => {
      if (!opt.optionText || typeof opt.optionText !== "string" || !opt.optionText.trim()) {
        throw new Error(`Option text for option ${index + 1} is invalid`);
      }
      return {
        optionNumber: opt.optionNumber || index + 1,
        optionText: opt.optionText.trim(),
      };
    });

    if (
      !correctAnswer ||
      !sanitizedOptions.some((opt) => opt.optionNumber === correctAnswer)
    ) {
      return res.status(400).json({ message: "Correct answer must match one of the options" });
    }

    const updatedData = {
      text: text.trim(),
      options: sanitizedOptions,
      correctAnswer,
    };

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
    console.error(error);
    res.status(500).json({ error: "Failed to update question", details: error.message });
  }
};


exports.deleteQuestion = async (req, res) => {
  try {
    const questionId  = req.body.id;
    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question", details: error.message });
  }
};
