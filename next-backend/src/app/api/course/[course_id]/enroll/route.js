//src/app/api/course/[course_id]/enroll/route.js

import { getClientPromise } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { DB_NAME, ROLE_STUDENT } from "@/lib/constant";
import { parseId } from "@/lib/course";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req, { params }) {
  try {
    const user = getUserFromHeaders(req);
    if (user.role !== ROLE_STUDENT) {
      return errorResponse("Only students can enroll", 403);
    }
    const { course_id } = await params;
    const _id = parseId(course_id);
    if (!_id) return errorResponse("Invalid course id", 400);

    const db = (await getClientPromise()).db(DB_NAME);
    const courses = db.collection("courses");

    // One atomic update: Open + not already enrolled + seats left
    const result = await courses.updateOne(
      {
        _id,
        status: "Open",
        "enrolledStudents.id": { $ne: user.id },
        $expr: { $lt: [{ $size: "$enrolledStudents" }, "$maxStudent"] },
      },
      {
        $push: {
          enrolledStudents: {
            id: user.id,
            username: user.username,
            email: user.email,
            enrolledAt: new Date(),
          },
        },
      },
    );

    if (result.modifiedCount === 1) {
      return successResponse({ message: "Enrolled successfully" }, 200);
    }

    // Work out why it failed so the message is useful
    const course = await courses.findOne({ _id });
    if (!course || course.status === "Cancel") {
      return errorResponse("Course not found", 404);
    }
    if (course.enrolledStudents.some((s) => s.id === user.id)) {
      return errorResponse("You are already enrolled in this course", 409);
    }
    if (course.status !== "Open") {
      return errorResponse("This course is not open for enrollment", 400);
    }
    return errorResponse("This course is full", 409);
  } catch (error) {
    printExceptionLog("POST /api/course/[course_id]/enroll", error);
    return errorResponse("Internal server error", 500);
  }
}
