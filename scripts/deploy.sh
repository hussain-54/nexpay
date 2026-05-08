#!/bin/bash

# 1. Check if solana CLI is installed
if ! command -v solana &> /dev/null
then
    echo "❌ Error: solana CLI is not installed."
    exit 1
fi

# 2. Check if anchor CLI is installed
if ! command -v anchor &> /dev/null
then
    echo "❌ Error: anchor CLI is not installed."
    exit 1
fi

# 3. Set Solana config to devnet
echo "📍 Setting Solana config to devnet..."
solana config set --url devnet

# 4. Request SOL airdrop
echo "🪂 Requesting airdrop..."
solana airdrop 2

# 5. Build program
echo "🚀 Building Anchor program..."
cd program
anchor build

# 6. Deploy program
echo "📦 Deploying to Devnet..."
DEPLOY_OUTPUT=$(anchor deploy --provider.cluster devnet 2>&1)
echo "$DEPLOY_OUTPUT"

# 7. Extract Program ID
PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep "Program Id:" | awk '{print $3}')

if [ -z "$PROGRAM_ID" ]; then
    echo "❌ Error: Could not extract Program ID from deployment output."
    exit 1
fi

echo "✅ Deployed Program ID: $PROGRAM_ID"

# 8. Update lib.rs
echo "📝 Updating declare_id in lib.rs..."
sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/g" src/lib.rs

# 9. Update Anchor.toml
echo "📝 Updating Anchor.toml..."
sed -i "s/nexpay = \".*\"/nexpay = \"$PROGRAM_ID\"/g" Anchor.toml

# 10. Update programId.ts
echo "📝 Updating programId.ts..."
sed -i "s/new PublicKey(\".*\")/new PublicKey(\"$PROGRAM_ID\")/g" ../app/constants/programId.ts

# 11. Update nexpay.json
echo "📝 Updating nexpay.json..."
sed -i "s/\"address\": \".*\"/\"address\": \"$PROGRAM_ID\"/g" ../app/idl/nexpay.json

# 12. Rebuild with correct ID
echo "🔄 Rebuilding with updated Program ID..."
anchor build

# 13. Success message
echo "------------------------------------------------"
echo "🌟 NexPay DEPLOYMENT SUCCESSFUL 🌟"
echo "Program ID: $PROGRAM_ID"
echo "Explorer Link: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo "------------------------------------------------"
