const AccessRequest = require("../model/AccessRequest");
const Idea = require("../model/Idea");

exports.requestAccess = async (req,res)=>{
    try {
        const ideaId = req.params.ideaId;
        
        const existing = await AccessRequest.findOne({
            idea:ideaId,
            requester : req.user._id
        });
        if (existing) {
            return res.status(400).json({ message: "Already requested" });
          }
          const request = await AccessRequest.create({
            idea:ideaId,
            requester:req.user._id
          });

          res.status(201).json(request)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRequests = async (req,res)=>{
    try {
        const ideaId = req.params.ideaId;

        const idea = await Idea.findById(ideaId);

        if(idea.user.toString() !== req.user._id.toString()){
            return res.status(401).json({ message: "Not authorized" });
        }

        const requests = await AccessRequest.find({idea:ideaId})
        .populate("requester","name email");

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRequest = async (req,res)=>{
    try {
        const {status} = req.body;

        const request = await AccessRequest.findById(req.params.id)
        .populate("idea");

        if(!request){
                return res.status(404).json({ message: "Request not found" });
        }

        if(request.idea.user.toString() !== req.user._id.toString()){
            return res.status(401).json({message:"Not authorized"});
        }

        request.status = status;

        if (status === "approved") {
            await Idea.findByIdAndUpdate(request.idea._id, {
              $addToSet: { allowedUsers: request.requester }
            });
          }

        await request.save();

        res.json({message : "Request Updated",request});
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};