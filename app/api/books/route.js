import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await pool.query(
    "SELECT b.id, b.judul, b.penulis, c.nama AS kategori, b.stok_tersedia FROM books b JOIN categories c ON c.id = b.category_id ORDER BY b.id"
  );
  return NextResponse.json(result.rows);
}