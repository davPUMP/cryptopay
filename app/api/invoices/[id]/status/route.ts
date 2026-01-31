import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBitcoinPayment, checkEvmPayment, checkSolanaPayment } from "@/lib/monitor";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { payments: true }
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (invoice.status === "PAID") {
    return NextResponse.json({ status: invoice.status, message: "Payment received." });
  }

  const now = new Date();
  if (now > invoice.expiresAt) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "EXPIRED" }
    });
    return NextResponse.json({ status: "EXPIRED", message: "Invoice expired." });
  }

  let paymentInfo: { received: number | bigint; confirmed: boolean; txHash: string | null } | null = null;

  if (invoice.cryptoAsset === "BTC") {
    const expectedSats = Number(invoice.expectedCryptoAmountRaw);
    const result = await checkBitcoinPayment({ address: invoice.addressToPay, expectedSats });
    paymentInfo = {
      received: result.received,
      confirmed: result.confirmed,
      txHash: result.txHash
    };
  } else if (invoice.cryptoAsset === "SOL") {
    const expectedLamports = Number(invoice.expectedCryptoAmountRaw);
    const result = await checkSolanaPayment({ address: invoice.addressToPay, expectedLamports });
    paymentInfo = {
      received: result.received,
      confirmed: result.confirmed,
      txHash: result.txHash
    };
  } else {
    const expectedRaw = BigInt(invoice.expectedCryptoAmountRaw);
    const result = await checkEvmPayment({
      address: invoice.addressToPay,
      expectedRaw,
      asset: invoice.cryptoAsset,
      network: invoice.network
    });
    paymentInfo = {
      received: Number(result.received),
      confirmed: result.confirmed,
      txHash: result.txHash
    };
  }

  if (!paymentInfo?.confirmed || !paymentInfo.txHash) {
    return NextResponse.json({ status: invoice.status, message: "Awaiting payment." });
  }

  const expectedAmount = Number(invoice.expectedCryptoAmountRaw);
  const receivedAmount = Number(paymentInfo.received);
  let status = "PAID";
  if (receivedAmount < expectedAmount) {
    status = "UNDERPAID";
  } else if (receivedAmount > expectedAmount) {
    status = "OVERPAID";
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      txHash: paymentInfo.txHash,
      amountReceived: receivedAmount,
      amountReceivedRaw: receivedAmount.toString(),
      confirmed: paymentInfo.confirmed,
      confirmations: paymentInfo.confirmed ? 1 : 0,
      seenAt: new Date()
    }
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status }
  });

  return NextResponse.json({
    status,
    message: `Payment received: ${payment.amountReceivedRaw}`
  });
}
