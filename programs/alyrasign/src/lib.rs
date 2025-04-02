use anchor_lang::prelude::*;

declare_id!("CCV4MnQ75r8ZY7n1ijtRkEv9MGdvkfZAYy23ggtYMf5r");

#[program]
pub mod alyrasign {
    use super::*;

    pub fn create_formation(
        ctx: Context<CreateFormation>,
        name: String,
        description: String,
    ) -> Result<()> {
        let formation = &mut ctx.accounts.formation;
        formation.name = name;
        formation.description = description;
        formation.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn create_session(
        ctx: Context<CreateSession>,
        date: i64,
        description: String,
    ) -> Result<()> {
        let session = &mut ctx.accounts.session;
        session.formation = ctx.accounts.formation.key();
        session.date = date;
        session.description = description;
        session.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn register_presence(
        ctx: Context<RegisterPresence>,
        timestamp: i64,
    ) -> Result<()> {
        let presence = &mut ctx.accounts.presence;
        presence.session = ctx.accounts.session.key();
        presence.student = ctx.accounts.student.key();
        presence.timestamp = timestamp;
        presence.is_validated = false;
        Ok(())
    }

    pub fn validate_presence(ctx: Context<ValidatePresence>) -> Result<()> {
        let presence = &mut ctx.accounts.presence;
        require!(
            ctx.accounts.authority.key() == ctx.accounts.session.authority,
            AlyraSignError::UnauthorizedValidation
        );
        presence.is_validated = true;
        Ok(())
    }

    pub fn create_student_group(
        ctx: Context<CreateStudentGroup>,
        name: String,
        students: Vec<String>,
        formations: Vec<String>,
    ) -> Result<()> {
        let group = &mut ctx.accounts.group;
        group.name = name;
        group.students = students;
        group.formations = formations;
        group.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateFormation<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 100 + 500 // discriminator + pubkey + name + description
    )]
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateSession<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 500 + 32 // discriminator + formation + date + description + authority
    )]
    pub session: Account<'info, Session>,
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterPresence<'info> {
    #[account(
        init,
        payer = student,
        space = 8 + 32 + 32 + 8 + 1 // discriminator + session + student + timestamp + is_validated
    )]
    pub presence: Account<'info, Presence>,
    pub session: Account<'info, Session>,
    #[account(mut)]
    pub student: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidatePresence<'info> {
    #[account(mut)]
    pub presence: Account<'info, Presence>,
    pub session: Account<'info, Session>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateStudentGroup<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 100 + 4000 + 4000 // discriminator + authority + name + students + formations
    )]
    pub group: Account<'info, StudentGroup>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Formation {
    pub authority: Pubkey,
    pub name: String,
    pub description: String,
}

#[account]
pub struct Session {
    pub formation: Pubkey,
    pub date: i64,
    pub description: String,
    pub authority: Pubkey,
}

#[account]
pub struct Presence {
    pub session: Pubkey,
    pub student: Pubkey,
    pub timestamp: i64,
    pub is_validated: bool,
}

#[account]
pub struct StudentGroup {
    pub authority: Pubkey,
    pub name: String,
    pub students: Vec<String>,
    pub formations: Vec<String>,
}

#[error_code]
pub enum AlyraSignError {
    #[msg("Seul l'autorité de la session peut valider les présences")]
    UnauthorizedValidation,
} 