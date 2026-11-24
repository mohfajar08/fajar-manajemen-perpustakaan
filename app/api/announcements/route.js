import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

const KATEGORI = ["Operasional", "Layanan", "Acara"];
const STATUS = ["Draft", "Published"];

export async function GET() {
  const s = await getSession();
  const staf = s && ["admin", "pegawai"].includes(s.role);
  const r = await pool.query(
    `SELECT id, judul, konten, kategori, tanggal_rilis::text AS tanggal_rilis, status
     FROM announcements
     ${staf ? "" : "WHERE status = 'Published'"}
     ORDER BY tanggal_rilis DESC, id DESC`
  );
  return NextResponse.json(r.rows);
}

export async function POST(request) {
  const s = await requireRole(["admin", "pegawai"]);
  if (!s) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });

  const { judul, konten, kategori, status } = await request.json();
  if (!judul?.trim() || !konten?.trim())
    return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
  if (!KATEGORI.includes(kategori) || !STATUS.includes(status))
    return NextResponse.json({ error: "Kategori atau status tidak valid" }, { status: 400 });

  const r = await pool.query(
    `INSERT INTO announcements (judul, konten, kategori, status, author_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [judul.trim(), konten.trim(), kategori, status, s.id ?? s.userId ?? null]
  );
  return NextResponse.json({ id: r.rows[0].id }, { status: 201 });
}
