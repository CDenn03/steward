import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/budgets",
  "/approvals",
  "/accounts",
  "/income",
  "/expenditures",
  "/events",
  "/departments",
  "/analytics",
  "/audit",
  "/notifications",
  "/settings",
  "/platform-admin",
];

const ALLOWED_ORIGINS_ENV = process.env.ALLOWED_ORIGINS;
const allowedOrigins = ALLOWED_ORIGINS_ENV
  ? ALLOWED_ORIGINS_ENV.split(",").map((o) => o.trim())
  : [];

function getSessionCookie(request: NextRequest) {
  return (
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const theme = request.cookies.get("theme")?.value;
  if (theme === "dark") {
    response.headers.set("x-theme", "dark");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin) {
      const normalizedOrigin = origin.replace(/\/$/, "");
      const normalizedAuthUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
      const allowed = [
        normalizedAuthUrl,
        `https://${host}`,
        `http://${host}`,
        ...allowedOrigins.map((o) => o.replace(/\/$/, "")),
      ].filter(Boolean);

      const isAllowed = allowed.some((a) => a && normalizedOrigin === a);
      if (!isAllowed) {
        return new NextResponse("CSRF check failed", { status: 403 });
      }
    }
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return response;
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return response;

  if (!getSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
