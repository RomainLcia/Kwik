# Kwik

Logiciel de devis et factures pour artisans et prestataires : créer un devis, l'envoyer par email, le faire signer en ligne, le convertir en facture. Abonnement mensuel via Stripe.

En ligne : https://www.kwik-devis.fr

## Comment c'est construit

| Pièce | Rôle |
|---|---|
| **Next.js 16** (ce dépôt) | L'application : pages, actions serveur, génération des PDF |
| **Vercel** | Hébergement (région Paris `cdg1`). Chaque push sur `main` est mis en production automatiquement |
| **Supabase** | Base de données Postgres, comptes utilisateurs, stockage de fichiers |
| **Stripe** | Abonnements (3 formules, 14 jours d'essai) |
| **Resend** | Emails (envoi des devis, confirmation de signature, bienvenue, fin d'essai) |

## Démarrer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

### Variables d'environnement (`.env.local`)

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accès Supabase côté navigateur (publiques) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé maître Supabase, uniquement côté serveur (page publique de signature, webhook) |
| `STRIPE_SECRET_KEY` | API Stripe |
| `STRIPE_WEBHOOK_SECRET` | Vérification des événements envoyés par Stripe |
| `STRIPE_PRICE_ID_BASIC`, `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_UNLIMITED` | Identifiants des 3 formules |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Envoi des emails |

Les mêmes variables doivent exister dans Vercel (Settings → Environment Variables) pour la production.

## Organisation du code

```
app/
  page.tsx              Site vitrine
  (app)/                Application connectée : dashboard, quotes, invoices, clients, catalog, settings
  login, signup, …      Authentification et onboarding
  subscribe/            Choix de la formule
  q/[token]/            Page publique : le client consulte et signe le devis
  actions/              Actions serveur (enregistrer, envoyer, signer, facturer…)
  api/                  PDF et routes Stripe (checkout, portal, webhook)
components/             Interface (formulaire de devis, PDF, navigation…)
lib/                    Clients Supabase (navigateur, serveur, service) et Stripe
proxy.ts                Redirige vers /login si non connecté
supabase-schema.sql     Schéma de la base (tables, règles d'accès, fonctions)
```

## Points importants

- **Accès à l'app** : `proxy.ts` exige une connexion ; `app/(app)/layout.tsx` exige une entreprise et un abonnement `trial` ou `active`.
- **Isolation des données** : les règles RLS de Supabase limitent chaque utilisateur aux données de son entreprise. Aucune lecture publique n'est autorisée ; la page `/q/[token]` passe par la clé service et filtre sur le token.
- **Numérotation** : les numéros de devis et de factures sont attribués par la base (`next_quote_number`, `create_invoice_from_quote`), de façon atomique. La numérotation des factures est continue, sans trou ni doublon.
- **Quotas** : Basique 10 devis/mois, Pro 30, Illimité sans limite (`app/actions/quotes.ts`), vérifiés à l'enregistrement d'un nouveau devis.
- **Abonnement** : le statut et la formule sont recopiés depuis Stripe par `app/api/stripe/webhook/route.ts`.

## Mettre en ligne

```bash
git push origin main
```

Vercel reconstruit et publie en une minute environ. Il n'y a pas d'environnement de préproduction : une branche autre que `main` donne une URL de prévisualisation Vercel.

Toute modification de la base se fait dans Supabase et doit être reportée dans `supabase-schema.sql`.
