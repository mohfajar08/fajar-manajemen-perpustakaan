import pool from "@/lib/db";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request, { params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const loanRes = await pool.query(
    "SELECT id, status, jatuh_tempo FROM loans WHERE id = $1 AND user_id = $2",
    [id, session.id]
  );

  if (loanRes.rows.length === 0) {
    return NextResponse.json({ error: "Data peminjaman tidak ditemukan" }, { status: 404 });
  }

  const loan = loanRes.rows[0];

  if (loan.status !== "Sedang Dipinjam") {
    return NextResponse.json({ error: "Hanya peminjaman aktif yang bisa diperpanjang" }, { status: 400 });
  }

  const today = new Date();
  const jatuhTempo = new Date(loan.jatuh_tempo);
  if (today > jatuhTempo) {
    return NextResponse.json({ error: "Peminjaman yang sudah jatuh tempo/terlambat tidak dapat diperpanjang" }, { status: 400 });
  }

  const existingExt = await pool.query(
    "SELECT id FROM loan_extensions WHERE loan_id = $1 AND status = 'Perpanjangan Diajukan'",
    [id]
  );

  if (existingExt.rows.length > 0) {
    return NextResponse.json({ error: "Pengajuan perpanjangan untuk transaksi ini sedang diproses" }, { status: 409 });
  }

  await pool.query(
    "INSERT INTO loan_extensions (loan_id, status) VALUES ($1, 'Perpanjangan Diajukan')",
    [id]
  );

  return NextResponse.json({ message: "Pengajuan perpanjangan berhasil dikirim" });
}