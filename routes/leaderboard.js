let express = require("express");
let router = express.Router();
let User = require("../model/User");
router.get("/", async (req, res) => {
  try {
    let users = await User.find({}, "username score passedExam role");
    let sortedData = users.sort((a, b) => b?.score - a?.score);
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
