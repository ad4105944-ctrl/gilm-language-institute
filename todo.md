# Project TODO - GILM Language Institute

- [x] Créer le schéma de base de données Supabase (`supabase/schema.sql`) avec les 10 tables et les RLS complets
- [x] Créer le script d'initialisation des 4 comptes (`supabase/seed_four_accounts.sql`)
- [x] Configurer la connexion Supabase et les types TypeScript correspondants
- [x] Implémenter la page de connexion (Ahmed, Amar, Cheybai, Tiki) avec conversion en e-mail interne `@gilm.example`
- [x] Implémenter les routes API côté serveur (`/api/teacher`, `/api/plan`, `/api/transcribe`, `/api/speech`) avec intégration sécurisée d'OpenAI et validation stricte (langue `en` ou `fr`, authentification)
- [x] Développer la page **Today** (`app/today`) affichant le plan adaptatif, les sessions et les scores fondés sur des preuves réelles (`Collecting evidence` si absentes)
- [x] Développer la page **Teacher** (`app/teacher`) avec chat interactif, Push-to-Talk (MediaRecorder), TTS audio et journalisation Supabase
- [x] Développer la page **Progress** (`app/progress`) avec indicateurs par langue (EN/FR) basés exclusivement sur les `learning_evidence`
- [x] Rédiger et exécuter les tests unitaires Vitest pour valider les routes et la sécurité
- [x] Appliquer `supabase/schema.sql` et `supabase/seed_four_accounts.sql` au projet Supabase distant après correction de l'URL ou création du projet réel
- [x] Implémenter une gestion robuste des erreurs et des EMA pour les scores d'apprentissage
- [x] Rédiger des tests Vitest complets pour les routes `/api/plan`, `/api/teacher`, `/api/transcribe`, `/api/speech`, `/api/progress`
- [x] Créer le checkpoint final et préparer la livraison du projet
