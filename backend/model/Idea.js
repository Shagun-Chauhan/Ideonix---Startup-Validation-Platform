const mongoose = require("mongoose");
const ideaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
      },
      votes : [{
        user : {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        voteType : {
            type:String,
            enum : ["upvote","downvote"]
        }
      }],
      visibility:{
        type:String,
        enum : ["public","private","protected"],
        default:"public"
      },
      allowedUsers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
      }],
      category : {
        type:String,
        default : "General"
      },
      tags:[{
        type:String
      }],
      commentsCount: {
        type: Number,
        default: 0
      },
      views: {
        type: Number,
        default: 0
      }

},{timestamps:true});

module.exports = mongoose.model("Idea",ideaSchema);