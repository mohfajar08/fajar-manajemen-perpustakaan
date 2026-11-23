import pool from "@/lib/db";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || session.role !== "mahasiswa") {
    return NextResponse.json({ error: "Hanya mahasiswa yang dapat memberi ulasan" }, { status: 403 });
  }

  const { loan_id, rating, komentar } = await request.json();
  if (!Number.isInteger(loan_id)) {
    return NextResponse.json({ error: "Data transaksi tidak valid" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus 1 sampai 5" }, { status: 400 });
  }

  const loan = await pool.query(
    "SELECT book_id, status FROM loans WHERE id = $1 AND user_id = $2",
    [loan_id, session.id]
  );
  if (loan.rows.length === 0) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }
  if (loan.rows[0].status !== "Selesai") {
    return NextResponse.json({ error: "Ulasan hanya untuk buku yang sudah dikembalikan" }, { status: 403 });
  }

  const sudah = await pool.query("SELECT 1 FROM reviews WHERE loan_id = $1", [loan_id]);
  if (sudah.rows.length > 0) {
    return NextResponse.json({ error: "Anda sudah memberi ulasan untuk transaksi ini" }, { status: 409 });
  }

  await pool.query(
    "INSERT INTO reviews (loan_id, user_id, book_id, rating, komentar) VALUES ($1, $2, $3, $4, $5)",
    [loan_id, session.id, loan.rows[0].book_id, rating, komentar?.trim() || null]
  );

  return NextResponse.json({ message: "Ulasan tersimpan" }, { status: 201 });
}