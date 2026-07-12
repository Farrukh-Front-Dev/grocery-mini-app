export function formatSom(amount: number): string {
  return `${amount.toLocaleString("uz-UZ")} so'm`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    yangi: "Yangi",
    tayyorlanmoqda: "Tayyorlanmoqda",
    yetkazildi: "Yetkazildi",
    bekor_qilindi: "Bekor qilindi",
  };
  return map[status] || status;
}

export function statusBadgeClass(status: string): "blue" | "yellow" | "green" | "red" | "gray" {
  const map: Record<string, "blue" | "yellow" | "green" | "red" | "gray"> = {
    yangi: "blue",
    tayyorlanmoqda: "yellow",
    yetkazildi: "green",
    bekor_qilindi: "red",
  };
  return map[status] || "gray";
}
