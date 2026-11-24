import pool from "@/lib/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

const JALAN_PINTAS = {
  mahasiswa: [
    { href: "/dashboard", judul: "Dashboard saya", ket: "Pinjaman aktif, denda, dan riwayat" },
    { href: "/katalog", judul: "Katalog buku", ket: "Cari dan ajukan peminjaman" },
  ],
  pegawai: [
    { href: "/pegawai", judul: "Antrean peminjaman", ket: "Setujui, kembalikan, dan denda" },
    { href: "/pegawai/buku", judul: "Kelola buku", ket: "Tambah, ubah, dan hapus buku" },
    { href: "/katalog", judul: "Katalog buku", ket: "Lihat koleksi" },
  ],
  admin: [
    { href: "/admin", judul: "Dashboard admin", ket: "Statistik dan log transaksi" },
    { href: "/pegawai", judul: "Antrean peminjaman", ket: "Proses transaksi" },
    { href: "/pegawai/buku", judul: "Kelola buku", ket: "Koleksi buku" },
  ],
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;
  const pintas = session ? JALAN_PINTAS[session.role] ?? [] : [];

  const populer = await pool.query(
    `SELECT b.id, b.judul, b.penulis, c.nama AS kategori,
            COUNT(l.id)::int AS jumlah_pinjam
     FROM books b
     JOIN categories c ON c.id = b.category_id
     LEFT JOIN loans l ON l.book_id = b.id AND l.status IN ('Sedang Dipinjam', 'Selesai')
     GROUP BY b.id, c.nama
     ORDER BY jumlah_pinjam DESC, b.judul
     LIMIT 5`
  );

  const pengumuman = await pool.query(
    `SELECT id, judul, kategori, tanggal_rilis
     FROM announcements
     WHERE status = 'Published'
     ORDER BY tanggal_rilis DESC
     LIMIT 3`
  );

  return (
    <main className="max-w-5xl mx-auto p-6 text-gray-900">
      <section className="text-center py-10">
        <h1 className="text-3xl font-bold">Perpustakaan Kampus</h1>
        <p className="text-gray-600 mt-2">
          {session ? `Selamat datang, ${session.nama}.` : "Temukan koleksi buku dan ajukan peminjaman dengan mudah."}
        </p>

        <form action="/katalog" className="flex gap-2 max-w-xl mx-auto mt-6">
          <input
            name="q"
            placeholder="Cari judul atau pengarang"
            className="flex-1 border rounded p-2 text-gray-900 placeholder-gray-500"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 hover:bg-blue-700">
            Cari
          </button>
        </form>

        {!session && (
          <div className="flex justify-center gap-3 mt-4 text-sm">
            <Link href="/login" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Masuk</Link>
            <Link href="/register" className="border rounded px-4 py-2 hover:bg-gray-50">Daftar</Link>
            <Link href="/katalog" className="px-4 py-2 text-gray-600 hover:underline">Lanjutkan sebagai tamu</Link>
          </div>
        )}
      </section>

      {pintas.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-3">Menu Anda</h2>
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            {pintas.map((p) => (
              <Link key={p.href} href={p.href} className="bg-white border rounded-lg p-4 hover:border-blue-600">
                <p className="font-semibold text-blue-700">{p.judul}</p>
                <p className="text-sm text-gray-600 mt-1">{p.ket}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mb-3">5 buku terpopuler</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {populer.rows.map((b) => (
          <div key={b.id} className="bg-white border rounded-lg p-4">
            <Link href={`/buku/${b.id}`} className="font-semibold text-blue-700 hover:underline">
              {b.judul}
            </Link>
            <p className="text-sm text-gray-600">{b.penulis}</p>
            <p className="text-xs text-gray-500">{b.kategori}</p>
            <p className="text-xs mt-2">Dipinjam {b.jumlah_pinjam} kali</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-10 mb-3">Pengumuman terbaru</h2>
      {pengumuman.rows.length === 0 && <p className="text-sm text-gray-600">Belum ada pengumuman.</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {pengumuman.rows.map((a) => (
          <div key={a.id} className="bg-white border rounded-lg p-4">
            <span className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{a.kategori}</span>
            <p className="font-semibold mt-2">{a.judul}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(a.tanggal_rilis).toLocaleDateString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}