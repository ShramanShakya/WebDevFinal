//src/app/api/course/route.js

import { getClientPromise } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { DB_NAME, ROLE_TEACHER } from "@/lib/constant";
import { parseCourse, studentView, teacherView } from "@/lib/course";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Teacher: own courses.
 * Student: all non-Cancel courses; ?search= filters by course or teacher name;
 *          ?enrolled=true returns only the courses the student enrolled in.
 */
export async function GET(req) {
  try {
    const user = getUserFromHeaders(req);
    const db = (await getClientPromise()).db(DB_NAME);
    const courses = db.collection("courses");

    if (user.role === ROLE_TEACHER) {
      const list = await courses
        .find({ teacherId: user.id })
        .sort({ _id: -1 })
        .toArray();
      return successResponse(list.map(teacherView), 200);
    }

    const { searchParams } = new URL(req.url);
    const filter = { status: { $ne: "Cancel" } };
    if (searchParams.get("enrolled") === "true") {
      filter["enrolledStudents.id"] = user.id;
    }
    const search = (searchParams.get("search") || "").trim();
    if (search) {
      const re = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = [{ name: re }, { teacherName: re }];
    }

    const list = await courses.find(filter).sort({ _id: -1 }).toArray();
    return successResponse(list.map((c) => studentView(c, user.id)), 200);
  } catch (error) {
    printExceptionLog("GET /api/course", error);
    return errorResponse("Internal server error", 500);
  }
}

// Only teachers can create courses
export async function POST(req) {
  try {
    const user = getUserFromHeaders(req);
    if (user.role !== ROLE_TEACHER) {
      return errorResponse("Only teachers can create courses", 403);
    }

    const { data, error } = parseCourse(await req.json());
    if (error) return errorResponse(error, 400);

    const doc = {
      ...data,
      teacherId: user.id,
      teacherName: user.username,
      enrolledStudents: [],
      createdAt: new Date(),
    };
    const db = (await getClientPromise()).db(DB_NAME);
    const result = await db.collection("courses").insertOne(doc);
    return successResponse(teacherView({ _id: result.insertedId, ...doc }), 201);
  } catch (error) {
    printExceptionLog("POST /api/course", error);
    return errorResponse("Internal server error", 500);
  }
}
