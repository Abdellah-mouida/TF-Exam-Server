let express = require("express");
let mongoose = require("mongoose");
let cors = require("cors");
let cookieParser = require("cookie-parser");

let authRouter = require("./routes/auth");
let examRouter = require("./routes/exam");
let userRouter = require("./routes/user");
let leaderBoardRouter = require("./routes/leaderboard");

let app = express();

mongoose
  .connect("mongodb://127.0.0.1/TFExam")
  .then(() => console.log("Connected"));

app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: "http://localhost:3000" }));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/exams", examRouter);
app.use("/users", userRouter);
app.use("/leaderboard", leaderBoardRouter);

app.listen(5000, () => console.log("Server is running on port 5000"));
