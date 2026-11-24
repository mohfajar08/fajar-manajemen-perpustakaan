import pool from "@/lib/db";

export default async function AdminPage() {
  const stat = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM books) AS total_judul,
       (SELECT COALESCE(SUM(stok_total), 0)::int FROM books) AS total_eksemplar,
       (SELECT COUNT(*)::int FROM users WHERE role = 'mahasiswa') AS total_mahasiswa,
       (SELECT COUNT(*)::int FROM loans WHERE status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')) AS transaksi_aktif,
       (SELECT COALESCE(SUM(jumlah_denda), 0)::int FROM loans WHERE status_denda = 'Lunas') AS denda_lunas`
  );
  const s = stat.rows[0];

  const log = await pool.query(
    `SELECT l.id, l.status, l.tanggal_pengajuan, l.jatuh_tempo, l.status_denda,
            u.nama, b.judul
     FROM loans l
     JOIN users u ON u.id = l.user_id
     JOIN books b ON b.id = l.book_id
     ORDER BY l.tanggal_pengajuan DESC
     LIMIT 20`
  );

  const kartu = [
    { label: "Total judul buku", nilai: s.total_judul },
    { label: "Total eksemplar", nilai: s.total_eksemplar },
    { label: "Mahasiswa terdaftar", nilai: s.total_mahasiswa },
    { label: "Transaksi aktif", nilai: s.transaksi_aktif },
    { label: "Denda lunas", nilai: `Rp ${s.denda_lunas.toLocaleString("id-ID")}` },
  ];

  const tgl = (d) => (d ? new Date(d).toLocaleDateString("id-ID") : "-");

  return (
    <main className="max-w-5xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Dashboard admin</h1>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {kartu.map((k) => (
          <div key={k.label} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-600">{k.label}</p>
            <p className="text-xl font-bold mt-1">{k.nilai}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-8 mb-3">Log transaksi terbaru</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white border rounded-lg">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Mahasiswa</th>
              <th className="p-3">Buku</th>
              <th className="p-3">Status</th>
              <th className="p-3">Diajukan</th>
              <th className="p-3">Jatuh tempo</th>
              <th className="p-3">Denda</th>
            </tr>
          </thead>
          <tbody>
            {log.rows.length === 0 && (
              <tr><td colSpan={6} className="p-3 text-gray-600">Belum ada transaksi.</td></tr>
            )}
            {log.rows.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="p-3">{l.nama}</td>
                <td className="p-3">{l.judul}</td>
                <td className="p-3">{l.status}</td>
                <td className="p-3">{tgl(l.tanggal_pengajuan)}</td>
                <td className="p-3">{tgl(l.jatuh_tempo)}</td>
                <td className="p-3">{l.status_denda}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}