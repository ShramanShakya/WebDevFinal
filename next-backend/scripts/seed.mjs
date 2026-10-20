// Usage: node --env-file=.env.local scripts/seed.mjs
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "online_course");

const PASSWORD = "Password123!";
const hash = await bcrypt.hash(PASSWORD, 10);

const people = [
  ...[1, 2, 3].map((i) => ({ username: `teacher${i}`, email: `teacher${i}@example.com`, role: "Teacher" })),
  ...[1, 2, 3].map((i) => ({ username: `student${i}`, email: `student${i}@example.com`, role: "Student" })),
];

await db.collection("users").createIndex({ email: 1 }, { unique: true });
await db.collection("users").createIndex({ username: 1 }, { unique: true });
for (const p of people) {
  await db.collection("users").updateOne(
    { email: p.email },
    { $set: { ...p, password: hash } },
    { upsert: true },
  );
}

// A few sample courses (only if none exist)
if ((await db.collection("courses").countDocuments()) === 0) {
  const t = await db.collection("users").find({ role: "Teacher" }).sort({ username: 1 }).toArray();
  const mk = (teacher, name, duration, topics, price, maxStudent, status) => ({
    name, duration, topics, price, maxStudent, status,
    teacherId: teacher._id.toString(), teacherName: teacher.username,
    enrolledStudents: [], createdAt: new Date(),
  });
  await db.collection("courses").insertMany([
    mk(t[0], "Intro to Web Development", 30, ["HTML", "CSS", "JavaScript"], 1500, 20, "Open"),
    mk(t[0], "React Fundamentals", 21, ["JSX", "Hooks", "Routing"], 2000, 2, "Open"),
    mk(t[1], "Databases with MongoDB", 14, ["CRUD", "Indexes"], 1800, 15, "Close"),
    mk(t[1], "Old Python Course", 10, ["Syntax"], 900, 10, "Cancel"),
    mk(t[2], "Next.js APIs", 20, ["Routing", "Auth", "Deployment"], 2500, 10, "Open"),
  ]);
}

console.log(`Seeded ${people.length} users (password: ${PASSWORD})`);
await client.close();
