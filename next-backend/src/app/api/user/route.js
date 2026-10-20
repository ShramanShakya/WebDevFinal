//src/app/api/user/route.js

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

// Returns the currently logged-in user (used by the frontend to restore a session)
export async function GET(req) {
  try {
    const me = getUserFromHeaders(req);
    const db = (await getClientPromise()).db(DB_NAME);
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(me.id) }, { projection: { password: 0 } });
    if (!user) return errorResponse("User not found", 404);
    return successResponse(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      200,
    );
  } catch (error) {
    printExceptionLog("GET /api/user", error);
    return errorResponse("Internal server error", 500);
  }
}
