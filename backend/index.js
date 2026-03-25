const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbConnect")
const cors  = require("cors");
const http = require("http");
const {Server} = require("socket.io");
const port = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
const ideaRoutes = require("./routes/ideaRoutes");
const commentRoutes = require("./routes/commentRoutes");
const accessRoutes = require("./routes/accessRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const ndaRoutes = require("./routes/ndaRoutes")
const notificationRoutes = require("./routes/notificationRoutes");



const app = express();
app.use(cors());
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Backend is running...");
})


dbConnect();

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin : "*",
    },
});

const onlineUsers = new Map();

io.on("connection",(socket)=>{
    console.log("User connected : ",socket.id);


socket.on("register",(userId) =>{
    onlineUsers.set(userId,socket.id);
    console.log("User registered : ",userId);
})

socket.on("disconnect" ,() => {
    for (let [userId,socketId] of  onlineUsers.entries()){
        if(socketId === socket.id){
            onlineUsers.delete(userId);
            break;
        }
    }
    console.log("User disconnected:",socket.id);
});
});

app.set("io",io);
app.set("onlineUsers",onlineUsers);

app.use("/api/auth",authRoutes);
app.use("/api/ideas",ideaRoutes);
app.use("/api/comments",commentRoutes);
app.use("/api/access",accessRoutes);
app.use("/api/bookmarks",bookmarkRoutes);
app.use("/api/nda",ndaRoutes);
app.use("/api/notifications",notificationRoutes);

server.listen(port,()=>{
    console.log(`Backend is running on ${port}`);
})