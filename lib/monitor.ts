import { Connection, PublicKey } from "@solana/web3.js";
import { createPublicClient, http, parseAbiItem, getAddress, Hex } from "viem";
import { base, mainnet } from "viem/chains";
import { STABLECOIN_CONTRACTS, TOKEN_DECIMALS } from "@/lib/assets";

export async function checkBitcoinPayment({
  address,
  expectedSats
}: {
  address: string;
  expectedSats: number;
}) {
  const response = await fetch(`https://blockstream.info/api/address/${address}/txs`);
  if (!response.ok) {
    throw new Error("Bitcoin API unavailable.");
  }
  const txs: Array<{ txid?: string; vout: Array<{ value: number; scriptpubkey_address?: string }> }> = await response.json();
  let received = 0;
  for (const tx of txs) {
    for (const out of tx.vout) {
      if (out.scriptpubkey_address === address) {
        received += out.value;
      }
    }
  }
  return {
    received,
    confirmed: received >= expectedSats,
    txHash: txs[0]?.txid ?? null
  };
}

export async function checkSolanaPayment({
  address,
  expectedLamports
}: {
  address: string;
  expectedLamports: number;
}) {
  const endpoint = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const connection = new Connection(endpoint, "confirmed");
  const pubkey = new PublicKey(address);
  const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 10 });
  for (const sig of signatures) {
    const tx = await connection.getTransaction(sig.signature, { commitment: "confirmed" });
    if (!tx) continue;
    const post = tx.meta?.postBalances?.[0] ?? 0;
    const pre = tx.meta?.preBalances?.[0] ?? 0;
    const delta = post - pre;
    if (delta >= expectedLamports) {
      return {
        received: delta,
        confirmed: true,
        txHash: sig.signature
      };
    }
  }
  return { received: 0, confirmed: false, txHash: null };
}

export async function checkEvmPayment({
  address,
  expectedRaw,
  asset,
  network
}: {
  address: string;
  expectedRaw: bigint;
  asset: string;
  network: string;
}) {
  const chain = network === "base" ? base : mainnet;
  const rpcUrl =
    network === "base"
      ? process.env.BASE_RPC_URL || chain.rpcUrls.default.http[0]
      : process.env.ETHEREUM_RPC_URL || chain.rpcUrls.default.http[0];
  const client = createPublicClient({ chain, transport: http(rpcUrl) });
  const checksummed = getAddress(address);

  const assetSymbol = asset.split("_")[0];
  const isStable = assetSymbol === "USDC" || assetSymbol === "USDT";

  if (!isStable) {
    const balance = await client.getBalance({ address: checksummed });
    return {
      received: balance,
      confirmed: balance >= expectedRaw,
      txHash: null
    };
  }

  const networkKey = network === "base" ? "base" : "ethereum";
  const contract = STABLECOIN_CONTRACTS[networkKey][assetSymbol as "USDC" | "USDT"];
  const decimals = TOKEN_DECIMALS[assetSymbol] || 6;
  const topic = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");
  const latestBlock = await client.getBlockNumber();
  const fromBlock = latestBlock > 5000n ? latestBlock - 5000n : 0n;
  const logs = await client.getLogs({
    address: contract as Hex,
    event: topic,
    args: { to: checksummed },
    fromBlock
  });
  const total = logs.reduce((sum, log) => sum + (log.args.value ?? 0n), 0n);
  return {
    received: total,
    confirmed: total >= expectedRaw,
    txHash: logs[0]?.transactionHash ?? null,
    decimals
  };
}
