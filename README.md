# NexPay — Solana Payment Wallet

## Overview

NexPay is a Solana-powered global payment wallet designed to make cross-border transfers faster, cheaper, and more accessible. NexPay demonstrates how stablecoins and blockchain rails can enable near-instant international payments with minimal fees and transparent settlement.

The platform allows users to connect their wallet, send payments securely, and track transaction history through a modern web interface backed by a custom Rust smart contract deployed on Solana Devnet.

## The Problem

Traditional cross-border payments are often slow, expensive, and opaque. Bank wires can take several business days, remittance fees remain high, and millions of people still lack access to efficient financial services.

## The Solution

NexPay uses blockchain-based settlement to simulate a modern payment flow: users initiate a transfer, funds move through Solana infrastructure in seconds, and transactions remain transparent and traceable on-chain.

## Business Model (Concept)

Potential revenue streams include low transaction fees, B2B API integrations, premium accounts, and treasury/yield models for compliant stablecoin reserves.

## Live Demo
- **Frontend:** https://next-pay-wallet.vercel.app  
- **Demo Video:** [Add your video link here]

## Contract Deployment
- **Program ID (Devnet):** [Add after running deploy.sh]  
- **Devnet Explorer:** https://explorer.solana.com/address/[PROGRAM_ID]?cluster=devnet

## Tech Stack
| Layer | Technology |
|---|---|
| Smart Contract | Rust + Anchor Framework 0.29 |
| Frontend | HTML5, CSS3, Vanilla JS |
| Blockchain SDK | @solana/web3.js, @coral-xyz/anchor |
| Wallet | Phantom via @solana/wallet-adapter |
| Network | Solana Devnet |
| Hosting | Vercel |

## Smart Contract Features
- initialize_wallet — creates a PDA wallet account for each user on-chain
- send_payment — transfers SOL via CPI with on-chain event emission
- close_wallet — closes the PDA account and reclaims rent

## Prerequisites
- Node.js 18+
- Rust (install via https://rustup.rs)
- Solana CLI 1.18+ (install via https://docs.solana.com/cli/install-solana-cli-tools)
- Anchor CLI 0.29 (install via: cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked)
- Phantom Wallet browser extension

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/hussain-54/next-pay-wallet.git
cd next-pay-wallet
```

### 2. Install frontend dependencies
```bash
cd app && npm install && cd ..
```

### 3. Set up your Solana wallet
```bash
solana-keygen new
solana config set --url devnet
```

### 4. Deploy the smart contract to devnet
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This script will:
- Build the Anchor program
- Deploy to Solana devnet
- Auto-update the Program ID everywhere in the codebase
- Print your deployed Program ID and Explorer link

### 5. Update README
After deployment, copy the printed Program ID and paste it into the Contract Deployment section of this README.

### 6. Run the frontend locally
Open `index.html` in a browser, or serve with:
```bash
npx serve .
```

## Project Structure
```
next-pay-wallet/
├── program/               Rust/Anchor smart contract
│   ├── src/lib.rs         Main program logic
│   ├── Cargo.toml         Rust dependencies
│   └── Anchor.toml        Anchor config
├── app/
│   ├── idl/nexpay.json    Program IDL (auto-generated)
│   ├── constants/         Program ID and network config
│   └── utils/solana.ts    Solana interaction helpers
├── scripts/
│   └── deploy.sh          One-click deploy script
├── [existing HTML folders]
└── README.md
```

## How It Works
1. User visits the app and clicks "Connect Wallet" (Phantom)
2. On first connect, `initialize_wallet` is called — creating a PDA account on Solana devnet that stores the user's payment stats
3. User enters a recipient address and SOL amount, clicks Send
4. `send_payment` instruction is called — transferring SOL via CPI and updating both the sender and recipient on-chain accounts
5. Transaction history is pulled from devnet and displayed in real-time

## License
MIT
