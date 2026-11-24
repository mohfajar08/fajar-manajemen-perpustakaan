import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const r = await pool.query("SELECT id, nama, kode, deskripsi FROM categories ORDER BY nama");
  return NextResponse.json(r.rows);
}

export async function POST(request) {
  if (!(await requireRole(["admin"])))
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });

  const { nama, kode, deskripsi } = await request.json();
  if (!nama?.trim() || !kode?.trim())
    return NextResponse.json({ error: "Nama dan kode wajib diisi" }, { status: 400 });

  try {
    const r = await pool.query(
      "INSERT INTO categories (nama, kode, deskripsi) VALUES ($1, $2, $3) RETURNING id",
      [nama.trim(), kode.trim().toUpperCase(), deskripsi?.trim() || null]
    );
    return NextResponse.json({ id: r.rows[0].id }, { status: 201 });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json({ error: "Nama atau kode sudah dipakai" }, { status: 409 });
    throw e;
  }
}
