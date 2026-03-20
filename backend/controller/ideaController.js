const Idea = require("../model/Idea")

exports.createIdea = async (req,res)=>{
    try {

        const {title , description ,visibility} = req.body;

        const idea = await Idea.create({
            title,
            description,
            user:req.user,
            visibility : visibility || "public"
        })
        
        res.status(201).json(idea);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllIdeas = async (req, res) => {
    try {
      let filter = [{ visibility: "public" }];
  
      if (req.user) {
        filter.push({ user: req.user._id });
  
        filter.push({
          visibility: "protected",
          allowedUsers: { $in: [req.user._id] }
        });
      }
  
      const ideas = await Idea.find({
        $or: filter
      }).populate("user", "name email");
  
      res.json(ideas);
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
exports.getIdeaById = async (req,res)=>{
        try {
            const idea = await Idea.findById(req.params.id)
            if(!idea){
                return res.status(404).json({ message: "Idea not found" });
            }
            if (idea.visibility === "private") {
                const isOwner =
                  req.user && idea.user.toString() === req.user._id.toString();
              
                const isAllowed =
                  req.user &&
                  idea.allowedUsers.some(
                    (userId) => userId.toString() === req.user._id.toString()
                  );
              
                if (!isOwner && !isAllowed) {
                  return res.status(403).json({ message: "Private idea - access denied" });
                }
              }
            if(idea.visibility==="protected"){
                const isOwner = idea.user.toString()=== req.user?._id?.toString();
                const isAllowed = idea.allowedUsers.some(
                    (userId) => userId.toString() === req.user?._id?.toString()
                );
                if(!isOwner && !isAllowed){
                    return res.status(403).json({ message: "NDA access required" });
                }
            }
            res.json(idea);
        } catch (error) {
            return res.status(404).json({ message: "Idea not found" });
        }
};

exports.updateIdea = async (req,res)=>{
    try {
        const idea = await Idea.findById(req.params.id);
        if(!idea){
            return res.status(404).json({message:"Idea not found"})
        }
        if(idea.user.toString() !== req.user._id.toString()){
            return res.status(401).json({message:"Not authorized"})
        }

        idea.title = req.body.title || idea.title;
        idea.description = req.body.description || idea.description;

        const updatedIdea = await idea.save();

        res.json(updatedIdea);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteIdea=async (req,res)=>{
    try {

        const idea = await Idea.findById(req.params.id);
        if(!idea){
            return res.status(404).json({message:"Idea not found"})
        }

        if(idea.user.toString() !== req.user._id.toString()){
            return res.status(401).json({ message: "Not authorized" });
        }
        
        await idea.deleteOne();

    res.json({ message: "Idea deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.voteIdea = async (req,res)=>{
    try {
        const {voteType} = req.body;
        const idea = await Idea.findById(req.params.id);
        if(!idea){
            return res.status(404).json({message:"Idea not found"});
        }

        const existingVote = idea.votes.find((v)=>v.user.toString() === req.user._id.toString());

        if(existingVote){
            if(existingVote.voteType===voteType){
                idea.votes = idea.votes.filter((v)=>v.user.toString() !== req.user._id.toString());
            }
            else{
                existingVote.voteType = voteType;
            }
        }else{
            idea.votes.push({
                user:req.user._id,
                voteType
            });
        }

        await idea.save();

        res.json({message:"Vote Updated",votes : idea.votes})
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}