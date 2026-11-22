import pool from "@/lib/db";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || !["pegawai", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loan = await client.query(
      `SELECT l.book_id, l.status, l.jatuh_tempo, b.denda_per_hari
       FROM loans l JOIN books b ON b.id = l.book_id
       WHERE l.id = $1 FOR UPDATE OF l`,
      [id]
    );
    if (loan.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }
    if (loan.rows[0].status !== "Sedang Dipinjam") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Buku ini tidak sedang dipinjam" }, { status: 409 });
    }

    await client.query(
      `UPDATE loans
       SET status = 'Selesai',
           tanggal_kembali = CURRENT_DATE,
           jumlah_denda = GREATEST(CURRENT_DATE - jatuh_tempo, 0) * $1,
           status_denda = CASE WHEN CURRENT_DATE > jatuh_tempo THEN 'Tertunggak' ELSE 'Tidak Ada' END,
           processed_by = $2
       WHERE id = $3`,
      [loan.rows[0].denda_per_hari, session.id, id]
    );
    await client.query(
      "UPDATE books SET stok_tersedia = stok_tersedia + 1 WHERE id = $1",
      [loan.rows[0].book_id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ message: "Buku dikembalikan" });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  } finally {
    client.release();
  }
}