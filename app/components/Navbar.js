import Link from "next/link";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  return (
    <nav className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-900">
        <Link href="/" className="font-bold">Perpustakaan Kampus</Link>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="hover:text-blue-600">Beranda</Link>
          <Link href="/katalog" className="hover:text-blue-600">Katalog</Link>

          {session?.role === "mahasiswa" && (
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard saya</Link>
          )}
                   {(session?.role === "pegawai" || session?.role === "admin") && (
            <>
              <Link href="/pegawai" className="hover:text-blue-600">Antrean</Link>
              <Link href="/pegawai/buku" className="hover:text-blue-600">Kelola buku</Link>
            </>
          )}
          {session?.role === "admin" && (
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
          )}

          {session ? (
            <>
              <span className="text-gray-600">{session.nama} ({session.role})</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">Masuk</Link>
              <Link href="/register" className="hover:text-blue-600">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}