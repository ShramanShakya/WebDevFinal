//src/app/api/auth/logout/route.js

import { NextResponse } from "next/server";
import { cookieOptions } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { optionsResponse } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  const res = NextResponse.json(
    { message: "Logged out" },
    { status: 200, headers: corsHeaders },
  );
  res.cookies.set("token", "", cookieOptions(0));
  return res;
}
