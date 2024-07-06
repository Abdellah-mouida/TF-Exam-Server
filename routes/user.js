let express = require("express");
const User = require("../model/User");
const Exam = require("../model/Exam");
let bcrypt = require("bcrypt");

let router = express.Router();

router.get("/", async (req, res) => {
  try {
    let users = await User.find({}, "username email role");
    res.send(users);
  } catch (err) {
    res.status("Essus getting Users Please Do something to You self");
  }
});

router.get("/passedExam/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findById(id).populate({
      path: "passedExam",
      populate: { path: "creator", select: "username" },
    });
    res.send(user.passedExam);
  } catch (err) {
    console.log(err);
    res.status(500).send("Interanl Server ERR");
  }
});
// Profile

router.get("/profile/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findOne({ _id: id }).populate({
      path: "passedExam",
      populate: {
        path: "creator",
        seletct: "username",
      },
    });
    if (user.role === "Student") {
      let users = await User.find({}, "score role");
      let sortedData = users
        .filter((x) => x.role === "Student")
        .sort((a, b) => b?.score - a?.score);

      res.send({
        user,
        rank: sortedData.findIndex((x) => String(x._id) === id) + 1,
      });
    } else if (user.role === "Teacher") {
      let ownExams = await Exam.find({ creator: id });
      let studentPassedExam = ownExams
        .map((m, i) => m.whoPassIt.map((m, i) => m.user))
        .flatMap((arr) => arr)
        .map((id) => id.toString());
      let set = new Set(studentPassedExam);

      res.send({ user, ownExams, studentPassedExam: Array.from(set).length });
    } else {
      res.send({ user });
    }
  } catch (err) {
    res.status(500).send("ERR");
    console.log(err);
  }
});

// Role --------------------------------------------

router.get("/role/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findOne({ _id: id }, "role");
    res.send(user);
  } catch (err) {
    res.status(500).send("ERR");
    console.log(err);
  }
});

// Settings ----------------------------------------

// Send All settings
router.get("/settings/all/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findOne(
      { _id: id },
      "privacy language theme googleId"
    );
    res.send(user);
  } catch (err) {
    res.status(500).send("ERR");
    console.log(err);
  }
});
// Personal Info -- Settings

router.get("/settings/personal-info/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findOne({ _id: id }, "profile username bio role");
    res.send(user);
  } catch (err) {
    res.status(500).send("EROR");
    console.log(err);
  }
});
router.post("/settings/personal-info", async (req, res) => {
  let { username, bio, profile, id } = req.body;
  try {
    let user = await User.findById(id);
    user.username = username;
    user.bio = bio;
    user.profile = profile;
    await user.save();
    res.send("Personal Info Saved Succssfully");
  } catch (err) {
    res.status(500).send("EROR");
    console.log(err);
  }
});
// Language -- Settings

router.get("/settings/language/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findOne({ _id: id }, "language");
    res.send(user);
  } catch (err) {
    res.status(500).send("EROR");
    console.log(err);
  }
});
router.post("/settings/language", async (req, res) => {
  let { language, id } = req.body;
  try {
    let user = await User.findById(id);
    user.language = language;
    await user.save();
    res.send("Language Saved Succssfully");
  } catch (err) {
    res.status(500).send("EROR");
    console.log(err);
  }
});
// Privacy -- Settings

router.get("/settings/privacy/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findOne({ _id: id }, "privacy");
    res.send(user);
  } catch (err) {
    res.status(500).send("EROR");
    console.log(err);
  }
});
router.post("/settings/privacy", async (req, res) => {
  let { privacy, id } = req.body;
  try {
    let user = await User.findById(id);
    user.privacy = privacy;
    await user.save();
    res.send("privacy Saved Succssfully");
  } catch (err) {
    res.status(500).send("EROR");
    console.log(err);
  }
});

// Theme -- Settings
router.get("/settings/theme/:id", async (req, res) => {
  let { id } = req.params;

  try {
    if (id === "undefined") {
      res.send({ theme: "Dark Blue" });
      return;
    } else {
      let user = await User.findOne({ _id: id }, "theme");
      res.send(user);
    }
  } catch (err) {
    res.status(500).send("EROR");
    console.log(err);
  }
});
router.post("/settings/theme", async (req, res) => {
  let { theme, id } = req.body;
  try {
    let user = await User.findById(id);
    user.theme = theme;
    await user.save();
    res.send("theme Saved Succssfully");
  } catch (err) {
    res.status(500).send("EROR");
    console.log(err);
  }
});
// Change Password -- Settings

router.post("/settings/changePsw/:id", async (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  try {
    let user = await User.findById(id);
    let cryptedPassword = await bcrypt.hash(password, 10);
    user.password = cryptedPassword;
    await user.save();
    res.send("Password Changed Sucsssfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("ERROR");
  }
});

//:id
router.get("/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let user = await User.findById(id);
    res.send(user);
  } catch (err) {
    res.status(404).send("Uneable to Find This User Pleases use a Valid ID");
  }
});
router.put("/:id", async (req, res) => {
  let { id } = req.params;
  let { username, email, role } = req.body;
  try {
    let user = await User.findById(id);
    user.username = username;
    user.email = email;
    user.role = role;
    await user.save();
    res.send("User Updated Succssfully");
  } catch (err) {
    res.status(500).send("Internal Server ERR");
    console.log(err);
  }
});
router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  try {
    await User.deleteOne({ _id: id });
    res.send("User Deleted Successfully");
  } catch (err) {
    res.status(500).send("Internal Server ERR");
    console.log(err);
  }
});

module.exports = router;
