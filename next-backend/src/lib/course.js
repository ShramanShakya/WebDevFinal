import { ObjectId } from "mongodb";
import { COURSE_STATUSES } from "./constant";

export function parseCourse(body) {
  const name = String(body?.name ?? "").trim();
  const duration = Number(body?.duration);
  const price = Number(body?.price);
  const maxStudent = Number(body?.maxStudent);
  const status = body?.status ?? "Open";
  let topics = body?.topics;
  if (typeof topics === "string") topics = topics.split(",");
  topics = Array.isArray(topics)
    ? topics.map((t) => String(t).trim()).filter(Boolean)
    : [];

  if (!name) return { error: "Course name is required" };
  if (!Number.isInteger(duration) || duration <= 0)
    return { error: "Duration must be a positive whole number of days" };
  if (!topics.length) return { error: "At least one topic is required" };
  if (!Number.isFinite(price) || price < 0)
    return { error: "Price must be 0 or more" };
  if (!Number.isInteger(maxStudent) || maxStudent <= 0)
    return { error: "Max Student must be a positive whole number" };
  if (!COURSE_STATUSES.includes(status))
    return { error: "Status must be Open, Close or Cancel" };

  return { data: { name, duration, topics, price, maxStudent, status } };
}

export function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Teacher sees everything, including the enrolled students
export function teacherView(c) {
  return { ...c, enrolledCount: c.enrolledStudents?.length ?? 0 };
}

// Student never sees who else is enrolled
export function studentView(c, userId) {
  const { enrolledStudents = [], ...rest } = c;
  return {
    ...rest,
    enrolledCount: enrolledStudents.length,
    enrolled: enrolledStudents.some((s) => s.id === userId),
  };
}
