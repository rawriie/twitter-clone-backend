const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imgPath: {
      type: String,
      required: false,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
    },
  },
  { timestamps: true },
);

postSchema.virtual("likesCount", {
  ref: "Likes",
  localField: "_id",
  foreignField: "postId",
  count: true,
});

postSchema.virtual("replyCount", {
  ref: "Posts",
  localField: "_id",
  foreignField: "parentId",
  count: true,
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Posts", postSchema);
