/**
 * NexPay — Solana Interaction Helpers (Vanilla JS)
 */

// These would normally be imported from CDN in the browser:
// <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"></script>
// <script src="https://unpkg.com/@coral-xyz/anchor@latest/dist/browser.anchor.min.js"></script>

const PROGRAM_ID = new solanaWeb3.PublicKey("11111111111111111111111111111111");

/**
 * Derives the WalletAccount PDA for a given owner
 */
async function getWalletPDA(ownerPublicKey) {
    return solanaWeb3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("wallet"), ownerPublicKey.toBuffer()],
        PROGRAM_ID
    );
}

/**
 * Initializes the NexPay Wallet Account
 */
async function initializeWallet(provider) {
    const program = new anchor.Program(IDL, PROGRAM_ID, provider);
    const [walletPDA] = await getWalletPDA(provider.wallet.publicKey);

    return await program.methods
        .initializeWallet()
        .accounts({
            walletAccount: walletPDA,
            owner: provider.wallet.publicKey,
            systemProgram: solanaWeb3.SystemProgram.programId,
        })
        .rpc();
}

/**
 * Sends SOL through the NexPay Smart Contract
 */
async function sendPayment(provider, recipientPubkeyStr, solAmount) {
    const program = new anchor.Program(IDL, PROGRAM_ID, provider);
    const recipientPubkey = new solanaWeb3.PublicKey(recipientPubkeyStr);
    
    const [senderWallet] = await getWalletPDA(provider.wallet.publicKey);
    const [recipientWallet] = await getWalletPDA(recipientPubkey);
    
    const lamports = new anchor.BN(solAmount * solanaWeb3.LAMPORTS_PER_SOL);

    return await program.methods
        .sendPayment(lamports)
        .accounts({
            senderWallet: senderWallet,
            recipientWallet: recipientWallet,
            sender: provider.wallet.publicKey,
            recipient: recipientPubkey,
            systemProgram: solanaWeb3.SystemProgram.programId,
        })
        .rpc();
}

/**
 * Fetches the WalletAccount data
 */
async function fetchWalletStats(connection, ownerPubkey) {
    const provider = { connection, wallet: { publicKey: ownerPubkey } };
    const program = new anchor.Program(IDL, PROGRAM_ID, provider);
    const [walletPDA] = await getWalletPDA(ownerPubkey);

    try {
        return await program.account.walletAccount.fetch(walletPDA);
    } catch (e) {
        return null;
    }
}

/**
 * Gets transaction history for the program
 */
async function getTransactionHistory(connection, ownerPubkey) {
    const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 20 });
    return signatures;
}

// Global exports for browser scripts
window.nexpay = {
    PROGRAM_ID,
    getWalletPDA,
    initializeWallet,
    sendPayment,
    fetchWalletStats,
    getTransactionHistory
};
