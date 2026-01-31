import { NextResponse } from "next/server";
import { fetchRate } from "@/lib/rates";
import { formatCryptoAmount } from "@/lib/format";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset");
  const fiat = searchParams.get("fiat");
  const amountParam = searchParams.get("amount");

  if (!asset || !fiat || !amountParam) {
    return NextResponse.json({ error: "Missing params." }, { status: 400 });
  }

  const amountFiat = Number(amountParam);
  const rate = await fetchRate({ asset, fiat });
  const cryptoAmount = amountFiat / rate;

  return NextResponse.json({
    rate,
    amount: formatCryptoAmount(asset, cryptoAmount)
  });
}
