use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("9huWatngu9PV7nHSDjshBgbgA3HXPNKMQ4Q6VWgemF5V");

#[program]
pub mod sample {
    use super::*;

    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {

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

    pub fn initialize_vault(ctx:Context<InitializeVault>) -> Result<()>{
        msg!("Vault initialized at {} with bump {}", ctx.accounts.vault.key(),ctx.bumps.vault);
        ctx.accounts.vault.authority = ctx.accounts.user.key();
        Ok(())
    }

    pub fn transfer_to_vault(ctx:Context<TransferToVault>, amount: u64) -> Result<()>{
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn transfer_to_user_from_vault(ctx: Context<TransferToUserFromVault>, amount: u64)->Result<()>{
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub from: Signer<'info>,

    #[account(mut)]
    pub to: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeVault<'info>{
    #[account(
        init,
        payer = user,
        space = 8 + size_of::<VaultStruct>(),
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: Account<'info,VaultStruct>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct TransferToVault<'info>{
    #[account(
        mut,
        seeds = [b"vault",user.key().as_ref()],
        bump
    )]
    pub vault: Account<'info,VaultStruct>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>

}

#[derive(Accounts)]
pub struct TransferToUserFromVault<'info>{
    #[account(
        mut,
        seeds = [b"vault",user.key().as_ref()],
        bump
    )]
    pub vault: Account<'info,VaultStruct>,
    #[account(mut)]
    pub user: SystemAccount<'info>,
    pub system_program: Program<'info, System>

}


#[account]
pub struct VaultStruct {
    pub authority: Pubkey,
}
