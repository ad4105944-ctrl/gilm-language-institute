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

- [ ] Remplacer uniquement `VITE_SUPABASE_URL` par `https://feaxpoleoyptdtaldgwx.supabase.co` sans recréer ni modifier le schéma, les RLS ou les comptes
- [ ] Vérifier la connectivité Supabase et le parcours de connexion Ahmed après correction

- [x] Diagnostiquer l’erreur persistante `fetch failed` sur le site publié sans modifier le schéma, les RLS ni les comptes Supabase
- [ ] Vérifier que `VITE_SUPABASE_URL` chargé par Preview/Production est exactement `https://feaxpoleoyptdtaldgwx.supabase.co` sans contourner la vérification par une valeur codée en dur
- [ ] Tester le parcours publié de connexion Ahmed après rechargement des secrets et confirmer la disparition de `fetch failed`
- [x] Tester directement l’API REST du projet Supabase correct avec la clé publishable configurée (HTTP 200)

- [x] Vérifier que le choix Ahmed produit exactement `ahmed@gilm.example` sans journaliser le mot de passe
- [x] Vérifier l’utilisation de `signInWithPassword` avec l’URL et la clé publishable runtime correctes
- [x] Afficher le code/message Supabase Auth exact en cas d’échec, sans exposer le mot de passe
- [ ] Tester une connexion Ahmed réelle après rebuild/redeploy, sans tester OpenAI ni modifier Supabase
