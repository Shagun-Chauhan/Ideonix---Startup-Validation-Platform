const mongoose = require("mongoose");

const accessRequestSchema = new mongoose.Schema({
    idea : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Idea",
        required:true
    },
    requester : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status : {
        type:String,
        enum:["pending","rejected","approved"],
        default:"pending"
    }
},{timestamps:true})

module.exports=mongoose.model("AccessRequest",accessRequestSchema)