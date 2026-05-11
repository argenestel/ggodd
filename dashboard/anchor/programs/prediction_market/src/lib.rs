use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("6Cxu21rFFR6c9f9aYciBimCSD1vA6k1aa9bE64HG5rLF");

pub const FEE_BPS: u16 = 300;
pub const PLATFORM_SHARE_BPS: u16 = 150;
pub const STREAMER_SHARE_BPS: u16 = 150;

#[program]
pub mod prediction_market {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.platform_fee_wallet = ctx.accounts.platform_fee_wallet.key();
        config.market_counter = 0;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn create_market(
        ctx: Context<CreateMarket>,
        streamer_steam_id: String,
        achievement_id: String,
        achievement_name: String,
        achievement_description: String,
        deadline: i64,
        streamer_fee_recipient: Pubkey,
    ) -> Result<()> {
        require!(deadline > Clock::get()?.unix_timestamp, ErrorCode::InvalidDeadline);
        require!(streamer_steam_id.len() <= 32, ErrorCode::SteamIdTooLong);
        require!(achievement_id.len() <= 64, ErrorCode::AchievementIdTooLong);
        require!(achievement_name.len() <= 128, ErrorCode::NameTooLong);

        let config = &mut ctx.accounts.config;
        let market = &mut ctx.accounts.market;

        market.creator = ctx.accounts.creator.key();
        market.market_id = config.market_counter;
        market.streamer_steam_id = streamer_steam_id;
        market.achievement_id = achievement_id;
        market.achievement_name = achievement_name;
        market.achievement_description = achievement_description;
        market.deadline = deadline;
        market.resolved = false;
        market.outcome = None;
        market.total_yes = 0;
        market.total_no = 0;
        market.escrow_bump = ctx.bumps.escrow;
        market.streamer_fee_recipient = streamer_fee_recipient;
        market.bump = ctx.bumps.market;

        config.market_counter = config.market_counter.checked_add(1).unwrap();

        Ok(())
    }

    pub fn place_bet(ctx: Context<PlaceBet>, side: Side, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, ErrorCode::MarketAlreadyResolved);
        require!(Clock::get()?.unix_timestamp < market.deadline, ErrorCode::MarketExpired);

        // Transfer SOL from user to escrow
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        let bet = &mut ctx.accounts.bet;
        bet.user = ctx.accounts.user.key();
        bet.market = market.key();
        bet.amount = amount;
        bet.side = side;
        bet.claimed = false;
        bet.bump = ctx.bumps.bet;

        match side {
            Side::Yes => market.total_yes = market.total_yes.checked_add(amount).unwrap(),
            Side::No => market.total_no = market.total_no.checked_add(amount).unwrap(),
        }

        Ok(())
    }

    pub fn resolve_market(ctx: Context<ResolveMarket>, outcome: Side) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let config = &ctx.accounts.config;

        require!(
            ctx.accounts.oracle.key() == config.admin,
            ErrorCode::UnauthorizedOracle
        );
        require!(!market.resolved, ErrorCode::MarketAlreadyResolved);
        require!(
            Clock::get()?.unix_timestamp >= market.deadline,
            ErrorCode::DeadlineNotReached
        );

        market.resolved = true;
        market.outcome = Some(outcome);

        // Distribute fees immediately upon resolution
        let total_pool = market.total_yes.checked_add(market.total_no).unwrap();
        if total_pool > 0 {
            let platform_fee = (total_pool as u128)
                .checked_mul(PLATFORM_SHARE_BPS as u128)
                .unwrap()
                .checked_div(10000)
                .unwrap() as u64;

            let streamer_fee = (total_pool as u128)
                .checked_mul(STREAMER_SHARE_BPS as u128)
                .unwrap()
                .checked_div(10000)
                .unwrap() as u64;

            let escrow_info = ctx.accounts.escrow.to_account_info();
            let escrow_lamports = escrow_info.lamports();

            // Platform fee
            if platform_fee > 0 && escrow_lamports >= platform_fee {
                **escrow_info.lamports.borrow_mut() = escrow_lamports.checked_sub(platform_fee).unwrap();
                **ctx.accounts.platform_fee_wallet.lamports.borrow_mut() = ctx
                    .accounts
                    .platform_fee_wallet
                    .lamports()
                    .checked_add(platform_fee)
                    .unwrap();
            }

            // Streamer fee
            let escrow_lamports_after_platform = escrow_info.lamports();
            if streamer_fee > 0 && escrow_lamports_after_platform >= streamer_fee {
                **escrow_info.lamports.borrow_mut() = escrow_lamports_after_platform
                    .checked_sub(streamer_fee)
                    .unwrap();
                **ctx.accounts.streamer_fee_wallet.lamports.borrow_mut() = ctx
                    .accounts
                    .streamer_fee_wallet
                    .lamports()
                    .checked_add(streamer_fee)
                    .unwrap();
            }
        }

        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let market = &ctx.accounts.market;
        let bet = &mut ctx.accounts.bet;

        require!(market.resolved, ErrorCode::MarketNotResolved);
        require!(!bet.claimed, ErrorCode::AlreadyClaimed);

        let outcome = market.outcome.ok_or(ErrorCode::MarketNotResolved)?;
        require!(bet.side == outcome, ErrorCode::NotAWinner);

        let total_pool = market.total_yes.checked_add(market.total_no).unwrap();
        let winning_total = match outcome {
            Side::Yes => market.total_yes,
            Side::No => market.total_no,
        };

        require!(winning_total > 0, ErrorCode::NoWinners);

        let platform_fee = (total_pool as u128)
            .checked_mul(PLATFORM_SHARE_BPS as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        let streamer_fee = (total_pool as u128)
            .checked_mul(STREAMER_SHARE_BPS as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        let winner_pool = total_pool
            .checked_sub(platform_fee)
            .unwrap()
            .checked_sub(streamer_fee)
            .unwrap();

        let user_share = (bet.amount as u128)
            .checked_mul(winner_pool as u128)
            .unwrap()
            .checked_div(winning_total as u128)
            .unwrap() as u64;

        require!(user_share > 0, ErrorCode::NoWinnings);

        let escrow_info = ctx.accounts.escrow.to_account_info();
        let escrow_lamports = escrow_info.lamports();
        require!(escrow_lamports >= user_share, ErrorCode::InsufficientEscrow);

        **escrow_info.lamports.borrow_mut() = escrow_lamports.checked_sub(user_share).unwrap();
        **ctx.accounts.user.lamports.borrow_mut() = ctx
            .accounts
            .user
            .lamports()
            .checked_add(user_share)
            .unwrap();

        bet.claimed = true;

        Ok(())
    }

    pub fn update_admin(ctx: Context<UpdateAdmin>, new_admin: Pubkey) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.config.admin, ErrorCode::Unauthorized);
        ctx.accounts.config.admin = new_admin;
        Ok(())
    }

    pub fn update_platform_fee_wallet(ctx: Context<UpdatePlatformFeeWallet>, new_wallet: Pubkey) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.config.admin, ErrorCode::Unauthorized);
        ctx.accounts.config.platform_fee_wallet = new_wallet;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: Platform fee wallet, just receives lamports
    pub platform_fee_wallet: AccountInfo<'info>,
    #[account(
        init,
        payer = admin,
        seeds = [b"config"],
        bump,
        space = 8 + Config::SIZE
    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(streamer_steam_id: String, achievement_id: String, achievement_name: String, achievement_description: String, deadline: i64, streamer_fee_recipient: Pubkey)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(
        init,
        payer = creator,
        seeds = [b"market", creator.key().as_ref(), &config.market_counter.to_le_bytes()],
        bump,
        space = 8 + Market::SIZE
    )]
    pub market: Account<'info, Market>,
    #[account(
        seeds = [b"escrow", market.key().as_ref()],
        bump
    )]
    /// CHECK: Escrow PDA, holds SOL
    pub escrow: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(side: Side, amount: u64)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(
        mut,
        seeds = [b"escrow", market.key().as_ref()],
        bump = market.escrow_bump
    )]
    /// CHECK: Escrow PDA
    pub escrow: AccountInfo<'info>,
    #[account(
        init,
        payer = user,
        seeds = [b"bet", market.key().as_ref(), user.key().as_ref()],
        bump,
        space = 8 + Bet::SIZE
    )]
    pub bet: Account<'info, Bet>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    pub oracle: Signer<'info>,
    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(
        mut,
        seeds = [b"escrow", market.key().as_ref()],
        bump = market.escrow_bump
    )]
    /// CHECK: Escrow PDA
    pub escrow: AccountInfo<'info>,
    /// CHECK: Platform fee wallet
    #[account(mut, address = config.platform_fee_wallet)]
    pub platform_fee_wallet: AccountInfo<'info>,
    /// CHECK: Streamer fee wallet
    #[account(mut, address = market.streamer_fee_recipient)]
    pub streamer_fee_wallet: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(
        mut,
        seeds = [b"escrow", market.key().as_ref()],
        bump = market.escrow_bump
    )]
    /// CHECK: Escrow PDA
    pub escrow: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"bet", market.key().as_ref(), user.key().as_ref()],
        bump = bet.bump,
        constraint = bet.user == user.key()
    )]
    pub bet: Account<'info, Bet>,
}

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    pub admin: Signer<'info>,
    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
pub struct UpdatePlatformFeeWallet<'info> {
    pub admin: Signer<'info>,
    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,
}

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub platform_fee_wallet: Pubkey,
    pub market_counter: u64,
    pub bump: u8,
}

impl Config {
    pub const SIZE: usize = 32 + 32 + 8 + 1;
}

#[account]
pub struct Market {
    pub creator: Pubkey,
    pub market_id: u64,
    pub streamer_steam_id: String,
    pub achievement_id: String,
    pub achievement_name: String,
    pub achievement_description: String,
    pub deadline: i64,
    pub resolved: bool,
    pub outcome: Option<Side>,
    pub total_yes: u64,
    pub total_no: u64,
    pub escrow_bump: u8,
    pub streamer_fee_recipient: Pubkey,
    pub bump: u8,
}

impl Market {
    // String sizes: 4 + len for each. Max: steam_id 32, achievement_id 64, achievement_name 128, achievement_description 256
    pub const SIZE: usize = 32 + 8 + (4 + 32) + (4 + 64) + (4 + 128) + (4 + 256) + 8 + 1 + (1 + 1) + 8 + 8 + 1 + 32 + 1;
}

#[account]
pub struct Bet {
    pub user: Pubkey,
    pub market: Pubkey,
    pub amount: u64,
    pub side: Side,
    pub claimed: bool,
    pub bump: u8,
}

impl Bet {
    pub const SIZE: usize = 32 + 32 + 8 + 1 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Side {
    Yes,
    No,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid deadline")]
    InvalidDeadline,
    #[msg("Steam ID too long")]
    SteamIdTooLong,
    #[msg("Achievement ID too long")]
    AchievementIdTooLong,
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Market already resolved")]
    MarketAlreadyResolved,
    #[msg("Market expired")]
    MarketExpired,
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
    #[msg("Deadline not reached")]
    DeadlineNotReached,
    #[msg("Market not resolved")]
    MarketNotResolved,
    #[msg("Already claimed")]
    AlreadyClaimed,
    #[msg("Not a winner")]
    NotAWinner,
    #[msg("No winners")]
    NoWinners,
    #[msg("No winnings")]
    NoWinnings,
    #[msg("Insufficient escrow")]
    InsufficientEscrow,
    #[msg("Unauthorized")]
    Unauthorized,
}
