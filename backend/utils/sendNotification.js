const Notification = require("../model/Notification");

const sendNotification = async ({
    req,
    receiverId,
    senderId,
    type,
    message,
}) => {
    if(receiverId.toString() === senderId.toString()) return;

    const notification = await Notification.create({
        receiver :receiverId,
        sender:senderId,
        type,
        message
    });

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const socketId = onlineUsers.get(receiverId.toString());
    
    if(socketId){
        io.to(socketId).emit("newNotification",notification);
    }

    console.log("Notification sent : ", message);
};
module.exports = sendNotification;