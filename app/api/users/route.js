import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  if (!(await requireRole(["admin"])))
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const r = await pool.query(
    "SELECT id, nama, email, role, nim, is_active FROM users ORDER BY id"
  );
  return NextResponse.json(r.rows);
}
