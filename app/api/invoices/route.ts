import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { fetchRate } from "@/lib/rates";
import { formatCryptoAmount, toRawAmount } from "@/lib/format";

const invoiceSchema = z.object({
  receiptNumber: z.string().min(1),
  fiatAmount: z.number().positive(),
  cryptoAsset: z.string()
});

const assetToNetwork: Record<string, string> = {
  BTC: "bitcoin",
  SOL: "solana",
  ETH: "ethereum",
  ETH_BASE: "base",
  USDC: "ethereum",
  USDT: "ethereum",
  USDC_BASE: "base",
  USDT_BASE: "base"
};

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(session.user.email)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { receiptNumber, fiatAmount, cryptoAsset } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: { include: { wallets: true } } }
  });

  if (!user?.profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { profile } = user;
  const feeMultiplier = profile.feeEnabled ? 1 + profile.feePercent / 100 : 1;
  const adjustedFiat = fiatAmount * feeMultiplier;

  const rate = await fetchRate({ asset: cryptoAsset, fiat: profile.billingCurrency });
  const cryptoAmount = adjustedFiat / rate;
  const cryptoAmountFormatted = formatCryptoAmount(cryptoAsset, cryptoAmount);
  const cryptoAmountRaw = toRawAmount(cryptoAsset, Number(cryptoAmountFormatted));

  const network = assetToNetwork[cryptoAsset] ?? "ethereum";
  const wallet = profile.wallets.find((item) => {
    if (cryptoAsset === "BTC") return item.chainType === "BTC";
    if (cryptoAsset === "SOL") return item.chainType === "SOL";
    return item.chainType === "EVM";
  });

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      merchantId: profile.id,
      receiptNumber,
      fiatCurrency: profile.billingCurrency,
      fiatAmount: adjustedFiat,
      cryptoAsset,
      network,
      expectedCryptoAmount: Number(cryptoAmountFormatted),
      expectedCryptoAmountRaw: cryptoAmountRaw,
      addressToPay: wallet.address,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    }
  });

  return NextResponse.json({ id: invoice.id });
}
