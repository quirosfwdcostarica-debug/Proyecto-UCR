import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PREFIXES = [
  "/mis-matches",
  "/directorio",
  "/mi-curriculum",
  "/mis-donaciones",
  "/mis-posiciones",
  "/posiciones/nueva",
  "/mis-aplicaciones",
  "/perfil/editar",
  "/completar-perfil",
  "/admin",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret = process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod";

  // nextauth v5 cookie names
  const cookieName =
    req.cookies.get("__Secure-authjs.session-token") !== undefined
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  const token = await getToken({ req, secret, cookieName }).catch(() => null);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!token && isProtected) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only enforcement
  if (token && pathname.startsWith("/admin")) {
    const role = (token.tipo as string | undefined)?.toUpperCase();
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|login|registro|auth|$|\\.png|\\.jpg|\\.svg|\\.ico).*)",
  ],
};
