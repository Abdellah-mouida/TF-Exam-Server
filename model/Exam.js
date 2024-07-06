let mongoose = require("mongoose");

let qestionSchema = new mongoose.Schema({
  qestion: String,
  answer: Boolean,
});

let examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["easy", "normal", "hard"],
  },
  questions: {
    type: [qestionSchema],
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  time: Number,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  reviews: {
    type: [Number],
  },
  rate: {
    type: Number,
    default: 0,
  },
  whoPassIt: {
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 20,
        },
        studentAnswers: {
          type: [qestionSchema],
        },
        timeSpend: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});
examSchema.pre("save", function (next) {
  if (this.isModified("reviews")) {
    this.rate = Number(
      this.reviews.reduce((a, b) => a + b) / this.reviews.length
    ).toFixed(2);
  }
  next();
});

module.exports = mongoose.model("Exam", examSchema);
