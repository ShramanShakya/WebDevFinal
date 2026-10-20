//src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { cookieOptions, signJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { DB_NAME } from "@/lib/constant";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return errorResponse("Username/email and password are required", 400);
    }

    const db = (await getClientPromise()).db(DB_NAME);
    const user = await db.collection("users").findOne({
      $or: [{ email: String(identifier).toLowerCase() }, { username: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse("Invalid credentials", 401);
    }

    const res = NextResponse.json(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      { status: 200, headers: corsHeaders },
    );
    res.cookies.set("token", signJWT(user), cookieOptions(60 * 60 * 24));
    return res;
  } catch (error) {
    printExceptionLog("POST /api/auth/login", error);
    return errorResponse("Internal server error", 500);
  }
}
