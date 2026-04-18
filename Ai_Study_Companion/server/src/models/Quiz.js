import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    assessmentType: {
      type: String,
      enum: ["quiz", "assignment"],
      default: "quiz"
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    }
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
