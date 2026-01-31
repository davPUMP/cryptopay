import { z } from "zod";

const rateSchema = z.record(z.record(z.number()));

const ASSET_TO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDC: "usd-coin",
  USDT: "tether"
};

export async function fetchRate({
  asset,
  fiat
}: {
  asset: string;
  fiat: string;
}) {
  const assetSymbol = asset.split("_")[0];
  const id = ASSET_TO_ID[assetSymbol];
  if (!id) {
    throw new Error("Unsupported asset.");
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${fiat.toLowerCase()}`,
    { next: { revalidate: 60 } }
  );
  if (!response.ok) {
    throw new Error("Rate API error.");
  }
  const data = rateSchema.parse(await response.json());
  const value = data[id]?.[fiat.toLowerCase()];
  if (!value) {
    throw new Error("Rate not available.");
  }
  return value;
}
