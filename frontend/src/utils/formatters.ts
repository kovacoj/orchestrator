export function pctDelta(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(0)}%`;
}

export function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function fmtCzk(n: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

export function riskColor(risk: string): string {
  switch (risk) {
    case "warning":
    case "critical":
      return "chip-warning";
    case "watch":
      return "chip-watch";
    case "healthy":
    case "good":
      return "chip-good";
    case "opportunity":
      return "chip-opportunity";
    case "suppressed":
      return "chip-suppressed";
    default:
      return "chip-neutral";
  }
}
