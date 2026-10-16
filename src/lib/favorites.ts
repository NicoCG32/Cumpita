import { useEffect, useState } from "react";

const KEY = "cumpita-favs";

export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  useEffect(() => {
    try { setFavs(new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"))); } catch { /* vacío */ }
  }, []);
  const toggle = (id: string) => setFavs((prev) => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    localStorage.setItem(KEY, JSON.stringify([...n]));
    return n;
  });
  return { favs, toggle };
}
