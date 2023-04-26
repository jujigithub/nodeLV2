const express = require("express");
const router = express.Router();
const Post = require("../schemas/post");
const Com = require("../schemas/comments.js");
const authMiddleware = require("../middlewares/auth-middleware");

// 전체 게시글 조회, 날짜 내림차순, content제외
router.get("/posts", async (req, res) => {
  try {
    const data = await Post.find({}, { content: 0 }).sort({ createdAt: -1 });
    const posts = data.map((a) => {
      return {
        postId: a._id,
        userId: a.userId,
        nickname: a.nickname,
        title: a.title,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    });
    res.status(200).json({ posts });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 조회에 실패하였습니다.",
    });
  }
});

//게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const posts = await Post.find();
  let data = posts.map((a) => {
    return {
      postId: a._id,
      userId: a.userId,
      nickname: a.nickname,
      title: a.title,
      content: a.content,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      _id: undefined,
    };
  });
  const [result] = data.filter((a) => String(postId) === String(a.postId));

  try {
    res.status(200).json({ post: result });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 조회에 실패하였습니다.",
    });
  }
});

//게시글 작성
router.post("/posts", authMiddleware, async (req, res) => {
  const { nickname, _id } = res.locals.user;
  const { title, content } = req.body;

  try {
    if (Object.keys(req.body).length === 0) {
      res.status(412).json({ message: "데이터 형식이 올바르지 않습니다." });
      return;
    }

    if (title.length === 0) {
      res
        .status(412)
        .json({ message: "게시글 제목의 형식이 일치하지 않습니다." });
      return;
    }

    if (content.length === 0) {
      res
        .status(412)
        .json({ message: "게시글 내용의 형식이 일치하지 않습니다." });
      return;
    }

    await Post.create({ userId: _id, nickname, title, content });
    res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 작성에 실패하였습니다.",
    });
  }
});

//게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { _id } = res.locals.user;
  const { title, content } = req.body;
  const post = await Post.findOne({ _id: postId });

  try {
    if (Object.keys(req.body).length === 0) {
      res.status(412).json({ message: "데이터 형식이 올바르지 않습니다." });
      return;
    }

    if (title.length === 0) {
      res
        .status(412)
        .json({ message: "게시글 제목의 형식이 일치하지 않습니다." });
      return;
    }

    if (content.length === 0) {
      res
        .status(412)
        .json({ message: "게시글 내용의 형식이 일치하지 않습니다." });
      return;
    }

    if (String(post.userId) !== String(_id)) {
      res
        .status(403)
        .json({ message: "게시글의 수정 권한이 존재하지 않습니다." });
      return;
    }

    // const updateResult = await Post.updateOne(
    //   { _id: postId },
    //   { $set: { title, content, updatedAt: Date.now() } }
    // )
    // if (updateResult.nModified === 0) {
    //   res
    //     .status(401)
    //     .json({ message: "게시글이 정상적으로 수정되지 않았습니다." });
    //   return;
    // }

    await Post.updateOne(
      { _id: postId },
      { $set: { title, content, updatedAt: Date.now() } }
    ).catch((err) => {
      console.log(err);
      res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
    });
    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 수정에 실패하였습니다.",
    });
  }
});

//게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { _id } = res.locals.user;
  const post = await Post.findOne({ _id: postId });

  try {
    if (!post) {
      res.status(404).json({ message: "게시글이 존재하지 않습니다." });
      return;
    }

    if (String(post.userId) !== String(_id)) {
      res
        .status(403)
        .json({ message: "게시글의 삭제 권한이 존재하지 않습니다." });
      return;
    }

    const deleteResult = await Post.deleteOne({ _id: postId });
    await Com.deleteMany({ postId });
    if (deleteResult.deletedCount === 0) {
      res
        .status(401)
        .json({ message: "게시글이 정상적으로 삭제되지 않았습니다." });
      return;
    }

    res
      .status(200)
      .json({ message: "게시글과 해당 게시글의 댓글을 모두 삭제하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 삭제에 실패하였습니다.",
    });
  }
});

module.exports = router;
