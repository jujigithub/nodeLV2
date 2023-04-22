const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    nickname: {
      type: String,
      required: true,
    },
    title: {
      type: String,
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

// postSchema.virtual("postId").get(function () {
//   return this._id.toHexString();
// });

// postSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
