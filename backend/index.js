const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbConnect")
const cors  = require("cors");
const port = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
const ideaRoutes = require("./routes/ideaRoutes");
const commentRoutes = require("./routes/commentRoutes");
const accessRoutes = require("./routes/accessRoutes");


const app = express();
app.use(cors());
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Backend is running...");
})


dbConnect();
app.use("/api/auth",authRoutes);
app.use("/api/ideas",ideaRoutes);
app.use("/api/comments",commentRoutes);
app.use("/api/access",accessRoutes);

app.listen(port,()=>{
    console.log(`Backend is running on ${port}`);
})