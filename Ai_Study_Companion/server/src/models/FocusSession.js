import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    subject: {
      type: String,
      default: "General",
      trim: true
    },
    topic: {
      type: String,
      default: "",
      trim: true
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    endedAt: {
      type: Date,
      required: true
    },
    plannedMinutes: {
      type: Number,
      required: true,
      min: 1
    },
    actualMinutes: {
      type: Number,
      required: true,
      min: 1
    },
    distractionCount: {
      type: Number,
      default: 0,
      min: 0
    },
    completedPlannedTask: {
      type: Boolean,
      default: false
    },
    selfRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  { timestamps: true }
);

focusSessionSchema.index({ userId: 1, startedAt: -1 });

const FocusSession = mongoose.model("FocusSession", focusSessionSchema);

export default FocusSession;
