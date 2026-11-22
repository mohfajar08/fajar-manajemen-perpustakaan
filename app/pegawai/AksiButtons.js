"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AksiButtons({ loanId }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function kirim(aksi, alasan) {
    const res = await fetch(`/api/loans/${loanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aksi, alasan }),
    });
    const data = await res.json();
    if (res.ok) {
      router.refresh();
    } else {
      setError(data.error);
    }
  }

  function tolak() {
    const alasan = window.prompt("Alasan penolakan:");
    if (alasan) kirim("reject", alasan);
  }

  return (
    <div>
      <div className="flex gap-2">
        <button onClick={() => kirim("approve")} className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700">
          Setujui
        </button>
        <button onClick={tolak} className="bg-red-600 text-white rounded px-3 py-1 hover:bg-red-700">
          Tolak
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}