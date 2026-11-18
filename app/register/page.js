"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: "", email: "", nim: "", password: "" });
  const [pesan, setPesan] = useState({ tipe: "", teks: "" });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setPesan({ tipe: "sukses", teks: data.message });
      setForm({ nama: "", email: "", nim: "", password: "" });
    } else {
      setPesan({ tipe: "error", teks: data.error });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow space-y-4">
        <h1 className="text-2xl font-bold">Daftar Mahasiswa</h1>

        {pesan.teks && (
          <p className={pesan.tipe === "sukses" ? "text-green-600" : "text-red-600"}>
            {pesan.teks}
          </p>
        )}

        <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama lengkap"
          className="w-full border rounded p-2" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email kampus (.ac.id)"
          className="w-full border rounded p-2" />
        <input name="nim" value={form.nim} onChange={handleChange} placeholder="NIM"
          className="w-full border rounded p-2" />
        <input name="password" type="password" value={form.password} onChange={handleChange}
          placeholder="Password" className="w-full border rounded p-2" />

        <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700">
          Daftar
        </button>
      </form>
    </main>
  );
}