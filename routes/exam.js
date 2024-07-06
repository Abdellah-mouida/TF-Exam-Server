let express = require("express");
const Exam = require("../model/Exam");
const User = require("../model/User");
let router = express.Router();

// Funcion
let getResult = (correctAnswer, studentAnswer) => {
  let result = 0;
  for (let i = 0; i < correctAnswer.length; i++) {
    if (correctAnswer[i]?.answer === studentAnswer[i]?.answer) result++;
  }
  let totale = correctAnswer?.length;
  let finalResult = ((20 / totale) * result).toFixed(2);
  return finalResult;
};
let getTrueAnswers = (correctAnswer, studentAnswer) => {
  let result = 0;
  for (let i = 0; i < correctAnswer.length; i++) {
    if (correctAnswer[i]?.answer === studentAnswer[i]?.answer) result++;
  }

  return result;
};
let getScore = (TrueAnswers, FalseAnswers, difficulty, timeSpend, time) => {
  let score;
  if (difficulty === "easy") {
    score = TrueAnswers - 3 * FalseAnswers;
  } else if (difficulty === "normal") {
    score = 2 * (TrueAnswers - FalseAnswers);
  } else {
    score = 3 * TrueAnswers - FalseAnswers;
  }
  if (timeSpend < Math.round(time / 3)) {
    score += 10;
  } else if (timeSpend < Math.round(time / 3) * 2) {
    score += 5;
  }
  return score;
};

// Router
router.post("/create", async (req, res) => {
  let { title, difficulty, questions, creator, time } = req.body;
  try {
    let newExam = new Exam({
      creator,
      title,
      difficulty,
      questions,

      time,
    });
    await newExam.save();
    res.send({ Message: "Exam Created Succssfully", data: newExam });
  } catch (err) {
    res.status(500).send("Internal Server ERR");
    console.log(err);
  }
});

router.post("/rate/:id", async (req, res) => {
  let { id } = req.params;
  let { rate } = req.body;

  try {
    let exam = await Exam.findById(id);
    exam.reviews.push(rate);
    await exam.save();
    res.send("Review saved Sucssefffuly");
  } catch (err) {
    res.status(500).send("ERRRRRRROR");
    console.log(err);
  }
});

router.get("/user/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let exams = await Exam.find({ "whoPassIt.user": { $ne: id } }).populate(
      "creator"
    );
    res.send(exams);
  } catch (err) {
    console.log(err);
    res.status(500).send("Interenal Server ERR");
  }
});

router.get("/score/:examId/:userId", async (req, res) => {
  let { userId, examId } = req.params;
  try {
    let exam = await Exam.findById(examId).populate("creator");
    res.send(exam);
  } catch (err) {
    res.status(500).send("Internal Server ERR");
    console.log(err);
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await Exam.findById(id).populate("creator");
    res.send(exam);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/:id", async (req, res) => {
  let { id } = req.params;
  let { userId, studentAnswers, timeSpend } = req.body;
  console.log(timeSpend);
  try {
    let exam = await Exam.findById(id).populate("creator");
    let user = await User.findById(userId);

    let result = getResult(exam.questions, studentAnswers);

    user.passedExam.push(id);

    let tureAnswer = getTrueAnswers(exam.questions, studentAnswers);
    let falseAnswer = exam.questions.length - tureAnswer;
    let score = getScore(
      tureAnswer,
      falseAnswer,
      exam.difficulty,
      timeSpend,
      exam.time
    );
    console.log(
      "Thee acual score : " + Number(user.score + score),
      "the score is :",
      score
    );
    if (user.score + score < 0) {
      user.score = 0; // Nt3amlo M3ah , Awdi ghir salak 😅
    } else {
      user.score += score;
    }

    await user.save();
    exam.whoPassIt.push({
      user: userId,
      score: result,
      studentAnswers,
      timeSpend,
    });
    await exam.save();
    res.send("Finished Exams");
  } catch (err) {
    res.status(500).send("Internal Server ERR");
    console.log(err);
  }
});
module.exports = router;
