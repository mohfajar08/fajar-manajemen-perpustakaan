import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/pegawai") && !["pegawai", "admin"].includes(session.role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/dashboard") && session.role !== "mahasiswa") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pegawai/:path*", "/dashboard/:path*"],
};