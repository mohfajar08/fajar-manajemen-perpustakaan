import pool from "@/lib/db";
import AksiButtons from "./AksiButtons";
import KembaliButton from "./KembaliButton";
import LunasButton from "./LunasButton";
import PerpanjanganAksi from "./PerpanjanganAksi";

export default async function PegawaiPage() {
  const antrean = await pool.query(
    `SELECT l.id, u.nama, u.nim, b.judul, b.stok_tersedia
     FROM loans l
     JOIN users u ON u.id = l.user_id
     JOIN books b ON b.id = l.book_id
     WHERE l.status = 'Menunggu Konfirmasi'
     ORDER BY l.tanggal_pengajuan`
  );

  const dipinjam = await pool.query(
    `SELECT l.id, u.nama, u.nim, b.judul, l.jatuh_tempo,
            GREATEST(CURRENT_DATE - l.jatuh_tempo, 0) AS hari_terlambat
     FROM loans l
     JOIN users u ON u.id = l.user_id
     JOIN books b ON b.id = l.book_id
     WHERE l.status = 'Sedang Dipinjam'
     ORDER BY l.jatuh_tempo`
  );

  const denda = await pool.query(
    `SELECT l.id, u.nama, u.nim, b.judul, l.jumlah_denda
     FROM loans l
     JOIN users u ON u.id = l.user_id
     JOIN books b ON b.id = l.book_id
     WHERE l.status_denda = 'Tertunggak'
     ORDER BY l.tanggal_kembali`
  );

  const perpanjangan = await pool.query(
    `SELECT e.id, u.nama, u.nim, b.judul, l.jatuh_tempo, b.durasi_maks_hari
     FROM loan_extensions e
     JOIN loans l ON l.id = e.loan_id
     JOIN users u ON u.id = l.user_id
     JOIN books b ON b.id = l.book_id
     WHERE e.status = 'Perpanjangan Diajukan'
     ORDER BY e.tanggal_pengajuan`
  );

  return (
    <main className="max-w-4xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Antrean peminjaman</h1>
      {antrean.rows.length === 0 && <p className="text-sm text-gray-600">Tidak ada pengajuan yang menunggu.</p>}
      <div className="space-y-3">
        {antrean.rows.map((l) => (
          <div key={l.id} className="bg-white border rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{l.judul}</p>
              <p className="text-sm text-gray-600">
                {l.nama} ({l.nim}) · Stok tersedia: {l.stok_tersedia}
              </p>
            </div>
            <AksiButtons loanId={l.id} />
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Pengajuan perpanjangan</h2>
      {perpanjangan.rows.length === 0 && <p className="text-sm text-gray-600">Tidak ada pengajuan perpanjangan.</p>}
      <div className="space-y-3">
        {perpanjangan.rows.map((e) => (
          <div key={e.id} className="bg-white border rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{e.judul}</p>
              <p className="text-sm text-gray-600">
                {e.nama} ({e.nim}) · Jatuh tempo saat ini: {new Date(e.jatuh_tempo).toLocaleDateString("id-ID")}
              </p>
              <p className="text-sm text-gray-600">Jika disetujui, bertambah {e.durasi_maks_hari} hari.</p>
            </div>
            <PerpanjanganAksi extId={e.id} />
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Sedang dipinjam</h2>
      {dipinjam.rows.length === 0 && <p className="text-sm text-gray-600">Tidak ada buku yang sedang dipinjam.</p>}
      <div className="space-y-3">
        {dipinjam.rows.map((l) => (
          <div key={l.id} className="bg-white border rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{l.judul}</p>
              <p className="text-sm text-gray-600">
                {l.nama} ({l.nim}) · Jatuh tempo: {new Date(l.jatuh_tempo).toLocaleDateString("id-ID")}
              </p>
              {l.hari_terlambat > 0 && (
                <p className="text-sm text-red-600">Terlambat {l.hari_terlambat} hari</p>
              )}
            </div>
            <KembaliButton loanId={l.id} />
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Denda tertunggak</h2>
      {denda.rows.length === 0 && <p className="text-sm text-gray-600">Tidak ada denda tertunggak.</p>}
      <div className="space-y-3">
        {denda.rows.map((l) => (
          <div key={l.id} className="bg-white border rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{l.judul}</p>
              <p className="text-sm text-gray-600">{l.nama} ({l.nim})</p>
              <p className="text-sm text-red-600">Denda: Rp {l.jumlah_denda.toLocaleString("id-ID")}</p>
            </div>
            <LunasButton loanId={l.id} />
          </div>
        ))}
      </div>
    </main>
  );
}