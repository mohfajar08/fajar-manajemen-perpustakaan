import pool from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import AjukanButton from "./AjukanButton";

export default async function BukuDetailPage({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const result = await pool.query(
    `SELECT b.*, c.nama AS kategori, ROUND(AVG(r.rating), 1) AS rating
     FROM books b
     JOIN categories c ON c.id = b.category_id
     LEFT JOIN reviews r ON r.book_id = b.id
     WHERE b.id = $1
     GROUP BY b.id, c.nama`,
    [id]
  );
  const book = result.rows[0];
  if (!book) notFound();
    const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  const ulasan = await pool.query(
    `SELECT r.rating, r.komentar, u.nama
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.book_id = $1
     ORDER BY r.created_at DESC`,
    [id]
  );

  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-900">
      <Link href="/katalog" className="text-sm text-blue-600">&larr; Kembali ke katalog</Link>

      <h1 className="text-2xl font-bold mt-3">{book.judul}</h1>
      <p className="text-gray-600">{book.penulis}</p>

      <div className="bg-white border rounded-lg p-4 mt-4 space-y-1 text-sm">
        <p>ISBN: {book.isbn}</p>
        <p>Penerbit: {book.penerbit}</p>
        <p>Tahun terbit: {book.tahun_terbit}</p>
        <p>Kategori: {book.kategori}</p>
        <p>Stok tersedia: {book.stok_tersedia} dari {book.stok_total}</p>
        <p>Maksimal pinjam: {book.durasi_maks_hari} hari</p>
        <p>Denda: Rp {book.denda_per_hari.toLocaleString("id-ID")} per hari</p>
        <p>Rating: {book.rating ?? "belum ada"}</p>
      </div>

            {session?.role === "mahasiswa" ? (
        book.stok_tersedia > 0 ? (
          <AjukanButton bookId={book.id} />
        ) : (
          <p className="mt-4 text-sm text-red-600">Stok sedang habis.</p>
        )
      ) : (
        <p className="mt-4 text-sm text-gray-600">
          Masuk sebagai mahasiswa untuk mengajukan peminjaman.
        </p>
      )}
      <h2 className="text-lg font-semibold mt-6 mb-2">Ulasan</h2>
      {ulasan.rows.length === 0 && <p className="text-sm text-gray-600">Belum ada ulasan.</p>}
      <div className="space-y-2">
        {ulasan.rows.map((u, i) => (
          <div key={i} className="bg-white border rounded-lg p-3 text-sm">
            <p className="font-medium">{u.nama} · {u.rating}/5</p>
            <p className="text-gray-700">{u.komentar}</p>
          </div>
        ))}
      </div>
    </main>
  );
}