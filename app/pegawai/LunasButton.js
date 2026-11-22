"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LunasButton({ loanId }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function lunas() {
    const res = await fetch(`/api/loans/${loanId}/lunas`, { method: "PATCH" });
    const data = await res.json();
    if (res.ok) {
      router.refresh();
    } else {
      setError(data.error);
    }
  }

  return (
    <div>
      <button onClick={lunas} className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700">
        Tandai lunas
      </button>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}