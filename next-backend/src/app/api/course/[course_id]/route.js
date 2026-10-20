//src/app/api/course/[course_id]/route.js

import { getClientPromise } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { DB_NAME, ROLE_TEACHER } from "@/lib/constant";
import { parseCourse, parseId, studentView, teacherView } from "@/lib/course";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

// Shared checks for PUT/DELETE: teacher role -> course exists -> course is theirs
async function loadOwnCourse(req, params) {
  const user = getUserFromHeaders(req);
  if (user.role !== ROLE_TEACHER) {
    return { res: errorResponse("Only teachers can do this", 403) };
  }
  const { course_id } = await params;
  const _id = parseId(course_id);
  if (!_id) return { res: errorResponse("Invalid course id", 400) };

  const db = (await getClientPromise()).db(DB_NAME);
  const courses = db.collection("courses");
  const course = await courses.findOne({ _id });
  if (!course) return { res: errorResponse("Course not found", 404) };
  if (course.teacherId !== user.id) {
    return { res: errorResponse("You can only manage your own courses", 403) };
  }
  return { courses, course, _id };
}

export async function GET(req, { params }) {
  try {
    const user = getUserFromHeaders(req);
    const { course_id } = await params;
    const _id = parseId(course_id);
    if (!_id) return errorResponse("Invalid course id", 400);

    const db = (await getClientPromise()).db(DB_NAME);
    const course = await db.collection("courses").findOne({ _id });
    if (!course) return errorResponse("Course not found", 404);

    if (user.role === ROLE_TEACHER) {
      if (course.teacherId !== user.id) {
        return errorResponse("You can only view your own courses", 403);
      }
      return successResponse(teacherView(course), 200);
    }

    if (course.status === "Cancel") return errorResponse("Course not found", 404);
    return successResponse(studentView(course, user.id), 200);
  } catch (error) {
    printExceptionLog("GET /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const { res, courses, course, _id } = await loadOwnCourse(req, params);
    if (res) return res;

    const { data, error } = parseCourse(await req.json());
    if (error) return errorResponse(error, 400);

    if (data.maxStudent < course.enrolledStudents.length) {
      return errorResponse(
        `Max Student cannot be lower than the ${course.enrolledStudents.length} students already enrolled`,
        400,
      );
    }

    await courses.updateOne({ _id }, { $set: data });
    const updated = await courses.findOne({ _id });
    return successResponse(teacherView(updated), 200);
  } catch (error) {
    printExceptionLog("PUT /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { res, courses, course, _id } = await loadOwnCourse(req, params);
    if (res) return res;

    // Condition in the query too, so a concurrent enrollment cannot slip through
    const result = await courses.deleteOne({
      _id,
      "enrolledStudents.0": { $exists: false },
    });
    if (result.deletedCount === 0) {
      return errorResponse(
        "Cannot delete a course that already has enrolled students",
        409,
      );
    }
    return successResponse({ message: "Course deleted" }, 200);
  } catch (error) {
    printExceptionLog("DELETE /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}
