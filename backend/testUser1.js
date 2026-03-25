const {io} = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.emit("register","69bbb3b19989ad9fee68e0c5");

socket.on("newNotification",(data) =>{
    console.log("User 1 received : ",data.message);
})
