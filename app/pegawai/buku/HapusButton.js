"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HapusButton({ bookId }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function hapus() {
    if (!window.confirm("Hapus buku ini?")) return;
    const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      router.refresh();
    } else {
      setError(data.error);
    }
  }

  return (
    <span>
      <button onClick={hapus} className="text-red-600 hover:underline">Hapus</button>
      {error && <span className="block text-xs text-red-600 max-w-xs">{error}</span>}
    </span>
  );
}