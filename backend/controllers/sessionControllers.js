const Session = require('../models/sessions');

exports.createSession = async (req, res) => {
  const { code, name, description, questionId } = req.body;
  const hostId = req.user.id;

  try {
    const existingSession = await Session.findOne({ code });

    if (existingSession) {
      return res.status(403).json({ message: "Session code already in use" });
    }

    const newSession = new Session({
      code,
      hostId,
      name,
      description,
      questionId,
    });

    await newSession.save();

    res.status(201).json({
      message: "New session created successfully",
      session: newSession,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create session",
      details: error.message,
    });
  }
};

exports.getSession = async (req, res) => {
  const { code } = req.params;

  try {
    const sessionData = await Session.findOne({ code }).populate("questionId");

    if (!sessionData) {
      return res.status(404).json({ message: "Invalid session code" });
    }

    res.status(200).json({
      message: "Session retrieved successfully",
      session: sessionData,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch the session",
      details: error.message,
    });
  }
};

exports.updateSession = async (req, res) => {
  const { code } = req.params;
  const { name, description, questionId } = req.body;

  try {
    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    if (questionId) updateData.questionId = questionId;

    const updatedSession = await Session.findOneAndUpdate(
      { code },
      updateData,
      { new: true }
    );

    if (!updatedSession) {
      return res.status(404).json({ message: "Invalid session code" });
    }

    res.status(200).json({
      message: "Session updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update the session",
      details: error.message,
    });
  }
};

exports.deleteSession = async (req, res) => {
  const { code } = req.params;

  try {
    const deletedSession = await Session.findOneAndDelete({ code });

    if (!deletedSession) {
      return res.status(404).json({ message: "Invalid session code" });
    }

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete the session",
      details: error.message,
    });
  }
};
