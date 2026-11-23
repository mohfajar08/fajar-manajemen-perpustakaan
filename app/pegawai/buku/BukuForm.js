"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BukuForm({ kategori, buku }) {
  const router = useRouter();
  const edit = Boolean(buku);
  const [form, setForm] = useState({
    judul: buku?.judul ?? "",
    isbn: buku?.isbn ?? "",
    penulis: buku?.penulis ?? "",
    penerbit: buku?.penerbit ?? "",
    tahun_terbit: buku?.tahun_terbit ?? "",
    category_id: buku?.category_id ?? kategori[0]?.id ?? "",
    stok_total: buku?.stok_total ?? 1,
    durasi_maks_hari: buku?.durasi_maks_hari ?? 7,
    denda_per_hari: buku?.denda_per_hari ?? 1000,
    cover_url: buku?.cover_url ?? "",
  });
  const [error, setError] = useState("");

  function ubah(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function simpan(e) {
    e.preventDefault();
    const res = await fetch(edit ? `/api/books/${buku.id}` : "/api/books", {
      method: edit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/pegawai/buku");
      router.refresh();
    } else {
      setError(data.error);
    }
  }

  const input = "w-full border rounded p-2 text-gray-900 placeholder-gray-500";

  return (
    <form onSubmit={simpan} className="bg-white border rounded-lg p-6 space-y-3 max-w-xl">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input name="judul" value={form.judul} onChange={ubah} placeholder="Judul buku" className={input} />
      <input name="isbn" value={form.isbn} onChange={ubah} placeholder="ISBN" disabled={edit} className={input} />
      <input name="penulis" value={form.penulis} onChange={ubah} placeholder="Pengarang" className={input} />
      <input name="penerbit" value={form.penerbit} onChange={ubah} placeholder="Penerbit" className={input} />
      <input name="tahun_terbit" type="number" value={form.tahun_terbit} onChange={ubah} placeholder="Tahun terbit" className={input} />

      <select name="category_id" value={form.category_id} onChange={ubah} className={input}>
        {kategori.map((k) => (
          <option key={k.id} value={k.id}>{k.nama}</option>
        ))}
      </select>

      <label className="block text-sm text-gray-700">Jumlah stok
        <input name="stok_total" type="number" value={form.stok_total} onChange={ubah} className={input} />
      </label>
      <label className="block text-sm text-gray-700">Durasi maksimal pinjam (hari)
        <input name="durasi_maks_hari" type="number" value={form.durasi_maks_hari} onChange={ubah} className={input} />
      </label>
      <label className="block text-sm text-gray-700">Denda per hari (Rp)
        <input name="denda_per_hari" type="number" value={form.denda_per_hari} onChange={ubah} className={input} />
      </label>

      <input name="cover_url" value={form.cover_url} onChange={ubah} placeholder="Tautan gambar sampul (opsional)" className={input} />

      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
        {edit ? "Simpan perubahan" : "Tambah buku"}
      </button>
    </form>
  );
}