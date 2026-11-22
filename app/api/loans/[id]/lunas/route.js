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

  const result = await pool.query(
    "UPDATE loans SET status_denda = 'Lunas', processed_by = $1 WHERE id = $2 AND status_denda = 'Tertunggak'",
    [session.id, id]
  );
  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Tidak ada denda tertunggak pada transaksi ini" }, { status: 409 });
  }

  return NextResponse.json({ message: "Denda ditandai lunas" });
}