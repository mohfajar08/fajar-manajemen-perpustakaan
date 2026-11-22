"use client";

import { useState } from "react";

export default function AjukanButton({ bookId }) {
  const [pesan, setPesan] = useState({ tipe: "", teks: "" });
  const [loading, setLoading] = useState(false);

  async function ajukan() {
    setLoading(true);
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    });
    const data = await res.json();
    setPesan({ tipe: res.ok ? "sukses" : "error", teks: data.message || data.error });
    setLoading(false);
  }

  return (
    <div className="mt-4">
      <button
        onClick={ajukan}
        disabled={loading}
        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
      >
        {loading ? "Mengirim..." : "Ajukan pinjam"}
      </button>
      {pesan.teks && (
        <p className={`mt-2 text-sm ${pesan.tipe === "sukses" ? "text-green-700" : "text-red-600"}`}>
          {pesan.teks}
        </p>
      )}
    </div>
  );
}