"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KembaliButton({ loanId }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function kembalikan() {
    const res = await fetch(`/api/loans/${loanId}/return`, { method: "PATCH" });
    const data = await res.json();
    if (res.ok) {
      router.refresh();
    } else {
      setError(data.error);
    }
  }

  return (
    <div>
      <button onClick={kembalikan} className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700">
        Kembalikan
      </button>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}