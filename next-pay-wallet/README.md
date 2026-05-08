# NexPay — Solana Payment Wallet

## Description
NexPay is a production-ready Solana-based peer-to-peer payment wallet. It allows users to connect their Phantom wallet, securely send SOL through a custom on-chain Anchor program, and track their global payment history and statistics in real-time.

## Live Demo
- Frontend: [Vercel link here]
- Demo Video: [YouTube/Loom link here]

## Contract Deployment
- Program ID (Devnet): `NexP111111111111111111111111111111111111111`
- Devnet Explorer: https://explorer.solana.com/address/NexP111111111111111111111111111111111111111?cluster=devnet

## Tech Stack
- Solana program: Rust + Anchor 0.29
- Frontend: Next.js 14, TypeScript, TailwindCSS
- Icons: Lucide React
- Wallet: Phantom via @solana/wallet-adapter

## Prerequisites
- Node.js 18+
- Rust + Cargo
- Solana CLI 1.18
- Anchor CLI 0.29
- Phantom browser extension

## Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/[username]/next-pay-wallet
cd next-pay-wallet
```

### 2. Install frontend dependencies
```bash
cd app && npm install
```

### 3. Build and deploy the Solana program
```bash
cd .. && chmod +x scripts/deploy.sh && ./scripts/deploy.sh
```

### 4. Update Program ID
After deploy.sh runs, copy the printed Program ID and paste it into:
- `app/idl/nexpay.json` (replace "metadata.address")
- `app/constants/programId.ts` (replace PROGRAM_ID value)

### 5. Run the frontend
```bash
cd app && npm run dev
```

## How It Works
1. **Initialize Wallet**: Upon first connection, the app prompts the user to initialize their NexPay account. This creates a Program Derived Address (PDA) on-chain to track the user's `total_sent`, `total_received`, and `tx_count`.
2. **Send Payment**: When a user sends SOL, the `send_payment` instruction is called. This instruction performs a System Program transfer CPI and simultaneously updates the stats for both the sender and the recipient within their respective PDAs.
3. **Event Tracking**: Every successful payment emits a `PaymentEvent` on the blockchain, allowing for transparent and traceable transaction history.

## Folder Structure
- `/program`     → Rust/Anchor on-chain program  
- `/app`         → Next.js frontend  
- `/scripts`     → Deployment and utility scripts  
