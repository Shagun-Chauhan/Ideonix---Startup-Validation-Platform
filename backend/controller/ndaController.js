const NDA = require("../model/NDA");
const sendNotification = require("../utils/sendNotification");

exports.acceptNDA = async (req,res)=>{
    try {

        const {ideaId} = req.params;

        const existing = await NDA.findOne({
            user :req.user._id,
            idea:ideaId
        })

        if(existing){
            return res.json({message : "Already accepted NDA"});
        }

        const nda = await NDA.create({
            user:req.user._id,
            idea:ideaId
        });

        await sendNotification({
            req,
            receiverId : idea.user,
            senderId : req.user.id,
            type:"nda",
            message : `${req.user.name} accepted NDA`,
        })

        res.status(201).json({message:"NDA accepted",nda});
        
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}