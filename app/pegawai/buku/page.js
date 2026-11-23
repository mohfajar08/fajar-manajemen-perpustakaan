import pool from "@/lib/db";
import Link from "next/link";
import HapusButton from "./HapusButton";

export default async function KelolaBukuPage() {
  const result = await pool.query(
    `SELECT b.id, b.judul, b.penulis, b.isbn, c.nama AS kategori, b.stok_total, b.stok_tersedia
     FROM books b JOIN categories c ON c.id = b.category_id
     ORDER BY b.judul`
  );

  return (
    <main className="max-w-5xl mx-auto p-6 text-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kelola buku</h1>
        <Link href="/pegawai/buku/baru" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
          Tambah buku
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white border rounded-lg">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Judul</th>
              <th className="p-3">Penulis</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Stok</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-3 font-medium">{b.judul}</td>
                <td className="p-3">{b.penulis}</td>
                <td className="p-3">{b.kategori}</td>
                <td className="p-3">{b.stok_tersedia} / {b.stok_total}</td>
                <td className="p-3 flex gap-3">
                  <Link href={`/pegawai/buku/${b.id}`} className="text-blue-600 hover:underline">Ubah</Link>
                  <HapusButton bookId={b.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}