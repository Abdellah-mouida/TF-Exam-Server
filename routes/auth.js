let express = require("express");
const User = require("../model/User");
let router = express.Router();
let bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let querystring = require("querystring");
let axios = require("axios");
let crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
let nodeMailer = require("nodemailer");
const userIsAlreadyExist = async (email) => {
  try {
    // Assuming User.find returns an array of matching documents
    let foundEmail = await User.find({ email: email });
    // If foundEmail is not empty, the email exists
    return foundEmail.length > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error; // Optionally re-throw the error to handle it further up the call stack
  }
};
function validateEmail(email) {
  // Regular expression to validate email structure
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Sign With GOOGLE -----------------------------------
const client = new OAuth2Client(
  "83353260242-mhni8tt14mp9i3mhi790j7luv8dh9mr1.apps.googleusercontent.com"
);
router.post("/google", async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience:
        "83353260242-mhni8tt14mp9i3mhi790j7luv8dh9mr1.apps.googleusercontent.com",
    });

    const { sub, name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = await User.create({
        googleId: sub,
        username: name,
        email,
        profile: picture,
      });
    }

    const jwtToken = jwt.sign({ userId: user._id }, "YOUR_JWT_SECRET");
    res.cookie("token", jwtToken, { httpOnly: true });
    res.status(200).json({ message: "Success", user });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(400).json({ error: "Invalid token" });
  }
});

///-----------------------------------------------------
router.post("/singin", async (req, res) => {
  // await User.deleteMany();
  let { username, email, password } = req.body;

  if (await userIsAlreadyExist(email)) {
    res.status(411).send("Email Is already exist");
    return;
  }

  if (!validateEmail(email)) {
    res.status(400).send("Invalid Email Format");
    return;
  }

  try {
    let cryptedPassword = await bcrypt.hash(password, 10);

    let createdUser = new User({ username, email, password: cryptedPassword });
    await createdUser.save();
    res.send({ USER_ID: createdUser._id });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server ERR");
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!(await userIsAlreadyExist(email))) {
      res.status(404).send("Email Not Found Please Singed in");
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).send("Invalid Email Format");
      return;
    }
    let SavedUser = await User.findOne({ email: email });

    if (await bcrypt.compare(password, SavedUser.password)) {
      res.send({ USER_ID: SavedUser._id });
    } else {
      res.status(400).send("Wrong Password");
      return;
    }
  } catch (err) {
    res.status(500).send("Internal Server ERR");
  }
});
router.post("/forgetPassword", async (req, res) => {
  let OAuth2 = google;
  let { email } = req.body;
  try {
    if (!(await userIsAlreadyExist(email))) {
      res.status(404).send("Email Not Found Please Singed in");
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).send("Invalid Email Format");
      return;
    }
    let user = await User.findOne({ email: email }, "username password");
    let password = user.password;
    let name = user.username;
    let code = crypto.randomBytes(8).toString("hex");
    let transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: { user: "abdellah0670590361@gmail.com", pass: "ABDELLAH 111" },
    });
    let mailOptions = {
      from: "abdellah0670590361@gmail.com",
      to: email,
      Subject: "Temporary Sign-In Code",
      text: `

Dear ${name},

We received a request to access your account associated with this email address. You can use the following temporary code to sign in:

Temporary Code: ${code}

This code will expire in 5 min for your security.

If you did not request this code, please ignore this email or contact support if you have questions.

Thank you,
TF-Exam Support Team

---

Please do not reply to this email. For any queries, contact our support team at support@tfexam.com.
`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(421).send("Error while sending code");
      }
      res.send(info);
    });
  } catch (err) {}
});

module.exports = router;
