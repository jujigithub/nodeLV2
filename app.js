const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const commentsRouter = require("./routes/comments.js");
const postsRouter = require("./routes/posts.js");
const indexRouter = require("./routes/index.js");
const authRouter = require("./routes/auth.js");
const connect = require("./schemas");
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api", [postsRouter, commentsRouter, indexRouter, authRouter]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
