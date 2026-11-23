import pool from "@/lib/db";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function cekPegawai() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;
  return session && ["pegawai", "admin"].includes(session.role) ? session : null;
}

export async function PUT(request, { params }) {
  const { id } = await params;
  if (!(await cekPegawai())) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const b = await request.json();
  for (const f of ["judul", "penulis", "penerbit"]) {
    if (!b[f]?.toString().trim()) {
      return NextResponse.json({ error: `Kolom ${f} wajib diisi` }, { status: 400 });
    }
  }

  const tahun = Number(b.tahun_terbit);
  const kategori = Number(b.category_id);
  const stok = Number(b.stok_total);
  const durasi = Number(b.durasi_maks_hari);
  const denda = Number(b.denda_per_hari);

  if (![tahun, kategori, stok, durasi, denda].every(Number.isInteger)) {
    return NextResponse.json({ error: "Tahun, kategori, stok, durasi, dan denda harus berupa angka bulat" }, { status: 400 });
  }
  if (stok < 0 || denda < 0 || durasi < 1) {
    return NextResponse.json({ error: "Stok dan denda tidak boleh negatif, durasi minimal 1 hari" }, { status: 400 });
  }

  const dipinjam = await pool.query(
    "SELECT COUNT(*)::int AS n FROM loans WHERE book_id = $1 AND status = 'Sedang Dipinjam'",
    [id]
  );
  if (stok < dipinjam.rows[0].n) {
    return NextResponse.json(
      { error: `Stok total tidak boleh kurang dari jumlah yang sedang dipinjam (${dipinjam.rows[0].n})` },
      { status: 409 }
    );
  }

  await pool.query(
    `UPDATE books
     SET judul = $1, penulis = $2, penerbit = $3, tahun_terbit = $4, category_id = $5,
         stok_total = $6, stok_tersedia = $6 - $7, durasi_maks_hari = $8,
         denda_per_hari = $9, cover_url = $10
     WHERE id = $11`,
    [b.judul.trim(), b.penulis.trim(), b.penerbit.trim(), tahun, kategori, stok, dipinjam.rows[0].n, durasi, denda, b.cover_url?.trim() || null, id]
  );

  return NextResponse.json({ message: "Buku diperbarui" });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  if (!(await cekPegawai())) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const aktif = await pool.query(
    "SELECT 1 FROM loans WHERE book_id = $1 AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam') LIMIT 1",
    [id]
  );
  if (aktif.rows.length > 0) {
    return NextResponse.json({ error: "Buku tidak dapat dihapus karena sedang dipinjam atau diajukan" }, { status: 409 });
  }

  const riwayat = await pool.query("SELECT 1 FROM loans WHERE book_id = $1 LIMIT 1", [id]);
  if (riwayat.rows.length > 0) {
    return NextResponse.json({ error: "Buku tidak dapat dihapus karena memiliki riwayat peminjaman" }, { status: 409 });
  }

  await pool.query("DELETE FROM books WHERE id = $1", [id]);
  return NextResponse.json({ message: "Buku dihapus" });
}