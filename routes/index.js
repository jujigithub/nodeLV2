const express = require("express");
const router = express.Router();

router.get("/index", async (req, res) => {
  res.status(200).json({ message: "인덱스 페이지임" });
});

module.exports = router;
