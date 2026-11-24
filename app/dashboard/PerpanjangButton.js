"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PerpanjangButton({ loanId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePerpanjang() {
    if (!confirm("Ajukan perpanjangan untuk peminjaman ini?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/loans/${loanId}/extend`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal mengajukan perpanjangan");
      } else {
        alert(data.message);
        router.refresh();
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePerpanjang}
      disabled={loading}
      className="mt-2 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? "Memproses..." : "Ajukan Perpanjangan"}
    </button>
  );
}