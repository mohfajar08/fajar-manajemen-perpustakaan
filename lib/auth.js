import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export async function getSession() {
  const token = (await cookies()).get("session")?.value;
  return token ? await verifySession(token) : null;
}

// Mengembalikan session jika role cocok, selain itu null
export async function requireRole(roles) {
  const s = await getSession();
  if (!s || !roles.includes(s.role)) return null;
  return s;
}
