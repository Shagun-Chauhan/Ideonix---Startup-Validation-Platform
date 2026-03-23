const mongoose = require("mongoose");
const User = require("../model/User");
const Idea = require("../model/Idea");

exports.toggleBookmark = async (req, res) => {
    try {
      const ideaId = req.params.ideaId;
  
      if (!mongoose.Types.ObjectId.isValid(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }
  
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("USER FROM DB:", user);
      console.log("BOOKMARKS FIELD:", user.bookmarks);
      if (!Array.isArray(user.bookmarks)) {
        user.set("bookmarks", []);
      }      
      console.log("After fix ",user.bookmarks);
    //   if (!user.bookmarks) {
    //     user.bookmarks = [];
    //   }
  
      const idea = await Idea.findById(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
  
      const isOwner = idea.user.toString() === req.user._id.toString();
  
     const allowedUsers = idea.allowedUsers || [];

     const isAllowed = allowedUsers.some(
       (id) => id.toString() === req.user._id.toString()
     );
      if (
        idea.visibility === "private" &&
        !isOwner &&
        !isAllowed
      ) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const alreadyBookmarked = user.bookmarks.some(
        (id) => id.toString() === ideaId
      );
  
      if (alreadyBookmarked) {
        user.bookmarks.pull(ideaId);
      } else {
        user.bookmarks.push(ideaId);
      }
  
      await user.save();
  
      res.json({
        message: alreadyBookmarked
          ? "Bookmark removed"
          : "Idea bookmarked",
        bookmarks: user.bookmarks
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
exports.getBookmarks = async (req,res)=>{
    try {
        const user = await User.findById(req.user._id)
        .populate({
            path:"bookmarks",
            populate : {
                path:"user",
                select:"name email"
            }
        });

        res.json(user.bookmarks);
    } catch (error) {
        res.status(500).json({message : error.message});
    }
}