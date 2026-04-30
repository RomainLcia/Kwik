'use server'

import { Resend } from 'resend'

export async function sendWelcomeEmail(email: string, companyName: string) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  await resend.emails.send({
    from: `Kwik <${fromEmail}>`,
    to: [email],
    subject: 'Bienvenue sur Kwik — votre essai gratuit commence maintenant',
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;margin:0;padding:0;background:#F9FAFB;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#2563EB;color:white;padding:28px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Bienvenue sur Kwik 👋</h1>
      <p style="margin:8px 0 0;font-size:15px;opacity:0.85;">Le devis en 3 minutes depuis votre téléphone.</p>
    </div>
    <div style="background:white;padding:28px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 10px 10px;">
      <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${companyName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#4B5563;">Votre compte est prêt. Vous disposez de <strong>14 jours d'essai gratuit</strong> pour tester toutes les fonctionnalités.</p>

      <div style="background:#EFF6FF;border-radius:8px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#1E40AF;">Pour bien démarrer :</p>
        <p style="margin:0 0 8px;font-size:14px;color:#1D4ED8;">① Créez votre premier devis en cliquant sur « + Nouveau devis »</p>
        <p style="margin:0 0 8px;font-size:14px;color:#1D4ED8;">② Ajoutez vos prestations dans le catalogue</p>
        <p style="margin:0;font-size:14px;color:#1D4ED8;">③ Envoyez-le à votre client par email</p>
      </div>

      <a href="https://www.kwik-devis.fr/dashboard" style="display:inline-block;background:#2563EB;color:white;padding:13px 26px;border-radius:7px;text-decoration:none;font-weight:600;font-size:15px;">Accéder à mon espace →</a>

      <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;">Une question ? Répondez simplement à cet email.</p>
    </div>
    <p style="color:#9CA3AF;font-size:11px;text-align:center;margin:16px 0 0;">Kwik — Le devis en 3 minutes · <a href="https://www.kwik-devis.fr" style="color:#9CA3AF;">kwik-devis.fr</a></p>
  </div>
</body>
</html>`,
  })
}
