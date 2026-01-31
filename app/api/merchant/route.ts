import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateBtc, validateEvm, validateSol } from "@/lib/validate";
import { z } from "zod";

const onboardSchema = z.object({
  businessName: z.string().min(2),
  billingCurrency: z.enum(["THB", "USD", "EUR"]),
  btcAddress: z.string(),
  solAddress: z.string(),
  evmAddress: z.string(),
  feeEnabled: z.boolean().optional(),
  feePercent: z.number().min(0).max(5).optional()
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = onboardSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { businessName, billingCurrency, btcAddress, solAddress, evmAddress, feeEnabled, feePercent } = parsed.data;

  if (!validateBtc(btcAddress)) {
    return NextResponse.json({ error: "Invalid BTC address." }, { status: 400 });
  }
  if (!validateSol(solAddress)) {
    return NextResponse.json({ error: "Invalid SOL address." }, { status: 400 });
  }
  if (!validateEvm(evmAddress)) {
    return NextResponse.json({ error: "Invalid EVM address." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const profile = await prisma.merchantProfile.upsert({
    where: { userId: user.id },
    update: {
      businessName,
      billingCurrency,
      feeEnabled: feeEnabled ?? false,
      feePercent: feePercent ?? 0
    },
    create: {
      userId: user.id,
      businessName,
      billingCurrency,
      feeEnabled: feeEnabled ?? false,
      feePercent: feePercent ?? 0
    }
  });

  await prisma.wallet.deleteMany({ where: { merchantId: profile.id } });
  await prisma.wallet.createMany({
    data: [
      { merchantId: profile.id, chainType: "BTC", address: btcAddress },
      { merchantId: profile.id, chainType: "SOL", address: solAddress },
      { merchantId: profile.id, chainType: "EVM", address: evmAddress }
    ]
  });

  return NextResponse.json({ ok: true });
}
