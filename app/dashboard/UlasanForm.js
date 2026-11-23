"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UlasanForm({ loanId }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState("");
  const [error, setError] = useState("");

  async function kirim(e) {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loan_id: loanId, rating, komentar }),
    });
    const data = await res.json();
    if (res.ok) {
      router.refresh();
    } else {
      setError(data.error);
    }
  }

  return (
    <form onSubmit={kirim} className="mt-3 space-y-2">
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="border rounded p-1 text-gray-900"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>{n} bintang</option>
        ))}
      </select>
      <textarea
        value={komentar}
        onChange={(e) => setKomentar(e.target.value)}
        placeholder="Tulis ulasan (opsional)"
        className="w-full border rounded p-2 text-sm text-gray-900 placeholder-gray-500"
      />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700">
        Kirim ulasan
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}