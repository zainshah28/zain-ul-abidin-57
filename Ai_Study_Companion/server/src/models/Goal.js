import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    weekStartDate: {
      type: Date,
      required: true
    },
    targetHours: {
      type: Number,
      required: true,
      min: 0
    },
    actualHours: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
