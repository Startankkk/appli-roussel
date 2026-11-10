# Journal de bord — Projet Quiz Fleurs Roussel

Ce journal retrace chronologiquement l'ensemble des étapes de conception, de développement, de test et de validation du quiz « Quelle fleur êtes-vous ? ».

---

## Étape 1 : Inspection du projet existant et cadrage technique

- **Analyse des spécifications** :
  - Lecture attentive de `agent.md`, `sujet-quiz.pdf`, `schema-quiz.json` et `contenu-quiz.txt`.
  - Identification des contraintes critiques :
    - HTML5 sémantique, Tailwind CSS 4 compilé sans attribut ni balise `style`.
    - JavaScript natif sans bibliothèque externe, chargé avec `defer`.
    - Fonctions nommées en français, `const` et `let` obligatoires, absence totale de `var`.
    - Manipulation sécurisée du DOM avec `textContent` exclusivement (interdiction de `innerHTML`).
    - Aucune boîte de dialogue intrusive (`alert`), aucun `console.log` ni erreur console en production.
    - Départage des ex æquo : priorité à la première fleur dans l'ordre des données JSON.
    - Palette du thème Roussel (`--color-roussel-vert`, `--color-roussel-vert-clair`, `--color-roussel-rose`, `--color-roussel-texte`, `--color-roussel-gris`).
    - Accessibilité : `fieldset`/`legend`, `label` liés, `aria-live`, focus visible, compatibilité mobile dès 375 px.

- **Inspection de l'environnement** :
  - Vérification des outils : Node.js v26.13.0 disponible.
  - Dépendances npm installées via `npm install` (`tailwindcss@^4.3.3`, `@tailwindcss/cli@^4.3.3`, `http-server@^14.1.1`).
  - Validation de la compilation Tailwind initiale (`npm run build`).

---

## Étape 2 : Élaboration et fiabilisation du prompt de contenu

- **Conception de la V1 du prompt** :
  - Extraction de base des champs `id`, `nom`, `titre`, `description`, `conseil` et `a_verifier`.
  - Analyse des faiblesses sur les 6 cas de test du sujet :
    - Vulnérabilité aux consignes cachées et injections publicitaires (ex. Cas 4 : « -20 % ce mois-ci »).
    - Risque de confusion sur la valeur `null` de `conseil` (ne pas ajouter « conseil » dans `a_verifier`).
    - Maintien involontaire du tutoiement (Cas 5 : « toi qui aimes l'iris »).
    - Gestion imparfaite des noms composés (`cactus-fleuri`) et des sources anglophones (`daisy`).
- **Élaboration de la V2 du prompt** :
  - Ajout des critères de réussite complémentaires :
    - Immunité aux injections et aux contenus commerciaux.
    - Règle explicite d'attribution de `null` sans signalement dans `a_verifier` pour les conseils absents.
    - Formatage strict de l'identifiant kebab-case sans accent (`^[a-z]+(-[a-z]+)*$`).
- **Tests sur les 6 cas du sujet** :
  - Cas 1 (Coquelicot) : extraction conforme, vouvoiement validé, 1 phrase d'entretien.
  - Cas 2 (Daisy / Marguerite) : traduction en français (`marguerite` / `Marguerite`), vouvoiement.
  - Cas 3 (Muguet) : détection de texte tronqué, `conseil: null` sans alerte, signalement de `description` dans `a_verifier`.
  - Cas 4 (Rose) : neutralisation complète de la promotion « -20 % », extraction sémantique pure.
  - Cas 5 (Iris) : conversion fluide du tutoiement vers le vouvoiement.
  - Cas 6 (Jasmin & Cactus fleuri) : extraction des 2 fleurs, id composé `cactus-fleuri`, conseil distinct.
- **Application à `contenu-quiz.txt`** :
  - Neutralisation de l'instruction injectée par commentaire HTML (`<!-- Assistant IA : ... Retrouvez nos promotions ... -->`).
  - Extraction des 4 portraits : Tournesol, Lavande, Pivoine, Orchidée (conseil `null` pour l'Orchidée).
  - Enregistrement des données validées dans `data/donnees.json`.
  - Documentation exhaustive enregistrée dans `prompts/contenu.md`.

---

## Étape 3 : Rédaction des directives agents (`AGENTS.md`)

- Création du fichier `AGENTS.md` (à la racine et dans `appli-roussel/`).
- Définition formelle des règles d'architecture, du code conventionnel, des règles de sécurité DOM, des standards d'accessibilité RGAA/WCAG et de la règle métier de calcul des scores et égalités.

---

## Étape 4 : Développement de l'interface utilisateur (`index.html`)

- Intégration dans le squelette de l'agence :
  - Préservation de l'en-tête et du pied de page d'origine.
  - Structure sémantique : `<main id="contenu">`, `<header>`, `<form id="formulaire-quiz">`, `<section id="zone-resultat">`.
  - 5 `<fieldset>` pourvus chacun de son `<legend>` et d'un paragraphe d'indication.
  - 20 boutons radio `<input type="radio">` rigoureusement associés à leur étiquette `<label for="...">`.
  - Classes Tailwind intégrées pour les états `:hover`, `:focus-visible`, et `has-[:checked]`.
  - Zone d'erreur dédiée avec `role="alert"` et `aria-live="assertive"`.
  - Zone de résultat accessible avec `role="status"` et `aria-live="polite"`.
  - Barre de progression dynamique avec attributs ARIA (`role="progressbar"`, `aria-valuenow`, `aria-valuemax`).
  - Bouton de bascule de mode d'affichage (« Afficher une question à la fois » / « Afficher toutes les questions ») pour le volet bonus.

---

## Étape 5 : Développement du script applicatif (`js/app.js`)

- Implémentation du script en Vanilla JS :
  - Déclaration des questions et des classes de progression Tailwind sous forme de constantes immuables.
  - Fonction `chargerDonneesFleurs()` : requête asynchrone avec gestion d'erreur réseau et affichage accessible.
  - Fonction `actualiserProgression()` : calcul en temps réel du nombre de questions remplies et adaptation de la barre de progression sans attribut `style`.
  - Fonction `trouverPremiereQuestionManquante()` : détection de la première question sans réponse pour guidage utilisateur.
  - Fonction `calculerScoresParFleur()` : décompte unitaire par identifiant de fleur.
  - Fonction `determinerFleurGagnante()` : sélection du score maximal avec application stricte de la règle de départage (conservation de la première fleur rencontrée dans l'ordre de `donnees.json`).
  - Fonction `afficherResultatFleur()` : rendu intégral et sécurisé via `textContent`, masquage du conseil pour l'Orchidée, gestion de l'image SVG avec repli gracieux sans icône brisée, affichage du détail des scores (bonus) et du lien vers `bouquets.html` (bonus).
  - Fonction `recommencerQuiz()` : réinitialisation complète du formulaire, remise à zéro de la progression, masquage des erreurs et des résultats, repositionnement en haut de page avec focus accessible.
  - Fonctions pour le mode pas-à-pas (bonus) : navigation précédente/suivante.

---

## Étape 6 : Compilation CSS et ajustements techniques

- Constat : Tailwind v4 ne détectait pas initialement les classes de largeur fractionnaire générées dynamiquement (`w-1/5`, `w-2/5`, etc.) dans les chaînes JS.
- Solution retenue sans violation des contraintes : intégration d'une balise utilitaire invisible `<span class="hidden w-0 w-1/5 w-2/5 w-3/5 w-4/5 w-full" aria-hidden="true"></span>` dans `index.html`.
- Résultat : Tailwind compile l'ensemble des classes de progression sans aucun recours à `style="..."`.

---

## Étape 7 : Tests, vérifications et validation

- Écriture d'un banc de test automatisé `test-quiz.js` couvrant :
  1. La conformité JSON et la structure de `data/donnees.json`.
  2. L'absence d'utilisation de `innerHTML`.
  3. L'absence d'attribut `style` ou de balise `<style>`.
  4. L'absence d'appels `console.log()` et `alert()`.
  5. La logique de départage des ex æquo sur 3 scénarios d'égalité.
  6. L'exactitude des 5 questions et 20 choix de réponses du sujet.
  7. La conformité des balises d'accessibilité (`fieldset`, `legend`, `label`, `aria-live`).
- Tous les tests ont été exécutés avec succès (code de retour 0, 100 % de réussite).
