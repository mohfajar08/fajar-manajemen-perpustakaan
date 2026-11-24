import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function PUT(request, { params }) {
  if (!(await requireRole(["admin"])))
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const { id } = await params;
  const { nama, kode, deskripsi } = await request.json();
  if (!nama?.trim() || !kode?.trim())
    return NextResponse.json({ error: "Nama dan kode wajib diisi" }, { status: 400 });

  try {
    const r = await pool.query(
      "UPDATE categories SET nama=$1, kode=$2, deskripsi=$3 WHERE id=$4",
      [nama.trim(), kode.trim().toUpperCase(), deskripsi?.trim() || null, id]
    );
    if (r.rowCount === 0) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json({ error: "Nama atau kode sudah dipakai" }, { status: 409 });
    throw e;
  }
}

export async function DELETE(_request, { params }) {
  if (!(await requireRole(["admin"])))
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const { id } = await params;
  try {
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.code === "23503")
      return NextResponse.json(
        { error: "Kategori masih dipakai oleh buku, tidak bisa dihapus" },
        { status: 409 }
      );
    throw e;
  }
}
