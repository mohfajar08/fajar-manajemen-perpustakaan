import pool from "@/lib/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import UlasanForm from "./UlasanForm";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = await verifySession(token);

  const aktif = await pool.query(
    `SELECT l.id, l.status, l.jatuh_tempo, b.judul,
            GREATEST(CURRENT_DATE - l.jatuh_tempo, 0) AS hari_terlambat,
            GREATEST(CURRENT_DATE - l.jatuh_tempo, 0) * b.denda_per_hari AS denda_berjalan
     FROM loans l JOIN books b ON b.id = l.book_id
     WHERE l.user_id = $1 AND l.status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
     ORDER BY l.tanggal_pengajuan DESC`,
    [session.id]
  );

  const tunggakan = await pool.query(
    `SELECT COALESCE(SUM(jumlah_denda), 0) AS total
     FROM loans WHERE user_id = $1 AND status_denda = 'Tertunggak'`,
    [session.id]
  );
  const totalDenda = Number(tunggakan.rows[0].total);

  const riwayat = await pool.query(
    `SELECT l.id, l.status, l.tanggal_pinjam, l.tanggal_kembali, l.jumlah_denda,
            l.status_denda, l.alasan_penolakan, b.judul,
            r.rating, r.komentar
     FROM loans l
     JOIN books b ON b.id = l.book_id
     LEFT JOIN reviews r ON r.loan_id = l.id
     WHERE l.user_id = $1 AND l.status IN ('Selesai', 'Ditolak')
     ORDER BY l.tanggal_pengajuan DESC`,
    [session.id]
  );

  const tgl = (d) => (d ? new Date(d).toLocaleDateString("id-ID") : "-");

  return (
    <main className="max-w-4xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold">Halo, {session.nama}</h1>
      <Link href="/katalog" className="text-sm text-blue-600">Lihat katalog buku</Link>

      {totalDenda > 0 && (
        <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="font-semibold text-red-700">Denda tertunggak: Rp {totalDenda.toLocaleString("id-ID")}</p>
          <p className="text-sm text-red-700">
            Pengajuan pinjam baru diblokir sampai denda dilunasi di meja sirkulasi.
          </p>
        </div>
      )}

      <h2 className="text-xl font-bold mt-8 mb-3">Peminjaman aktif</h2>
      {aktif.rows.length === 0 && <p className="text-sm text-gray-600">Tidak ada peminjaman aktif.</p>}
      <div className="space-y-3">
        {aktif.rows.map((l) => (
          <div key={l.id} className="bg-white border rounded-lg p-4">
            <p className="font-semibold">{l.judul}</p>
            <p className="text-sm text-gray-600">Status: {l.status}</p>
            {l.status === "Sedang Dipinjam" && (
              <p className="text-sm text-gray-600">Jatuh tempo: {tgl(l.jatuh_tempo)}</p>
            )}
            {l.hari_terlambat > 0 && l.status === "Sedang Dipinjam" && (
              <p className="text-sm text-red-600">
                Terlambat {l.hari_terlambat} hari · denda sementara Rp {Number(l.denda_berjalan).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-8 mb-3">Riwayat peminjaman</h2>
      {riwayat.rows.length === 0 && <p className="text-sm text-gray-600">Belum ada riwayat.</p>}
      <div className="space-y-3">
        {riwayat.rows.map((l) => (
          <div key={l.id} className="bg-white border rounded-lg p-4">
            <p className="font-semibold">{l.judul}</p>
            <p className="text-sm text-gray-600">Status: {l.status}</p>
            {l.status === "Selesai" && (
              <p className="text-sm text-gray-600">
                Dipinjam {tgl(l.tanggal_pinjam)} · Dikembalikan {tgl(l.tanggal_kembali)}
              </p>
            )}
            {l.status === "Ditolak" && (
              <p className="text-sm text-red-600">Alasan penolakan: {l.alasan_penolakan}</p>
            )}
            {l.jumlah_denda > 0 && (
              <p className="text-sm text-red-600">
                Denda Rp {l.jumlah_denda.toLocaleString("id-ID")} ({l.status_denda})
              </p>
            )}
                        {l.status === "Selesai" && (
              l.rating ? (
                <p className="text-sm mt-1">Ulasan Anda: {l.rating}/5 {l.komentar && `· ${l.komentar}`}</p>
              ) : (
                <UlasanForm loanId={l.id} />
              )
            )}
          </div>
        ))}
      </div>
    </main>
  );
}