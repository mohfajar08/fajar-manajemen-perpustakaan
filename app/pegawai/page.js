import pool from "@/lib/db";
import AksiButtons from "./AksiButtons";

export default async function PegawaiPage() {
  const result = await pool.query(
    `SELECT l.id, l.tanggal_pengajuan, u.nama, u.nim, b.judul, b.stok_tersedia
     FROM loans l
     JOIN users u ON u.id = l.user_id
     JOIN books b ON b.id = l.book_id
     WHERE l.status = 'Menunggu Konfirmasi'
     ORDER BY l.tanggal_pengajuan`
  );

  return (
    <main className="max-w-4xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Antrean peminjaman</h1>

      {result.rows.length === 0 && <p>Tidak ada pengajuan yang menunggu.</p>}

      <div className="space-y-3">
        {result.rows.map((l) => (
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
    </main>
  );
}