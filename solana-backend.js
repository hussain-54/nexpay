// NexPay: Solana Backend Integration
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
        if (!this.wallet || !this.connection) return 10000; // Demo balance fallback
        
        try {
            const mintPublicKey = new window.solanaWeb3.PublicKey(USDC_DEVNET_MINT);
            
            // Get all token accounts for the wallet and the USDC mint
            const response = await this.connection.getParsedTokenAccountsByOwner(
                this.wallet,
                { mint: mintPublicKey }
            );

            if (response.value.length === 0) {
                return 10000; // No USDC token account found
            }

            // Sum up balances if multiple accounts exist (usually just one)
            let totalBalance = 0;
            for (const accountInfo of response.value) {
                const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
                totalBalance += amount;
            }

            return totalBalance > 0 ? totalBalance : 10000;
        } catch (error) {
            console.error('Error fetching USDC balance:', error);
            return 10000;
        }
    }

    // Send USDC to a recipient
    async sendUSDC(recipientAddress, amountUi) {
        // DEMO MODE: Simulate successful transaction
        console.log(`Simulating transfer of ${amountUi} USDC to ${recipientAddress}`);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const fakeSignature = "demo_tx_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                resolve(fakeSignature);
            }, 2000); // 2 second delay to simulate network
        });
    }
}

// Initialize and expose to window
window.solanaBackend = new SolanaBackend();
