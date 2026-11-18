import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { nama, email, nim, password } = await request.json();

  if (!nama || !email || !nim || !password) {
    return NextResponse.json({ error: "Semua data wajib diisi" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.ac\.id$/.test(email)) {
    return NextResponse.json({ error: "Gunakan email kampus (berakhiran .ac.id)" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  const exists = await pool.query(
    "SELECT id FROM users WHERE email = $1 OR nim = $2",
    [email, nim]
  );
  if (exists.rows.length > 0) {
    return NextResponse.json({ error: "Email atau NIM sudah terdaftar" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (nama, email, password, role, nim) VALUES ($1, $2, $3, 'mahasiswa', $4)",
    [nama, email, hash, nim]
  );

  return NextResponse.json({ message: "Registrasi berhasil" }, { status: 201 });
}
