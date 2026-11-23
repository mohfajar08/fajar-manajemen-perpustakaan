import pool from "@/lib/db";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const result = await pool.query(
    "SELECT b.id, b.judul, b.penulis, c.nama AS kategori, b.stok_tersedia FROM books b JOIN categories c ON c.id = b.category_id ORDER BY b.id"
  );
  return NextResponse.json(result.rows);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || !["pegawai", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const b = await request.json();
  const wajib = ["judul", "isbn", "penulis", "penerbit"];
  for (const f of wajib) {
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

  const ada = await pool.query("SELECT 1 FROM books WHERE isbn = $1", [b.isbn.trim()]);
  if (ada.rows.length > 0) {
    return NextResponse.json({ error: "ISBN sudah terdaftar" }, { status: 409 });
  }

  await pool.query(
    `INSERT INTO books (judul, isbn, penulis, penerbit, tahun_terbit, category_id,
                        stok_total, stok_tersedia, durasi_maks_hari, denda_per_hari, cover_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10)`,
    [b.judul.trim(), b.isbn.trim(), b.penulis.trim(), b.penerbit.trim(), tahun, kategori, stok, durasi, denda, b.cover_url?.trim() || null]
  );

  return NextResponse.json({ message: "Buku ditambahkan" }, { status: 201 });
}