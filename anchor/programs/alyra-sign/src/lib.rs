use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("VOTRE_PROGRAM_ID");

#[program]
pub mod alyra_sign {
    use super::*;

    pub fn create_formation(
        ctx: Context<CreateFormation>,
        nom: String,
        description: String,
        date_debut: String,
        date_fin: String,
    ) -> Result<()> {
        let formation = &mut ctx.accounts.formation;
        formation.nom = nom;
        formation.description = description;
        formation.date_debut = date_debut;
        formation.date_fin = date_fin;
        formation.admin = ctx.accounts.admin.key();
        formation.sessions = vec![];
        Ok(())
    }

    pub fn create_session(
        ctx: Context<CreateSession>,
        nom: String,
        date: String,
        heure_debut: String,
        heure_fin: String,
    ) -> Result<()> {
        let session = &mut ctx.accounts.session;
        session.nom = nom;
        session.date = date;
        session.heure_debut = heure_debut;
        session.heure_fin = heure_fin;
        session.formation = ctx.accounts.formation.key();
        session.presences = vec![];
        Ok(())
    }

    pub fn register_presence(
        ctx: Context<RegisterPresence>,
        etudiant_id: String,
        nom: String,
        prenom: String,
        signature: String,
        timestamp: String,
    ) -> Result<()> {
        let presence = &mut ctx.accounts.presence;
        presence.etudiant_id = etudiant_id;
        presence.nom = nom;
        presence.prenom = prenom;
        presence.signature = signature;
        presence.timestamp = timestamp;
        presence.session = ctx.accounts.session.key();
        presence.is_validated = false;
        Ok(())
    }

    pub fn validate_presence(ctx: Context<ValidatePresence>) -> Result<()> {
        let presence = &mut ctx.accounts.presence;
        presence.is_validated = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateFormation<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 4 + 100 + 4 + 200 + 4 + 20 + 4 + 20 + 4 + 32 + 4 + 32 * 10
    )]
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateSession<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 4 + 100 + 4 + 20 + 4 + 20 + 4 + 20 + 4 + 32 + 4 + 32 * 50
    )]
    pub session: Account<'info, Session>,
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterPresence<'info> {
    #[account(
        init,
        payer = student,
        space = 8 + 4 + 50 + 4 + 100 + 4 + 100 + 4 + 1000 + 4 + 20 + 4 + 32 + 1
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
    pub admin: Signer<'info>,
}

#[account]
pub struct Formation {
    pub nom: String,
    pub description: String,
    pub date_debut: String,
    pub date_fin: String,
    pub admin: Pubkey,
    pub sessions: Vec<Pubkey>,
}

#[account]
pub struct Session {
    pub nom: String,
    pub date: String,
    pub heure_debut: String,
    pub heure_fin: String,
    pub formation: Pubkey,
    pub presences: Vec<Pubkey>,
}

#[account]
pub struct Presence {
    pub etudiant_id: String,
    pub nom: String,
    pub prenom: String,
    pub signature: String,
    pub timestamp: String,
    pub session: Pubkey,
    pub is_validated: bool,
} 