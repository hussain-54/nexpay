use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::invoke;

declare_id!("NexP111111111111111111111111111111111111111");

#[program]
pub mod nexpay {
    use super::*;

    pub fn initialize_wallet(ctx: Context<InitializeWallet>) -> Result<()> {
        let wallet_account = &mut ctx.accounts.wallet_account;
        wallet_account.owner = *ctx.accounts.owner.key;
        wallet_account.total_sent = 0;
        wallet_account.total_received = 0;
        wallet_account.tx_count = 0;
        wallet_account.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Wallet initialized for: {:?}", wallet_account.owner);
        Ok(())
    }

    pub fn send_payment(ctx: Context<SendPayment>, amount: u64) -> Result<()> {
        let sender = &ctx.accounts.sender;
        let recipient = &ctx.accounts.recipient;
        let sender_wallet = &mut ctx.accounts.sender_wallet;
        let recipient_wallet = &mut ctx.accounts.recipient_wallet;

        // Perform SOL transfer via System Program CPI
        let ix = system_instruction::transfer(
            sender.key,
            recipient.key,
            amount,
        );
        invoke(
            &ix,
            &[
                sender.to_account_info(),
                recipient.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update sender stats
        sender_wallet.total_sent = sender_wallet.total_sent.checked_add(amount).unwrap();
        sender_wallet.tx_count = sender_wallet.tx_count.checked_add(1).unwrap();

        // Update recipient stats
        recipient_wallet.total_received = recipient_wallet.total_received.checked_add(amount).unwrap();

        // Emit Payment Event
        emit!(PaymentEvent {
            sender: *sender.key,
            recipient: *recipient.key,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Payment of {} lamports sent to {:?}", amount, recipient.key);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWallet<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 8 + 8 + 8 + 8, // Discriminator + Pubkey + u64*3 + i64
        seeds = [b"wallet", owner.key().as_ref()],
        bump
    )]
    pub wallet_account: Account<'info, WalletAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendPayment<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Recipient pubkey is only used for transfer and PDA seed
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"wallet", sender.key().as_ref()],
        bump,
    )]
    pub sender_wallet: Account<'info, WalletAccount>,
    #[account(
        mut,
        seeds = [b"wallet", recipient.key().as_ref()],
        bump,
    )]
    pub recipient_wallet: Account<'info, WalletAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct WalletAccount {
    pub owner: Pubkey,
    pub total_sent: u64,
    pub total_received: u64,
    pub tx_count: u64,
    pub created_at: i64,
}

#[event]
pub struct PaymentEvent {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum NexPayError {
    #[msg("Calculation overflow occurred")]
    Overflow,
}
