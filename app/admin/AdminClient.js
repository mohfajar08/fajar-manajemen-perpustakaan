"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const input = "border rounded px-3 py-2 text-sm w-full bg-white text-gray-900";
const btn = "px-3 py-1.5 rounded text-sm font-medium";

async function call(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
  return data;
}

export default function AdminClient({ users, categories, announcements }) {
  const router = useRouter();
  const [tab, setTab] = useState("user");
  const [msg, setMsg] = useState("");

  async function run(fn) {
    setMsg("");
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 border-b">
        {[
          ["user", "Pengguna"],
          ["kategori", "Kategori"],
          ["pengumuman", "Pengumuman"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => { setTab(k); setMsg(""); }}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
              tab === k ? "border-blue-600 text-blue-700" : "border-transparent text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {msg && <p className="mb-3 text-sm text-red-600">{msg}</p>}

      {tab === "user" && <UserTab users={users} run={run} />}
      {tab === "kategori" && <KategoriTab categories={categories} run={run} />}
      {tab === "pengumuman" && <PengumumanTab items={announcements} run={run} />}
    </div>
  );
}

function UserTab({ users, run }) {
  return (
    <div className="bg-white border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-700">
          <tr>
            <th className="p-3">Nama</th>
            <th className="p-3">Email</th>
            <th className="p-3">NIM</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.nama}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.nim || "-"}</td>
              <td className="p-3">
                <select
                  value={u.role}
                  onChange={(e) => run(() => call(`/api/users/${u.id}`, "PATCH", { role: e.target.value }))}
                  className="border rounded px-2 py-1 bg-white"
                >
                  <option value="admin">admin</option>
                  <option value="pegawai">pegawai</option>
                  <option value="mahasiswa">mahasiswa</option>
                </select>
              </td>
              <td className="p-3">
                <button
                  onClick={() => run(() => call(`/api/users/${u.id}`, "PATCH", { is_active: !u.is_active }))}
                  className={`${btn} ${u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {u.is_active ? "Aktif" : "Nonaktif"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KategoriTab({ categories, run }) {
  const empty = { nama: "", kode: "", deskripsi: "" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  function submit(e) {
    e.preventDefault();
    run(async () => {
      if (editId) await call(`/api/categories/${editId}`, "PUT", form);
      else await call("/api/categories", "POST", form);
      setForm(empty);
      setEditId(null);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="bg-white border rounded-lg p-4 grid md:grid-cols-4 gap-3">
        <input className={input} placeholder="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
        <input className={input} placeholder="Kode (mis. TEK)" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required />
        <input className={input} placeholder="Deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
        <div className="flex gap-2">
          <button className={`${btn} bg-blue-600 text-white`}>{editId ? "Simpan" : "Tambah"}</button>
          {editId && (
            <button type="button" className={`${btn} bg-gray-200 text-gray-800`} onClick={() => { setEditId(null); setForm(empty); }}>
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border rounded-lg divide-y">
        {categories.length === 0 && <p className="p-4 text-sm text-gray-600">Belum ada kategori.</p>}
        {categories.map((c) => (
          <div key={c.id} className="p-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{c.nama} <span className="text-xs text-gray-500">({c.kode})</span></p>
              {c.deskripsi && <p className="text-sm text-gray-600">{c.deskripsi}</p>}
            </div>
            <div className="flex gap-2">
              <button className={`${btn} bg-gray-100 text-gray-800`} onClick={() => { setEditId(c.id); setForm({ nama: c.nama, kode: c.kode, deskripsi: c.deskripsi || "" }); }}>
                Edit
              </button>
              <button
                className={`${btn} bg-red-100 text-red-800`}
                onClick={() => confirm(`Hapus kategori "${c.nama}"?`) && run(() => call(`/api/categories/${c.id}`, "DELETE"))}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PengumumanTab({ items, run }) {
  const empty = { judul: "", konten: "", kategori: "Operasional", status: "Draft" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  function submit(e) {
    e.preventDefault();
    run(async () => {
      if (editId) await call(`/api/announcements/${editId}`, "PUT", form);
      else await call("/api/announcements", "POST", form);
      setForm(empty);
      setEditId(null);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="bg-white border rounded-lg p-4 space-y-3">
        <input className={input} placeholder="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
        <textarea className={input} rows={4} placeholder="Konten" value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} required />
        <div className="flex flex-wrap gap-3 items-center">
          <select className={`${input} !w-auto`} value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
            <option>Operasional</option>
            <option>Layanan</option>
            <option>Acara</option>
          </select>
          <select className={`${input} !w-auto`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Draft</option>
            <option>Published</option>
          </select>
          <button className={`${btn} bg-blue-600 text-white`}>{editId ? "Simpan perubahan" : "Buat pengumuman"}</button>
          {editId && (
            <button type="button" className={`${btn} bg-gray-200 text-gray-800`} onClick={() => { setEditId(null); setForm(empty); }}>
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-gray-600">Belum ada pengumuman.</p>}
        {items.map((a) => (
          <div key={a.id} className="bg-white border rounded-lg p-4 flex justify-between gap-4">
            <div>
              <p className="font-semibold">{a.judul}</p>
              <p className="text-xs text-gray-500 mb-1">
                {a.kategori} · {a.tanggal_rilis} ·{" "}
                <span className={a.status === "Published" ? "text-green-700" : "text-yellow-700"}>{a.status}</span>
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{a.konten}</p>
            </div>
            <div className="flex gap-2 shrink-0 items-start">
              <button className={`${btn} bg-gray-100 text-gray-800`} onClick={() => { setEditId(a.id); setForm({ judul: a.judul, konten: a.konten, kategori: a.kategori, status: a.status }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Edit
              </button>
              <button className={`${btn} bg-red-100 text-red-800`} onClick={() => confirm("Hapus pengumuman ini?") && run(() => call(`/api/announcements/${a.id}`, "DELETE"))}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
