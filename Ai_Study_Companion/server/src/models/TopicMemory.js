import mongoose from "mongoose";

const reviewEventSchema = new mongoose.Schema(
  {
    quality: {
      type: Number,
      min: 0,
      max: 5,
      required: true
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    },
    intervalDays: {
      type: Number,
      min: 1,
      required: true
    },
    easeFactor: {
      type: Number,
      min: 1.3,
      required: true
    }
  },
  { _id: false }
);

const topicMemorySchema = new mongoose.Schema(
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
    topic: {
      type: String,
      required: true,
      trim: true
    },
    repetitions: {
      type: Number,
      default: 0,
      min: 0
    },
    intervalDays: {
      type: Number,
      default: 1,
      min: 1
    },
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3
    },
    dueDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastReviewedAt: {
      type: Date,
      default: null
    },
    recallProbability: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    reviewHistory: {
      type: [reviewEventSchema],
      default: []
    }
  },
  { timestamps: true }
);

topicMemorySchema.index({ userId: 1, subject: 1, topic: 1 }, { unique: true });

const TopicMemory = mongoose.model("TopicMemory", topicMemorySchema);

export default TopicMemory;
