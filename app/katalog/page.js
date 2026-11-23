import pool from "@/lib/db";
import Link from "next/link";

const URUTAN = {
  judul: "b.judul ASC",
  terbaru: "b.tahun_terbit DESC, b.judul ASC",
  rating: "rating DESC NULLS LAST, b.judul ASC",
};

export default async function KatalogPage({ searchParams }) {
  const { q = "", kategori = "", urut = "judul" } = await searchParams;
  const orderBy = URUTAN[urut] ?? URUTAN.judul;

  const daftarKategori = await pool.query("SELECT id, nama FROM categories ORDER BY nama");

  const result = await pool.query(
    `SELECT b.id, b.judul, b.penulis, b.tahun_terbit, c.nama AS kategori, b.stok_tersedia,
            ROUND(AVG(r.rating), 1) AS rating
     FROM books b
     JOIN categories c ON c.id = b.category_id
     LEFT JOIN reviews r ON r.book_id = b.id
     WHERE (b.judul ILIKE $1 OR b.penulis ILIKE $1)
       AND ($2::text = '' OR c.id::text = $2)
     GROUP BY b.id, c.nama
     ORDER BY ${orderBy}`,
    [`%${q}%`, kategori]
  );
  const books = result.rows;

  const input = "border rounded p-2 text-gray-900 placeholder-gray-500";

  return (
    <main className="max-w-5xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Katalog buku</h1>

      <form className="flex flex-wrap gap-2 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul atau pengarang"
          className={`flex-1 min-w-[200px] ${input}`}
        />
        <select name="kategori" defaultValue={kategori} className={input}>
          <option value="">Semua kategori</option>
          {daftarKategori.rows.map((k) => (
            <option key={k.id} value={k.id}>{k.nama}</option>
          ))}
        </select>
        <select name="urut" defaultValue={urut} className={input}>
          <option value="judul">Urut: judul A-Z</option>
          <option value="terbaru">Urut: tahun terbit terbaru</option>
          <option value="rating">Urut: rating tertinggi</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 hover:bg-blue-700">
          Terapkan
        </button>
      </form>

      {books.length === 0 && <p>Buku tidak ditemukan.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <div key={b.id} className="bg-white border rounded-lg p-4">
            <Link href={`/buku/${b.id}`} className="font-semibold text-blue-700 hover:underline">
              {b.judul}
            </Link>
            <p className="text-sm text-gray-600">{b.penulis}</p>
            <p className="text-sm text-gray-600">{b.kategori} · {b.tahun_terbit}</p>
            <p className="text-sm mt-2">
              Stok: {b.stok_tersedia} · Rating: {b.rating ?? "-"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}