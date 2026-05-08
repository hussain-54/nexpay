#!/bin/bash
echo "🚀 Building NexPay Solana program..."
cd program && anchor build

echo "📍 Deploying to Devnet..."
anchor deploy --provider.cluster devnet

echo "📄 Copying IDL to frontend..."
mkdir -p ../app/src/idl
cp target/idl/nexpay.json ../app/src/idl/nexpay.json

PROGRAM_ID=$(solana address -k target/deploy/nexpay-keypair.json)
echo "------------------------------------------------"
echo "✅ DEPLOYMENT SUCCESSFUL"
echo "PROGRAM ID: $PROGRAM_ID"
echo "------------------------------------------------"
echo "Please update app/idl/nexpay.json and app/constants/programId.ts with this ID."
