# CryptoPay Simple

CryptoPay Simple is a non-custodial crypto payment request app for merchants. Create invoices in fiat, generate customer-facing QR codes, and monitor blockchain confirmations across Bitcoin, Solana, Ethereum, Base, and stablecoins (USDC/USDT).

## Features
- Merchant onboarding with wallet address validation
- Fiat → crypto conversion via CoinGecko
- QR code + payment URI generation
- Invoice statuses: Pending, Paid, Underpaid, Overpaid, Expired
- Polling-based monitoring with manual refresh and cron endpoint

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and update values.
3. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Environment variables
See `.env.example` for the full list.

## Monitoring flow
- The invoice detail page calls `/api/invoices/[id]/status` to poll for payments.
- The `POST /api/cron` endpoint can be called by a scheduler (every 1-5 minutes) to scan recent pending invoices.
- Monitoring uses:
  - Bitcoin: Blockstream public API
  - Solana: public RPC
  - Ethereum/Base: `viem` public RPC (use your own RPC for reliability)

## Notes
- CryptoPay Simple never creates or holds funds. Customers pay directly to the merchant's wallet address.
- Fee settings (optional) increase the invoice amount but do not split payments.

## Prisma
- Schema lives in `prisma/schema.prisma`.
- Run `npm run prisma:studio` to inspect data.

