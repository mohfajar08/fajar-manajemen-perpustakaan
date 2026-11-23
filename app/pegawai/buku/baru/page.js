import pool from "@/lib/db";
import BukuForm from "../BukuForm";

export default async function BukuBaruPage() {
  const kategori = await pool.query("SELECT id, nama FROM categories ORDER BY nama");
  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Tambah buku</h1>
      <BukuForm kategori={kategori.rows} />
    </main>
  );
}