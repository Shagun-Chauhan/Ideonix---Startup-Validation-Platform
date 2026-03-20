const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    idea:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Idea"
    }
},{timestamps:true});

module.exports = mongoose.model("Comments",commentSchema);