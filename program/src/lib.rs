use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("11111111111111111111111111111111");

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
        Ok(())
    }

    pub fn send_payment(ctx: Context<SendPayment>, amount: u64) -> Result<()> {
        if amount == 0 {
            return Err(error!(NexPayError::InsufficientAmount));
        }

        let sender = &ctx.accounts.sender;
        if sender.lamports() < amount {
            return Err(error!(NexPayError::InsufficientFunds));
        }

        // Perform SOL transfer via CPI to system_program
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: sender.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Update stats
        let sender_wallet = &mut ctx.accounts.sender_wallet;
        sender_wallet.total_sent += amount;
        sender_wallet.tx_count += 1;

        let recipient_wallet = &mut ctx.accounts.recipient_wallet;
        recipient_wallet.total_received += amount;

        // Emit Event
        emit!(PaymentSent {
            sender: *sender.key,
            recipient: *ctx.accounts.recipient.key,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn close_wallet(ctx: Context<CloseWallet>) -> Result<()> {
        // The account is closed by the #[account(close = owner)] constraint
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWallet<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 8 + 8 + 8 + 8,
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
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: This is the recipient of the SOL transfer
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseWallet<'info> {
    #[account(
        mut,
        seeds = [b"wallet", owner.key().as_ref()],
        bump,
        close = owner
    )]
    pub wallet_account: Account<'info, WalletAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
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
pub struct PaymentSent {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum NexPayError {
    #[msg("Payment amount must be greater than zero")]
    InsufficientAmount,
    #[msg("Sender does not have enough SOL")]
    InsufficientFunds,
    #[msg("You are not the wallet owner")]
    Unauthorized,
}
