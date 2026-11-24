"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
     router.push(
  data.role === "mahasiswa" ? "/dashboard" : data.role === "pegawai" ? "/pegawai" : data.role === "admin" ? "/admin" : "/katalog"
);
      router.refresh();
    } else {
      setError(data.error);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow space-y-4">
        <h1 className="text-2xl font-bold">Masuk</h1>

        {error && <p className="text-red-600">{error}</p>}

        <input name="email" value={form.email} onChange={handleChange} placeholder="Email"
          className="w-full border rounded p-2" />
        <input name="password" type="password" value={form.password} onChange={handleChange}
          placeholder="Password" className="w-full border rounded p-2" />

        <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700">
          Masuk
        </button>
        <a href="/register" className="block text-center text-sm text-blue-600">Belum punya akun? Daftar</a>
                <a href="/katalog" className="block text-center text-sm text-gray-600 hover:underline">Lanjutkan sebagai tamu</a>
      </form>
    </main>
  );
}