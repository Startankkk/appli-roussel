# Directives pour agents et conventions du projet Fleurs Roussel

Ce document définit les conventions d'intégration, les règles d'architecture et les exigences de développement pour l'application interactive « Quelle fleur êtes-vous ? » de **Fleurs Roussel**.

---

## 1. Stack technique et contraintes d'environnement

- **HTML5** standard et sémantique.
- **Tailwind CSS 4** compilé (`npm run dev` ou `npm run build`), sans attribut `style=""` ni balise `<style>`.
- **JavaScript natif (Vanilla JS)** sans framework, ni bibliothèque, ni CDN externe.
- Emplacement des fichiers :
  - Page principale : `index.html`
  - Script principal : `js/app.js` (chargé avec l'attribut `defer` dans le `<head>`)
  - Feuille de style source : `src/input.css`
  - Feuille de style compilée : `dist/output.css`
  - Données JSON : `data/donnees.json` (format conforme à `schema-quiz.json`)
  - Images SVG : `img/fleurs/`

---

## 2. Thème Roussel

Toutes les couleurs de l'application doivent s'appuyer sur la palette officielle définie dans `src/input.css` :

- Vert Roussel : `#2f5d3a` (`bg-roussel-vert`, `text-roussel-vert`, `border-roussel-vert`, etc.)
- Vert clair Roussel : `#e7f0e9` (`bg-roussel-vert-clair`, etc.)
- Rose Roussel : `#b0305c` (`bg-roussel-rose`, `text-roussel-rose`, `border-roussel-rose`, etc.)
- Texte Roussel : `#1f2421` (`text-roussel-texte`)
- Gris Roussel : `#555c57` (`text-roussel-gris`, `border-roussel-gris`)

---

## 3. Règles de développement JavaScript

1. **Chargement et déclaration** :
   - Fichier unique `js/app.js` avec chargement en différé (`defer`).
   - Utilisation stricte de `const` et `let` (aucun `var`).
   - Fonctions déclarées et nommées en français, systématiquement documentées (JSDoc ou commentaires clairs).

2. **Sécurité et manipulation du DOM** :
   - **Interdiction absolue de `innerHTML`** pour injecter du texte ou du contenu dynamique : toujours utiliser `textContent` ou la création sécurisée d'éléments DOM (`document.createElement`, `classList`, etc.).
   - Aucun appel à `alert()`, `confirm()` ou `prompt()`.
   - **Aucun `console.log()`** ni erreur console non gérée dans la livraison finale.

3. **Flux de données** :
   - Lecture asynchrone de `data/donnees.json` via l'API standard `fetch()`.
   - Traitement robuste des erreurs (fichiers manquants ou réseau inaccessible) via un message accessible dans le DOM.

---

## 4. Règles d'accessibilité (a11y) et d'ergonomie

1. **Sémantique et formulaires** :
   - Chaque question du quiz doit être encapsulée dans un élément `<fieldset>` avec sa légende descriptive `<legend>`.
   - Chaque choix de réponse est un bouton radio `<input type="radio">` obligatoirement relié à son étiquette `<label for="...">`.
   - Unicité des attributs `id` et cohérence des `name` par question.

2. **Navigation au clavier et focus** :
   - Tous les éléments interactifs (boutons radio, boutons de validation et réinitialisation, liens) doivent être navigables au clavier (Tab, touches fléchées, Entrée, Espace).
   - Le focus doit être clairement visible avec les classes Tailwind adaptées (ex. `focus-visible:ring-2 focus-visible:ring-roussel-vert focus-visible:outline-none`).

3. **Retours dynamiques et lecteurs d'écran** :
   - Les alertes (question manquante, erreur de chargement) et la zone de résultat doivent utiliser des zones d'annonce dynamiques `aria-live="polite"` ou `aria-live="assertive"`, avec les rôles ARIA adéquats (`role="status"`, `role="alert"`).
   - En cas d'erreur de sélection, le focus ou le défilement doit orienter l'utilisateur vers la question manquante.

4. **Responsive design** :
   - Affichage parfait et sans débordement horizontal dès 375 px de largeur d'écran (mobiles standards) jusqu'aux écrans de bureau (1024 px et au-delà).

---

## 5. Règles métier du quiz

1. **Questions et options** :
   - 5 questions fixes, 4 réponses par question.
   - Exactement une réponse possible par question.
   - Les 4 fleurs candidates correspondent aux 4 identifiants : `tournesol`, `lavande`, `pivoine`, `orchidee`.

2. **Validation** :
   - Avant d'afficher un résultat, s'assurer que les 5 questions ont une réponse cochée.
   - Si une réponse manque, indiquer explicitement laquelle à l'utilisateur (sans afficher de fleur).

3. **Calcul du score et départage** :
   - Chaque réponse compte pour 1 point attribué à la fleur associée.
   - La fleur ayant le total le plus élevé est déclarée gagnante.
   - En cas d'égalité de scores, la règle de départage stricte s'applique : **la première fleur ex æquo dans l'ordre des données JSON l'emporte**.

4. **Présentation du résultat** :
   - Affichage du nom, du titre, de la description et du conseil d'entretien de la fleur gagnante s'il existe.
   - Si le conseil est `null`, masquer ou omettre la section de conseil sans laisser de texte vide.

5. **Réinitialisation** :
   - Bouton « Recommencer le quiz » permettant de désélectionner toutes les réponses, de masquer les résultats et messages d'erreur, et de repositionner l'utilisateur au départ.
