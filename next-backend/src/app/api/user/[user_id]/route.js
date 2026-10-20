//src/app/api/user/[user_id]/route.js

import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { DB_NAME } from "@/lib/constant";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

// A user may only read their own profile
export async function GET(req, { params }) {
  try {
    const { user_id } = await params;
    const me = getUserFromHeaders(req);
    if (!ObjectId.isValid(user_id)) return errorResponse("Invalid user id", 400);
    if (user_id !== me.id) return errorResponse("Forbidden", 403);

    const db = (await getClientPromise()).db(DB_NAME);
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id) }, { projection: { password: 0 } });
    if (!user) return errorResponse("User not found", 404);
    return successResponse(
      { id: user._id.toString(), username: user.username, email: user.email, role: user.role },
      200,
    );
  } catch (error) {
    printExceptionLog("GET /api/user/[user_id]", error);
    return errorResponse("Internal server error", 500);
  }
}
