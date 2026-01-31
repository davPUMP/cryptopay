export function formatCryptoAmount(asset: string, amount: number) {
  const symbol = asset.split("_")[0];
  if (symbol === "BTC") {
    return amount.toFixed(8);
  }
  if (symbol === "SOL") {
    return amount.toFixed(9);
  }
  if (symbol === "ETH") {
    return amount.toFixed(6);
  }
  return amount.toFixed(6);
}

export function toRawAmount(asset: string, amount: number) {
  const symbol = asset.split("_")[0];
  if (symbol === "BTC") {
    return Math.round(amount * 1e8).toString();
  }
  if (symbol === "SOL") {
    return Math.round(amount * 1e9).toString();
  }
  if (symbol === "ETH") {
    return BigInt(Math.round(amount * 1e6)) * BigInt(1e12) + "";
  }
  return Math.round(amount * 1e6).toString();
}
