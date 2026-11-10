# Résultats des vérifications — Quiz Fleurs Roussel

## Contrôles effectués

| Contrôle | Résultat observé | Limite |
| --- | --- | --- |
| Lecture du texte source et du schéma | Quatre fleurs dans le texte ; commentaire HTML publicitaire ; six champs de portrait prévus par le schéma. | Lecture documentaire. |
| Relecture des portraits | Les quatre descriptions ont été corrigées pour suivre la source ; l'orchidée conserve `conseil: null` sans alerte de conseil. | Appréciation éditoriale manuelle, pas une preuve automatisée de fidélité. |
| Application manuelle de la V3 aux six textes reproduits | Les constats figurent dans `prompts/contenu.md`, y compris les blocages proposés pour les textes courts. La formule « grâce et fierté » a été écartée du cas rose. | Pas d'exécution indépendante du prompt ni de validation automatisée des six sorties complètes ; comparaison au PDF à faire. |
| `node test-validator.js` | Code de sortie 0 sur les données réelles : champs, types et contraintes sélectionnés, unicité, descriptions de deux phrases et conseil de l'orchidée. | Contrôles ciblés, non validation générique de tout JSON Schema ni vérification sémantique. |
| `node test-quiz.js` | Code de sortie 0 : contrôles statiques, fonctions réelles de scores et de départage, quatre gagnantes, calculs successifs et trois égalités. Le rendu réel appelé avec un DOM simulé masque le conseil de l'orchidée et prépare son image. | DOM simulé ; pas de navigateur ni de vérification du chargement effectif de l'image. |
| Illustrations dans le navigateur | Les quatre illustrations s'affichent, y compris celle de l'orchidée sans conseil. | Vérification manuelle rapportée par l'utilisateur sur Chrome. |
| Navigation au clavier | La navigation fonctionne et le focus est visible. | Vérification manuelle rapportée par l'utilisateur sur Chrome. |
| Affichage à 375 px | L'affichage est lisible et ne présente pas de défilement horizontal. | Vérification manuelle rapportée par l'utilisateur sur Chrome. |

## Tests restant à réaliser

| Scénario | Résultat attendu |
| --- | --- |
| Aucune réponse puis une question manquante | Question concernée indiquée, résultat masqué et focus orienté vers elle. |
| Les quatre fleurs gagnantes | Chaque profil produit la bonne fleur et les bons scores dans l'interface. |
| Égalité 2–2–1 | La première fleur à égalité selon l'ordre du JSON gagne. |
| Calculs successifs | Les nouveaux scores ne conservent pas ceux du calcul précédent. |
| Recommencer | Réponses décochées, messages et résultat masqués, progression remise à zéro et retour au départ. |
| Échec de chargement | Message accessible sans résultat trompeur. |

Comparer les questions et les six textes reproduits au sujet PDF, puis exécuter indépendamment la V3 et vérifier les sorties complètes avant de présenter le prompt comme validé.
