import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PengumumanPage() {
  const r = await pool.query(
    `SELECT id, judul, konten, kategori, tanggal_rilis
     FROM announcements WHERE status = 'Published'
     ORDER BY tanggal_rilis DESC, id DESC`
  );

  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Pengumuman</h1>
      {r.rows.length === 0 && <p className="text-sm text-gray-600">Belum ada pengumuman.</p>}
      <div className="space-y-4">
        {r.rows.map((a) => (
          <article key={a.id} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">
              {a.kategori} · {new Date(a.tanggal_rilis).toLocaleDateString("id-ID")}
            </p>
            <h2 className="font-semibold text-lg">{a.judul}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{a.konten}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
