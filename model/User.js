let mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  googleId: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  passedExam: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Exam",
  },
  score: {
    type: Number,
    default: 0,
  },
  profile: {
    type: String,
    default:
      "data:image/jpeg;base64,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",
  },
  bio: String,
  privacy: { type: String, enum: ["public", "private"], default: "public" },
  theme: { type: String, default: "Dark Blue" },
  language: { type: String, enum: ["fr", "an", "ar"], default: "an" },
  role: {
    type: String,
    enum: ["Admin", "Teacher", "Student"],
    default: "Student",
  },
});

module.exports = mongoose.model("User", userSchema);
