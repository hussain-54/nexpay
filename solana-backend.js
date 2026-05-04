// Next Pay: Solana Backend Integration
// Handles Phantom wallet connection and USDC transactions on Solana Devnet

const SOLANA_DEVNET = 'https://api.devnet.solana.com';
const USDC_DEVNET_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // Standard USDC mint on devnet

class SolanaBackend {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.initConnection();
    }

    initConnection() {
        if (window.solanaWeb3) {
            this.connection = new window.solanaWeb3.Connection(SOLANA_DEVNET, 'confirmed');
            console.log('Connected to Solana Devnet');
        } else {
            console.warn('Solana Web3 not loaded. Make sure to include the script.');
        }
    }

    // Check if Phantom is installed
    getProvider() {
        if ('phantom' in window) {
            const provider = window.phantom?.solana;
            if (provider?.isPhantom) {
                return provider;
            }
        }
        return null;
    }

    // Connect to Phantom wallet
    async connectWallet() {
        const provider = this.getProvider();
        if (provider) {
            try {
                const resp = await provider.connect();
                this.wallet = resp.publicKey;
                localStorage.setItem('nextpay_wallet', this.wallet.toString());
                console.log('Wallet connected:', this.wallet.toString());
                return this.wallet.toString();
            } catch (err) {
                console.error('Wallet connection failed:', err);
                throw err;
            }
        } else {
            window.open('https://phantom.app/', '_blank');
            throw new Error('Phantom wallet not found');
        }
    }

    // Disconnect wallet
    async disconnectWallet() {
        const provider = this.getProvider();
        if (provider) {
            await provider.disconnect();
            this.wallet = null;
            localStorage.removeItem('nextpay_wallet');
            console.log('Wallet disconnected');
        }
    }

    // Get stored wallet address
    getConnectedWallet() {
        const storedWallet = localStorage.getItem('nextpay_wallet');
        if (storedWallet && window.solanaWeb3) {
            this.wallet = new window.solanaWeb3.PublicKey(storedWallet);
            return storedWallet;
        }
        return null;
    }

    // Fetch USDC balance for the connected wallet
    async getUSDCBalance() {
        if (!this.wallet || !this.connection) return 0;
        
        try {
            const mintPublicKey = new window.solanaWeb3.PublicKey(USDC_DEVNET_MINT);
            
            // Get all token accounts for the wallet and the USDC mint
            const response = await this.connection.getParsedTokenAccountsByOwner(
                this.wallet,
                { mint: mintPublicKey }
            );

            if (response.value.length === 0) {
                return 0; // No USDC token account found
            }

            // Sum up balances if multiple accounts exist (usually just one)
            let totalBalance = 0;
            for (const accountInfo of response.value) {
                const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
                totalBalance += amount;
            }

            return totalBalance;
        } catch (error) {
            console.error('Error fetching USDC balance:', error);
            return 0;
        }
    }

    // Send USDC to a recipient
    async sendUSDC(recipientAddress, amountUi) {
        const provider = this.getProvider();
        if (!provider || !this.wallet || !this.connection || !window.splToken) {
            throw new Error('Missing provider, wallet, connection, or splToken library');
        }

        try {
            const recipientPubkey = new window.solanaWeb3.PublicKey(recipientAddress);
            const mintPubkey = new window.solanaWeb3.PublicKey(USDC_DEVNET_MINT);
            
            // Note: In a browser environment without a backend, we rely on @solana/spl-token
            // Because creating ATA instructions manually can be tedious, it's best to use spl-token.
            // Assuming spl-token is loaded via CDN: window.splToken
            
            const transaction = new window.solanaWeb3.Transaction();
            
            // 1. Get the sender's USDC token account address
            const senderTokenAccount = await window.splToken.getAssociatedTokenAddress(
                mintPubkey,
                this.wallet,
                false
            );

            // 2. Get the recipient's USDC token account address
            const recipientTokenAccount = await window.splToken.getAssociatedTokenAddress(
                mintPubkey,
                recipientPubkey,
                false
            );

            // 3. Check if recipient's token account exists, if not, create it
            const recipientAccountInfo = await this.connection.getAccountInfo(recipientTokenAccount);
            if (recipientAccountInfo === null) {
                // Add instruction to create the associated token account for the recipient
                transaction.add(
                    window.splToken.createAssociatedTokenAccountInstruction(
                        this.wallet, // payer
                        recipientTokenAccount, // associated token account address
                        recipientPubkey, // owner
                        mintPubkey // mint
                    )
                );
            }

            // 4. Add the transfer instruction
            // Amount must be in raw format (multiplied by decimals, usually 6 for USDC)
            const decimals = 6;
            const amountRaw = Math.floor(amountUi * Math.pow(10, decimals));
            
            transaction.add(
                window.splToken.createTransferInstruction(
                    senderTokenAccount, // source
                    recipientTokenAccount, // destination
                    this.wallet, // owner
                    amountRaw // amount
                )
            );

            // 5. Get latest blockhash
            const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = latestBlockhash.blockhash;
            transaction.feePayer = this.wallet;

            // 6. Request wallet to sign and send transaction
            const { signature } = await provider.signAndSendTransaction(transaction);
            
            // 7. Confirm transaction
            await this.connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            });

            return signature;
        } catch (error) {
            console.error('Error sending USDC:', error);
            throw error;
        }
    }
}

// Initialize and expose to window
window.solanaBackend = new SolanaBackend();
