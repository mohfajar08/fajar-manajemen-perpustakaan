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

  const { aksi } = await request.json();
  if (!["approve", "reject"].includes(aksi)) {
    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const ext = await client.query(
      `SELECT e.status, e.loan_id, b.durasi_maks_hari
       FROM loan_extensions e
       JOIN loans l ON l.id = e.loan_id
       JOIN books b ON b.id = l.book_id
       WHERE e.id = $1 FOR UPDATE OF e`,
      [id]
    );
    if (ext.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }
    if (ext.rows[0].status !== "Perpanjangan Diajukan") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Pengajuan sudah diproses" }, { status: 409 });
    }

    if (aksi === "approve") {
      await client.query(
        "UPDATE loan_extensions SET status = 'Perpanjangan Disetujui' WHERE id = $1",
        [id]
      );
      await client.query(
        "UPDATE loans SET jatuh_tempo = jatuh_tempo + $1::int WHERE id = $2",
        [ext.rows[0].durasi_maks_hari, ext.rows[0].loan_id]
      );
    } else {
      await client.query(
        "UPDATE loan_extensions SET status = 'Perpanjangan Ditolak' WHERE id = $1",
        [id]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: aksi === "approve" ? "Perpanjangan disetujui" : "Perpanjangan ditolak" });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  } finally {
    client.release();
  }
}