
const mongoose = require("mongoose");
const Comments = require("../model/Comments");
const Idea = require("../model/Idea");

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.ideaId)) {
      return res.status(400).json({ message: "Invalid Idea ID" });
    }

    const idea = await Idea.findById(req.params.ideaId);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const comment = await Comments.create({
      text,
      user: req.user._id,
      idea: req.params.ideaId
    });

    idea.commentsCount += 1;
    await idea.save();

    res.status(201).json(comment);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComments = async (req,res)=>{
    try {
        const comments = await Comments.find({idea:req.params.ideaId}).populate("user","name email");
         res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid Comment ID" });
      }
  
      const comment = await Comments.findById(req.params.id);
  
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
  
      if (comment.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
      }
  
      const idea = await Idea.findById(comment.idea);
      if (idea) {
        idea.commentsCount -= 1;
        await idea.save();
      }
  
      await comment.deleteOne();
  
      res.json({ message: "Comment deleted" });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };