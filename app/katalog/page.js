import pool from "@/lib/db";
import Link from "next/link";

export default async function KatalogPage({ searchParams }) {
  const { q = "" } = await searchParams;

  const result = await pool.query(
    `SELECT b.id, b.judul, b.penulis, c.nama AS kategori, b.stok_tersedia,
            ROUND(AVG(r.rating), 1) AS rating
     FROM books b
     JOIN categories c ON c.id = b.category_id
     LEFT JOIN reviews r ON r.book_id = b.id
     WHERE b.judul ILIKE $1 OR b.penulis ILIKE $1
     GROUP BY b.id, c.nama
     ORDER BY b.judul`,
    [`%${q}%`]
  );
  const books = result.rows;

  return (
    <main className="max-w-5xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Katalog buku</h1>

      <form className="flex gap-2 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul atau pengarang"
          className="flex-1 border rounded p-2 text-gray-900 placeholder-gray-500"
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 hover:bg-blue-700">
          Cari
        </button>
      </form>

      {books.length === 0 && <p>Buku tidak ditemukan.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <div key={b.id} className="bg-white border rounded-lg p-4">
           <Link href={`/buku/${b.id}`} className="font-semibold text-blue-700 hover:underline">{b.judul}</Link>
            <p className="text-sm text-gray-600">{b.penulis}</p>
            <p className="text-sm text-gray-600">{b.kategori}</p>
            <p className="text-sm mt-2">
              Stok: {b.stok_tersedia} · Rating: {b.rating ?? "-"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}