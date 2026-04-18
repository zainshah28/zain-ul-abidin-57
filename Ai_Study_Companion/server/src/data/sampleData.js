import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { connectDb } from "../config/db.js";
import Quiz from "../models/Quiz.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

dotenv.config();

const seed = async () => {
  await connectDb();

  await Promise.all([
    User.deleteMany({ email: "demo@student.com" })
  ]);

  const demoUser = await User.create({
    name: "Demo Student",
    email: "demo@student.com",
    password: await bcrypt.hash("password123", 10)
  });

  const now = new Date();

  await Task.insertMany([
    {
      userId: demoUser._id,
      subject: "Data Structures",
      topic: "Graphs",
      studyHours: 1,
      deadline: new Date(now.getTime() + (12 * 60 * 60 * 1000)),
      status: "pending"
    },
    {
      userId: demoUser._id,
      subject: "Database Systems",
      topic: "Normalization",
      studyHours: 3,
      deadline: new Date(now.getTime() + (48 * 60 * 60 * 1000)),
      status: "pending"
    },
    {
      userId: demoUser._id,
      subject: "Operating Systems",
      topic: "Deadlocks",
      studyHours: 2,
      deadline: new Date(now.getTime() + (72 * 60 * 60 * 1000)),
      status: "completed"
    }
  ]);

  await Quiz.insertMany([
    {
      userId: demoUser._id,
      subject: "Data Structures",
      assessmentType: "quiz",
      score: 4.5
    },
    {
      userId: demoUser._id,
      subject: "Database Systems",
      assessmentType: "assignment",
      score: 7.8
    },
    {
      userId: demoUser._id,
      subject: "Operating Systems",
      assessmentType: "quiz",
      score: 8.3
    }
  ]);

  // eslint-disable-next-line no-console
  console.log("Sample data inserted.");
  process.exit(0);
};

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Seeding failed", error);
  process.exit(1);
});
