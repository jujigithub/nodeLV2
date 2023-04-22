const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../schemas/user");

// 로그인 API
router.post("/login", async (req, res) => {
  try {
    const { nickname, password } = req.body;

    const user = await User.findOne({ nickname });

    // 인증 메세지는 자세히 설명 X
    if (!user || password !== user.password) {
      res.status(412).json({
        errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
      });
      return;
    }

    const token = jwt.sign(
      { nickname: user.nickname },
      "jjm-custom-secret-key"
    );

    res.cookie("Authorization", `Bearer ${token}`); // JWT를 Cookie로 할당
    res.status(200).json({ token }); // JWT를 Body로 할당
  } catch (err) {
    res.status(400).json({
      errorMessage: "로그인에 실패하였습니다.",
    });
  }
});

// 회원가입 API
router.post("/signup", async (req, res) => {
  const { nickname, password, confirm } = req.body;
  try {
    if (password !== confirm) {
      res.status(412).json({
        errorMessage: "패스워드가 일치하지 않습니다.",
      });
      return;
    }

    // nickname 중복
    const existsUsers = await User.findOne({ nickname });
    if (existsUsers) {
      // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않습니다.
      res.status(412).json({
        errorMessage: "중복된 닉네임입니다.",
      });
      return;
    }

    //닉네임 조건
    const nicknameFilter = /^[A-Za-z0-9]{3,}$/.test(nickname);
    if (!nicknameFilter) {
      res.status(412).json({
        errorMessage: "닉네임의 형식이 일치하지 않습니다.",
      });
      return;
    }

    //패스워드 길이조건
    if (password.length < 4) {
      res.status(412).json({
        errorMessage: "패스워드 형식이 일치하지 않습니다.",
      });
      return;
    }

    //패스워드 형식조건
    if (password.includes(nickname)) {
      res.status(412).json({
        errorMessage: "패스워드에 닉네임이 포함되어 있습니다.",
      });
      return;
    }

    const user = new User({ nickname, password });
    await user.save();
    res.status(201).json({ message: "회원 가입에 성공하였습니다." });
  } catch (err) {
    res.status(400).json({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

module.exports = router;
