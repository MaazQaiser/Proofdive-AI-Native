export function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID() as string;
  }
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

