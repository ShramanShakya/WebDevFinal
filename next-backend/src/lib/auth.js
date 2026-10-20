import jwt from "jsonwebtoken";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./constant";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyJWT(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function signJWT(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  );
}

// Cookie options. Cross-site (Vercel frontend <-> Vercel backend) needs SameSite=None + Secure.
export function cookieOptions(maxAge) {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? "none" : "lax",
    path: "/",
    maxAge,
  };
}

// Headers are set by proxy.js (which overwrites any client-supplied values).
export function getUserFromHeaders(req) {
  return {
    id: req.headers.get(X_HEADER_USER_ID),
    username: req.headers.get(X_HEADER_USER_NAME),
    email: req.headers.get(X_HEADER_USER_EMAIL),
    role: req.headers.get(X_HEADER_USER_ROLE),
  };
}
