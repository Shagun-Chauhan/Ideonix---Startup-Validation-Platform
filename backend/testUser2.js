const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.emit("register", "69bbeff9b4acf3887504f219");

socket.on("newNotification", (data) => {
  console.log("USER2 RECEIVED:", data.message);
});