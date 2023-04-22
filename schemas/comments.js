const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    nickname: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Com", commentsSchema);
