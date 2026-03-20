const Comments = require("../model/Comments");

exports.addComment = async (req,res)=>{
    try {
     const {text} = req.body;

    const comment = await Comments.create({
        text,
        user:req.user._id,
        idea:req.params.ideaId
    });

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

exports.deleteComment = async (req,res)=>{
    try {
        const comment = await Comments.findById(req.params.id);
        
        if(!comment){
            return res.status(404).json({ message: "Comment not found" });
        }

        if(comment.user.toString() !== req.user._id.toString()){
            return res.status(401).json({ message: "Not authorized" });
        }

        await comment.deleteOne();

        res.json({ message: "Comment deleted" });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}