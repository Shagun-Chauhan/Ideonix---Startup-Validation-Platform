const Notification = require("../model/Notification");

exports.getNotifications = async (req,res)=>{
    try {

        const notifications = await Notification.find({
            receiver : req.user._id,
        })
        .populate("sender" ,"name email")
        .sort({createdAt : -1});

        res.json(notifications);
        
    } catch (error) {
        res.status(500).json({message : error.message});
    }
};

exports.markAsRead = async (req,res)=>{
    try {
        await Notification.find(req.params.id,{
            read:true,
        })
        res.json({message : "Marked as read"});
    } catch (error) {
        res.status(500).json({message:"error.message"});
    }
};