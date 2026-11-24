import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

const KATEGORI = ["Operasional", "Layanan", "Acara"];
const STATUS = ["Draft", "Published"];

export async function PUT(request, { params }) {
  const s = await requireRole(["admin", "pegawai"]);
  if (!s) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const { id } = await params;

  const { judul, konten, kategori, status } = await request.json();
  if (!judul?.trim() || !konten?.trim())
    return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
  if (!KATEGORI.includes(kategori) || !STATUS.includes(status))
    return NextResponse.json({ error: "Kategori atau status tidak valid" }, { status: 400 });

  const r = await pool.query(
    `UPDATE announcements SET judul=$1, konten=$2, kategori=$3, status=$4 WHERE id=$5`,
    [judul.trim(), konten.trim(), kategori, status, id]
  );
  if (r.rowCount === 0) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const s = await requireRole(["admin", "pegawai"]);
  if (!s) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const { id } = await params;
  await pool.query("DELETE FROM announcements WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
