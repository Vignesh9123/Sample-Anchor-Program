use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("9huWatngu9PV7nHSDjshBgbgA3HXPNKMQ4Q6VWgemF5V");

#[program]
pub mod sample {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let amount = 500_000_000;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.from.to_account_info(),
                    to: ctx.accounts.to.to_account_info(),
                },
            ),
            amount,
        )?;

        msg!("Transferred {} lamports", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub from: Signer<'info>,

    #[account(mut)]
    pub to: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}
