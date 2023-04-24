const express = require("express");
const router = express.Router();
const Com = require("../schemas/comments.js");
const authMiddleware = require("../middlewares/auth-middleware");
const Post = require("../schemas/post");

//댓글 조회
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  try {
    const data = await Com.find({ postId });
    console.log(data);
    const comments = data.map((a) => {
      return {
        commentId: a._id,
        userId: a.userId,
        nickname: a.nickname,
        content: a.content,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        // _id: undefined,
      };
    });

    const existPost = await Post.findById(postId);
    if (!existPost) {
      res.status(404).json({ message: "게시글이 존재하지 않습니다" });
      return;
    }

    res.status(200).json({ comments });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "댓글 조회에 실패하였습니다.",
    });
  }
});

//댓글 작성
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { nickname, _id } = res.locals.user;
  const { content } = req.body;
  const { postId } = req.params;

  try {
    if (Object.keys(req.body).length === 0) {
      res.status(412).json({ message: "데이터 형식이 올바르지 않습니다." });
      return;
    }

    const existPost = await Post.findById(postId);
    if (!existPost) {
      res.status(404).json({ message: "게시글이 존재하지 않습니다" });
      return;
    }

    if (!content) {
      res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요." });
      return;
    }

    await Com.create({ postId, userId: _id, nickname, content });
    res.status(201).json({ message: "댓글을 작성하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "댓글 작성에 실패하였습니다.",
    });
  }
});

//댓글 수정
router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { commentId, postId } = req.params;
    const { _id } = res.locals.user;
    const { content } = req.body;
    const post = await Com.findOne({ _id: commentId });

    try {
      if (Object.keys(req.body).length === 0) {
        res.status(412).json({ message: "데이터 형식이 올바르지 않습니다." });
        return;
      }

      if (String(post.userId) !== String(_id)) {
        res
          .status(403)
          .json({ message: "댓글의 수정 권한이 존재하지 않습니다." });
        return;
      }

      const existPost = await Post.findById(postId);
      if (!existPost) {
        res.status(404).json({ message: "게시글이 존재하지 않습니다" });
        return;
      }

      const existCom = await Com.findById(commentId);
      if (!existCom) {
        res.status(404).json({ message: "댓글이 존재하지 않습니다" });
        return;
      }

      if (!content) {
        res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요." });
        return;
      }

      const updateResult = await Com.updateOne(
        { _id: commentId },
        { $set: { content, updatedAt: Date.now() } }
      );
      if (updateResult.nModified === 0) {
        res
          .status(400)
          .json({ message: "댓글 수정이 정상적으로 처리되지 않았습니다." });
        return;
      }

      res.status(200).json({ message: "댓글을 수정하였습니다." });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        errorMessage: "댓글 수정에 실패하였습니다.",
      });
    }
  }
);

//댓글삭제
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { commentId, postId } = req.params;
    const { _id } = res.locals.user;
    const post = await Post.findOne({ _id: postId });
    const comments = await Com.findOne({ _id: commentId });

    try {
      if (!post) {
        res.status(404).json({ message: "게시글이 존재하지 않습니다." });
        return;
      }
      if (!comments) {
        res.status(404).json({ message: "댓글이 존재하지 않습니다." });
        return;
      }

      if (String(comments.userId) !== String(_id)) {
        res
          .status(403)
          .json({ message: "댓글의 삭제 권한이 존재하지 않습니다." });
        return;
      }

      const deleteResult = await Com.deleteOne({ _id: commentId });
      if (deleteResult.deletedCount === 0) {
        res
          .status(400)
          .json({ message: "댓글 삭제가 정상적으로 처리되지 않았습니다." });
        return;
      }

      res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        errorMessage: "댓글 삭제에 실패하였습니다.",
      });
    }
  }
);

module.exports = router;
