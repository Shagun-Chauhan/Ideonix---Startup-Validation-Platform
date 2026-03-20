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
      }]
},{timestamps:true});

module.exports = mongoose.model("Idea",ideaSchema);