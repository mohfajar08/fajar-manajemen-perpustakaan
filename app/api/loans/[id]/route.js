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

  const { aksi, alasan } = await request.json();
  if (!["approve", "reject"].includes(aksi)) {
    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  }
  if (aksi === "reject" && !alasan?.trim()) {
    return NextResponse.json({ error: "Alasan penolakan wajib diisi" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loan = await client.query(
      "SELECT book_id, status FROM loans WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (loan.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }
    if (loan.rows[0].status !== "Menunggu Konfirmasi") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Pengajuan sudah diproses" }, { status: 409 });
    }

    if (aksi === "approve") {
      const buku = await client.query(
        "SELECT stok_tersedia, durasi_maks_hari FROM books WHERE id = $1 FOR UPDATE",
        [loan.rows[0].book_id]
      );
      if (buku.rows[0].stok_tersedia <= 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Stok buku habis" }, { status: 409 });
      }
      await client.query(
        "UPDATE books SET stok_tersedia = stok_tersedia - 1 WHERE id = $1",
        [loan.rows[0].book_id]
      );
      await client.query(
        `UPDATE loans
         SET status = 'Sedang Dipinjam', tanggal_pinjam = CURRENT_DATE,
             jatuh_tempo = CURRENT_DATE + $1::int, processed_by = $2
         WHERE id = $3`,
        [buku.rows[0].durasi_maks_hari, session.id, id]
      );
    } else {
      await client.query(
        "UPDATE loans SET status = 'Ditolak', alasan_penolakan = $1, processed_by = $2 WHERE id = $3",
        [alasan.trim(), session.id, id]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: aksi === "approve" ? "Peminjaman disetujui" : "Peminjaman ditolak" });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  } finally {
    client.release();
  }
}