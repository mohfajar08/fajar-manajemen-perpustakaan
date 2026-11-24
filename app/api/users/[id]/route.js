import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

const ROLES = ["admin", "pegawai", "mahasiswa"];

export async function PATCH(request, { params }) {
  const s = await requireRole(["admin"]);
  if (!s) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const { id } = await params;
  const { role, is_active } = await request.json();

  const myId = s.id ?? s.userId;
  if (String(myId) === String(id))
    return NextResponse.json(
      { error: "Tidak bisa mengubah role atau status akun sendiri" },
      { status: 400 }
    );
  if (role !== undefined && !ROLES.includes(role))
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });

  const r = await pool.query(
    `UPDATE users SET
       role = COALESCE($1, role),
       is_active = COALESCE($2, is_active)
     WHERE id = $3`,
    [role ?? null, typeof is_active === "boolean" ? is_active : null, id]
  );
  if (r.rowCount === 0) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
