const Score = require('../models/scores');
const Question = require('../models/questions');


exports.createScore = async (req, res) => {
  try {
    const { stdId, stdName, sessionCode, answers } = req.body;

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q.correctAnswer;
    });

    let correctCount = 0;
    answers.forEach(a => {
      const correct = questionMap[a.questionId];
      if (correct !== undefined && correct === a.selectAnswer) {
        correctCount++;
      }
    });

    const score = new Score({
        stdId,
        stdName,
        sessionCode,
        answers,
        correctAnswers: correctCount
    });

    await score.save();

    res.status(200).json({
      message: 'Score saved successfully',
      correctAnswers: correctCount,
      totalAnswered: answers.length,
      stdId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving score', error: error.message });
  }
};

exports.getScores = async(req, res) => {
    const {stdId} = req.params;
    try{
        const score = await Score.findOne({stdId});

        if(!score){
            return res.status(404).json({message: 'No score found'});
        }

        res.status(200).json({
            message: `${score.stdName}'s Score found`,
            score
        });
    }catch(error){
        res.status(500).json({ message: 'Error fetching score', error: error.message });
    }
};

exports.clearScore = async(req, res) => {
    const {sessionCode} = req.body;
    try{
        const score = await Score.deleteMany({sessionCode});

        if(!score){
            return res.status(404).json({message: 'Invalid session Code'});
        }

        res.status(200).json({
            message: `All scores deleted under given session code`,
        });
    }catch(error){
        res.status(500).json({ message: 'Error deleting score', error: error.message });
    }
};
