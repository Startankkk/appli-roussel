# Rapport des tests et résultats de validation — Fleurs Roussel

Ce document récapitule l'ensemble des contrôles fonctionnels, techniques et d'accessibilité effectués sur l'application « Quelle fleur êtes-vous ? », conformément aux directives de la fiche sujet et d'`agent.md`.

---

## 1. Résultats des vérifications obligatoires

| Point de contrôle | Scénario testé | Comportement attendu | Résultat obtenu | Statut |
| :--- | :--- | :--- | :--- | :---: |
| **1. Réponses manquantes** | Soumission avec la question 3 non cochée | Blocage de la soumission, aucun résultat affiché, affichage de l'alerte « Veuillez répondre à la question 3 (« On vous décrit souvent comme… ») » et focus sur la question 3 | Alerte explicite affichée dans la zone `aria-live`, résultat masqué, défilement et focus automatiques sur le premier choix de la question 3 | **CONFORME** |
| **2. Calcul des scores** | Sélection d'un profil unanime (ex. 5 choix Tournesol) | 5 points attribués au Tournesol, 0 aux autres fleurs | Tournesol calculé avec 5 votes, affiché en fleur gagnante avec tous ses attributs | **CONFORME** |
| **3. Égalité des scores (départage)** | - Tournesol (2) vs Lavande (2) vs Pivoine (1)<br>- Lavande (2) vs Pivoine (2) vs Orchidée (1)<br>- Pivoine (2) vs Orchidée (2) vs Tournesol (1) | La première fleur ex æquo dans l'ordre de `donnees.json` l'emporte :<br>- Tournesol gagne<br>- Lavande gagne<br>- Pivoine gagne | - Cas 1 : Tournesol déclaré gagnant<br>- Cas 2 : Lavande déclarée gagnante<br>- Cas 3 : Pivoine déclarée gagnante | **CONFORME** |
| **4. Redémarrage** | Clic sur « Recommencer le quiz » après affichage d'un résultat | Décochage de toutes les options, masquage du résultat et des alertes, remise à zéro de la barre de progression, repositionnement fluide en haut de page | Formulaire entièrement réinitialisé, zone de résultat cachée (`hidden`), barre à 0/5, écran remonté avec focus sur Q1 | **CONFORME** |
| **5. Conseil d'entretien absent** | Quiz menant à la victoire de l'Orchidée | Conseil d'entretien absent (`null`) : masquage propre du bloc de conseil sans laisser de titre orphelin ni d'espace vide | Bloc `#bloc-conseil` masqué via la classe `hidden`, aucun texte vide affiché, portrait fluide | **CONFORME** |
| **6. Navigation au clavier** | Parcours complet avec Tabulation, touches fléchées (↑/↓/←/→), Espace et Entrée | Sélection fluide des boutons radio, activation des boutons au clavier, halo de focus bien visible | Anneaux de focus visibles (`focus-visible:ring-2 focus-visible:ring-roussel-vert`), parcours séquentiel naturel | **CONFORME** |
| **7. Rendu mobile (dès 375 px)** | Affichage sur viewport étroit (375 × 667 px) | Aucune coupure de texte, grille s'adaptant sur une seule colonne, aucun défilement horizontal parasite | Dispositions flexibles (`flex-col sm:flex-row`, `grid sm:grid-cols-2`), espacements proportionnés | **CONFORME** |

---

## 2. Fonctionnalités bonus validées

- **Affichage progressif et barre de complétion** :
  - Barre de progression animée indiquant en direct l'avancement (de 0 à 5 questions répondues, 0% à 100%).
  - Bouton interactif permettant de basculer à tout moment entre l'affichage global (5 questions visibles) et l'affichage « Une question à la fois » avec boutons Précédent / Suivant.
- **Détail des affinités (scores)** :
  - Sous le résultat, un bloc liste le nombre précis de votes obtenus par chacune des quatre fleurs (`Tournesol`, `Lavande`, `Pivoine`, `Orchidée`).
- **Lien commercial contextuel** :
  - Bouton interactif invitant le visiteur à « Voir nos bouquets de [Fleur] » renvoyant vers `bouquets.html`.

---

## 3. Contrôles impossibles à réaliser dans l'environnement CLI

Certains aspects sensoriels et matériels ne peuvent pas être évalués de façon absolue par des scripts en environnement d'exécution dépourvu d'affichage graphique physique :

1. **Rendu optique et lissage des polices sur dalle physique** :
   - Le contraste réel et le confort de lecture sous différentes illuminations ambiantes et calibrations d'écran (Retina, OLED, dalle mate).
2. **Restitution phonétique par les moteurs de synthèse vocale (lecteurs d'écran réels)** :
   - Bien que les attributs `aria-live="assertive"`, `aria-live="polite"`, `role="alert"` et `role="status"` soient sémantiquement irréprochables, l'intonation réelle et l'interruption des flux audio par NVDA, JAWS ou Apple VoiceOver nécessitent un test auditif humain.
3. **Expérience tactile et gestuelle mobile réelle** :
   - Le confort d'appui au pouce sur des écrans étroits réels (375 px), la sensibilité au tap et la gestion des barres d'outils dynamiques des navigateurs mobiles (ex. barre d'adresse rétractable de Safari iOS ou Chrome Android).

---

## 4. Contrôles recommandés pour un second assistant ou testeur humain

Pour compléter la recette avant la mise en production finale, il est recommandé de confier au second assistant ou au testeur les opérations suivantes :

1. **Test en conditions réelles avec serveur HTTP** :
   ```bash
   npm run serve
   ```
   - Ouvrir `http://localhost:8080` dans Chrome, Firefox et Safari.
   - Ouvrir les Outils de développement (F12) et vérifier que l'onglet Console reste vierge de toute erreur ou avertissement lors de l'intégralité du parcours.
2. **Audit d'accessibilité automatisé dans le navigateur** :
   - Exécuter l'outil **Lighthouse** (catégorie Accessibilité) ou l'extension **axe DevTools** sur la page du quiz.
3. **Test d'émulation responsive** :
   - Tester les points de rupture suivants dans le mode Responsive des DevTools :
     - 375 px (iPhone SE)
     - 390 px (iPhone 14/15)
     - 412 px (Samsung Galaxy / Google Pixel)
     - 768 px (Tablette / iPad)
     - 1024 px et au-delà (Bureau)
4. **Vérification vocale** :
   - Activer VoiceOver (macOS/iOS) ou le Narrateur Windows et vérifier l'annonce fluide du message d'erreur lorsqu'une question est omise.
