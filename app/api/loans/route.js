import pool from "@/lib/db";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || session.role !== "mahasiswa") {
    return NextResponse.json({ error: "Hanya mahasiswa yang dapat mengajukan peminjaman" }, { status: 403 });
  }

  const { book_id } = await request.json();
  if (!Number.isInteger(book_id)) {
    return NextResponse.json({ error: "Data buku tidak valid" }, { status: 400 });
  }

  const denda = await pool.query(
    "SELECT 1 FROM loans WHERE user_id = $1 AND status_denda = 'Tertunggak' LIMIT 1",
    [session.id]
  );
  if (denda.rows.length > 0) {
    return NextResponse.json({ error: "Anda masih memiliki denda tertunggak" }, { status: 403 });
  }

  const buku = await pool.query("SELECT stok_tersedia FROM books WHERE id = $1", [book_id]);
  if (buku.rows.length === 0) {
    return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
  }
  if (buku.rows[0].stok_tersedia <= 0) {
    return NextResponse.json({ error: "Stok buku habis" }, { status: 409 });
  }

  const aktif = await pool.query(
    "SELECT 1 FROM loans WHERE user_id = $1 AND book_id = $2 AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')",
    [session.id, book_id]
  );
  if (aktif.rows.length > 0) {
    return NextResponse.json({ error: "Anda sudah mengajukan atau sedang meminjam buku ini" }, { status: 409 });
  }

  await pool.query("INSERT INTO loans (user_id, book_id) VALUES ($1, $2)", [session.id, book_id]);

  return NextResponse.json({ message: "Pengajuan terkirim. Menunggu konfirmasi pegawai." }, { status: 201 });
}