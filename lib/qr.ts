import QRCode from "qrcode";
import { STABLECOIN_CONTRACTS } from "@/lib/assets";

export async function generateQrData(uri: string) {
  return QRCode.toDataURL(uri, { margin: 1, width: 240 });
}

export function buildPaymentUri({
  asset,
  network,
  address,
  amount,
  receipt,
  merchantName,
  invoiceId,
  amountRaw
}: {
  asset: string;
  network: string;
  address: string;
  amount: string;
  amountRaw: string;
  receipt: string;
  merchantName: string;
  invoiceId: string;
}) {
  if (asset === "BTC") {
    const params = new URLSearchParams({
      amount,
      label: merchantName,
      message: receipt
    });
    return `bitcoin:${address}?${params.toString()}`;
  }

  if (asset === "SOL") {
    const params = new URLSearchParams({
      amount,
      reference: invoiceId
    });
    return `solana:${address}?${params.toString()}`;
  }

  const [assetSymbol, networkHint] = asset.split("_");
  const isStable = assetSymbol === "USDC" || assetSymbol === "USDT";
  const isBase = network === "base" || networkHint === "BASE";

  if (!isStable) {
    const params = new URLSearchParams({
      value: amountRaw
    });
    return `ethereum:${address}?${params.toString()}`;
  }

  const networkKey = isBase ? "base" : "ethereum";
  const contract = STABLECOIN_CONTRACTS[networkKey][assetSymbol as "USDC" | "USDT"];
  const params = new URLSearchParams({
    address,
    uint256: amountRaw
  });
  return `ethereum:${contract}/transfer?${params.toString()}`;
}
