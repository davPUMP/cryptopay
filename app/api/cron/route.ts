import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBitcoinPayment, checkEvmPayment, checkSolanaPayment } from "@/lib/monitor";

export async function POST() {
  const pending = await prisma.invoice.findMany({
    where: { status: "PENDING" },
    take: 50
  });

  for (const invoice of pending) {
    if (new Date() > invoice.expiresAt) {
      await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "EXPIRED" } });
      continue;
    }

    if (invoice.cryptoAsset === "BTC") {
      const expectedSats = Number(invoice.expectedCryptoAmountRaw);
      const result = await checkBitcoinPayment({ address: invoice.addressToPay, expectedSats });
      if (result.confirmed && result.txHash) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            txHash: result.txHash,
            amountReceived: result.received,
            amountReceivedRaw: result.received.toString(),
            confirmed: true,
            confirmations: 1,
            seenAt: new Date()
          }
        });
        await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } });
      }
      continue;
    }

    if (invoice.cryptoAsset === "SOL") {
      const expectedLamports = Number(invoice.expectedCryptoAmountRaw);
      const result = await checkSolanaPayment({ address: invoice.addressToPay, expectedLamports });
      if (result.confirmed && result.txHash) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            txHash: result.txHash,
            amountReceived: result.received,
            amountReceivedRaw: result.received.toString(),
            confirmed: true,
            confirmations: 1,
            seenAt: new Date()
          }
        });
        await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } });
      }
      continue;
    }

    const expectedRaw = BigInt(invoice.expectedCryptoAmountRaw);
    const result = await checkEvmPayment({
      address: invoice.addressToPay,
      expectedRaw,
      asset: invoice.cryptoAsset,
      network: invoice.network
    });
    if (result.confirmed && result.txHash) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          txHash: result.txHash,
          amountReceived: Number(result.received),
          amountReceivedRaw: result.received.toString(),
          confirmed: true,
          confirmations: 1,
          seenAt: new Date()
        }
      });
      await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } });
    }
  }

  return NextResponse.json({ processed: pending.length });
}
