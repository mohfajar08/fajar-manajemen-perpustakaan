import pool from "@/lib/db";
import { notFound } from "next/navigation";
import BukuForm from "../BukuForm";

export default async function UbahBukuPage({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const buku = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
  if (buku.rows.length === 0) notFound();

  const kategori = await pool.query("SELECT id, nama FROM categories ORDER BY nama");

  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Ubah buku</h1>
      <BukuForm kategori={kategori.rows} buku={buku.rows[0]} />
    </main>
  );
}