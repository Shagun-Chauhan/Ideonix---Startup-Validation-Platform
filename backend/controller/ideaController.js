const Idea = require("../model/Idea")
const NDA = require("../model/NDA");
const mongoose = require("mongoose");

const calculateValidationScore = (idea) => {
  const upvotes = idea.votes.filter(v => v.voteType === "upvote").length;
  const downvotes = idea.votes.filter(v => v.voteType === "downvote").length;

  const voteScore = upvotes - downvotes;

  const score =
    voteScore +
    idea.commentsCount +
    idea.views * 0.1;

  let level = "Low Potential";

  if (score > 20) level = "High Potential";
  else if (score > 10) level = "Medium Potential";

  return {
    score,
    level,
    upvotes,
    downvotes
  };
};

exports.createIdea = async (req,res)=>{
    try {

        const {title , description ,visibility ,category ,tags} = req.body;

        if (!title || !description) {
            return res.status(400).json({
              message: "Title and description are required"
            });
          }

          if (title.length < 3) {
            return res.status(400).json({ message: "Title too short" });
          }
      
          if (tags && !Array.isArray(tags)) {
            return res.status(400).json({ message: "Tags must be an array" });
          }
      
          const validVisibility = ["public", "private", "protected"];
          if (visibility && !validVisibility.includes(visibility)) {
            return res.status(400).json({ message: "Invalid visibility" });
          }

        const idea = await Idea.create({
            title,
            description,
            category,
            tags,
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

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1 ) * limit;
        
        const keyword = req.query.keyword ? {
            title : {
                $regex : req.query.keyword,
                $options:"i"
            }
        } : {};

        const categoryFilter = req.query.category
        ? {
            category: {
              $regex: req.query.category,
              $options: "i"
            }
          }
        : {};

        const tagsFilter = req.query.tags ? {
            tags : { $in : req.query.tags.split(",")}
        } : {};


      let visibilityFilter = [{ visibility: "public" }];
  
      if (req.user) {
        visibilityFilter.push({ user: req.user._id });
  
        visibilityFilter.push({
          visibility: "protected",
          allowedUsers: { $in: [req.user._id] }
        });
      }

      const finalQuery = {
        $and : [
            {$or:visibilityFilter},
            keyword,
            categoryFilter,
            tagsFilter
        ]
      };
  
      const ideas = await Idea.find(finalQuery)
        .populate("user", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt : -1});

        const total = await Idea.countDocuments(finalQuery);

        const ideasWithScore = ideas.map((idea) => {
          const result = calculateValidationScore(idea);
        
          return {
            ...idea.toObject(),
            validationScore: result.score,
            potential: result.level
          };
        });
        
        res.json({
          page,
          totalPages: Math.ceil(total / limit),
          totalIdea: total,
          ideas: ideasWithScore
        });
      
      // res.json({
      //   page,
      //   totalPages : Math.ceil(total/limit),
      //   totalIdea : total,
      //   ideas
      // });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  exports.getIdeaById = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid Idea ID" });
      }
  
      const idea = await Idea.findById(req.params.id);
  
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
  
      const isOwner =
        req.user && idea.user.toString() === req.user._id.toString();
  
      const isAllowed = idea.allowedUsers?.some(
        (userId) => userId.toString() === req.user?._id?.toString()
      );
  
      if (idea.visibility === "private") {
        if (!isOwner && !isAllowed) {
          return res.status(403).json({ message: "Private idea - access denied" });
        }
      }
  
      if (idea.visibility === "protected") {
        const hasAcceptedNDA = await NDA.findOne({
          user: req.user?._id,
          idea: idea._id
        });
  
        if (!isOwner && !isAllowed && !hasAcceptedNDA) {
          return res.status(403).json({
            message: "Please accept NDA to view full idea",
            requiresNDA: true
          });
        }
      }
  
      idea.views += 1;
      await idea.save();
  
      const result = calculateValidationScore(idea);
  
      res.json({
        ...idea.toObject(),
        validationScore: result.score,
        potential: result.level,
        upvotes: result.upvotes,
        downvotes: result.downvotes
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.updateIdea = async (req,res)=>{
    try {
        const idea = await Idea.findById(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Idea ID" });
          }
      
        if(!idea){
            return res.status(404).json({message:"Idea not found"})
        }

          if (req.body.title && req.body.title.length < 3) {
            return res.status(400).json({ message: "Title too short" });
          }
      
          if (req.body.tags && !Array.isArray(req.body.tags)) {
            return res.status(400).json({ message: "Tags must be array" });
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
          if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Idea ID" });
          }
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

        const result = calculateValidationScore(idea);

        res.json({
          message: "Vote Updated",
          validationScore: result.score,
          potential: result.level,
          upvotes: result.upvotes,
          downvotes: result.downvotes
        });        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
