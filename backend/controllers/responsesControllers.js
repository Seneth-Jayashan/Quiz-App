const Response = require('../models/responses');
const Question = require('../models/questions');


exports.submitVote = async (req, res) => {
  try {
    const { sessionCode, questionId, selectedOption } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = question.correctAnswer === selectedOption;

    let responseDoc = await Response.findOne({ sessionCode, questionId });

    if (!responseDoc) {
      const initialCounts = question.options.map((opt, i) => ({
        optionNumber: i + 1,
        count: 0,
      }));

      responseDoc = new Response({
        sessionCode,
        questionId,
        answerCount: initialCounts,
        correctCount: 0,
      });
    }

    const answerItem = responseDoc.answerCount.find(
      (item) => item.optionNumber === selectedOption
    );
    if (answerItem) {
      answerItem.count += 1;
    }

    if (isCorrect) {
      responseDoc.correctCount += 1;
    }

    await responseDoc.save();

    return res.json({
      message: "Vote recorded",
      results: responseDoc,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.getResults = async (req, res) => {
  try {
    const { sessionCode, questionId } = req.params;

    const responseDoc = await Response.findOne({ sessionCode, questionId });

    if (!responseDoc) {
      return res.status(404).json({ error: "No results found yet" });
    }

    return res.json({
      results: responseDoc,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.clearResponses = async(req, res) => {
  const {sessionCode} = req.body;


  try{
    const responses = await Response.deleteMany({sessionCode});

    if(!responses){
      return res.status(200).json({message: 'No responses found'});
    }

    res.status(200).json({message: 'All response deleted belongs to this session code'});
  }catch(error){
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}