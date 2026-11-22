import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  const result = await pool.query(
    "SELECT id, nama, password, role, is_active FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];

  const cocok = user && (await bcrypt.compare(password, user.password));
  if (!cocok) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }
  if (!user.is_active) {
    return NextResponse.json({ error: "Akun dinonaktifkan" }, { status: 403 });
  }

  const token = await createSession({ id: user.id, nama: user.nama, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ message: "Login berhasil", role: user.role });
}