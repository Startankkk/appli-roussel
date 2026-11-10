/**
 * Application « Quelle fleur êtes-vous ? » — Fleurs Roussel
 * 
 * Script principal respectant les conventions d'intégration de l'agence :
 * - JavaScript pur (Vanilla JS), sans bibliothèque externe
 * - Déclarations strictes avec const et let
 * - Fonctions nommées en français et commentées
 * - Injection sécurisée via textContent exclusivement
 * - Aucun attribut style ni balise style manipulé
 * - Aucune boîte de dialogue intrusive ni message de débogage en console
 */

// Liste immuable des questions du quiz
const QUESTIONS = [
  { numero: 1, idGroupe: 'question-1', nomChamp: 'question-1', titre: 'Votre samedi idéal ?' },
  { numero: 2, idGroupe: 'question-2', nomChamp: 'question-2', titre: 'Votre couleur préférée ?' },
  { numero: 3, idGroupe: 'question-3', nomChamp: 'question-3', titre: 'On vous décrit souvent comme…' },
  { numero: 4, idGroupe: 'question-4', nomChamp: 'question-4', titre: 'Votre boisson ?' },
  { numero: 5, idGroupe: 'question-5', nomChamp: 'question-5', titre: 'En vacances, vous choisissez…' }
];

// Classes utilitaires Tailwind pour la largeur de la barre de progression sans attribut style
const CLASSES_LARGEUR_PROGRESSION = ['w-0', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-full'];

// Variables globales d'état
let donneesFleurs = [];
let modeUneQuestionALaFois = false;
let indexQuestionCourante = 0;

/**
 * Charge les portraits de fleurs depuis data/donnees.json.
 * @returns {Promise<Array>} Liste ordonnée des portraits de fleurs
 */
async function chargerDonneesFleurs() {
  try {
    const reponse = await fetch('data/donnees.json');
    if (!reponse.ok) {
      throw new Error('Erreur réseau lors du chargement des données');
    }
    const donnees = await reponse.json();
    return donnees;
  } catch (erreur) {
    afficherErreurChargement('Impossible de charger les portraits du quiz. Veuillez réessayer ultérieurement.');
    return [];
  }
}

/**
 * Affiche une alerte accessible en cas d'échec du chargement des données.
 * @param {string} message Le texte du message à afficher
 */
function afficherErreurChargement(message) {
  const conteneurAlerte = document.getElementById('alerte-chargement');
  if (conteneurAlerte) {
    conteneurAlerte.textContent = message;
    conteneurAlerte.classList.remove('hidden');
  }
}

/**
 * Met à jour visuellement et sémantiquement la barre de progression.
 */
function actualiserProgression() {
  const formulaire = document.getElementById('formulaire-quiz');
  const texteProgression = document.getElementById('texte-progression');
  const barreProgression = document.getElementById('barre-progression');
  if (!formulaire || !texteProgression || !barreProgression) return;

  let totalReponses = 0;
  for (const question of QUESTIONS) {
    const cochee = formulaire.querySelector(`input[name="${question.nomChamp}"]:checked`);
    if (cochee) {
      totalReponses += 1;
    }
  }

  // Mise à jour du texte accessible
  texteProgression.textContent = `${totalReponses} sur ${QUESTIONS.length} questions répondues`;

  // Mise à jour ARIA
  barreProgression.setAttribute('aria-valuenow', String(totalReponses));

  // Remplacement des classes Tailwind pour la largeur (sans attribut style)
  for (const classe of CLASSES_LARGEUR_PROGRESSION) {
    barreProgression.classList.remove(classe);
  }
  const classeCible = CLASSES_LARGEUR_PROGRESSION[totalReponses] || 'w-0';
  barreProgression.classList.add(classeCible);
}

/**
 * Recherche la première question sans réponse sélectionnée.
 * @returns {Object|null} L'objet question manquant ou null si toutes sont remplies
 */
function trouverPremiereQuestionManquante() {
  const formulaire = document.getElementById('formulaire-quiz');
  for (const question of QUESTIONS) {
    const optionCochee = formulaire.querySelector(`input[name="${question.nomChamp}"]:checked`);
    if (!optionCochee) {
      return question;
    }
  }
  return null;
}

/**
 * Calcule le score pour chaque fleur sélectionnée.
 * @returns {Object} Dictionnaire associant l'identifiant de fleur à son nombre de points
 */
function calculerScoresParFleur() {
  const formulaire = document.getElementById('formulaire-quiz');
  const scores = {};

  // Initialisation à zéro pour toutes les fleurs du référentiel
  for (const fleur of donneesFleurs) {
    scores[fleur.id] = 0;
  }

  for (const question of QUESTIONS) {
    const optionCochee = formulaire.querySelector(`input[name="${question.nomChamp}"]:checked`);
    if (optionCochee && optionCochee.value) {
      const idFleur = optionCochee.value;
      scores[idFleur] = (scores[idFleur] || 0) + 1;
    }
  }

  return scores;
}

/**
 * Détermine la fleur gagnante selon les scores et la règle de départage.
 * En cas d'égalité, la première fleur ex æquo dans l'ordre des données JSON l'emporte.
 * @param {Object} scores Dictionnaire des scores
 * @returns {Object|null} La fleur gagnante issue de donneesFleurs
 */
function determinerFleurGagnante(scores) {
  if (!donneesFleurs || donneesFleurs.length === 0) return null;

  let fleurGagnante = null;
  let scoreMaximal = -1;

  for (const fleur of donneesFleurs) {
    const scoreActuel = scores[fleur.id] || 0;
    // L'opérateur strict > garantit que la première fleur dans l'ordre de données est conservée en cas d'égalité
    if (scoreActuel > scoreMaximal) {
      scoreMaximal = scoreActuel;
      fleurGagnante = fleur;
    }
  }

  return fleurGagnante;
}

/**
 * Affiche la fleur gagnante et les informations associées dans le DOM.
 * @param {Object} fleur La fleur victorieuse
 * @param {Object} scores Le récapitulatif des scores
 */
function afficherResultatFleur(fleur, scores) {
  const zoneResultat = document.getElementById('zone-resultat');
  const zoneErreur = document.getElementById('zone-erreur');
  const elementNom = document.getElementById('nom-fleur');
  const elementTitre = document.getElementById('titre-fleur');
  const elementDescription = document.getElementById('description-fleur');
  const blocConseil = document.getElementById('bloc-conseil');
  const texteConseil = document.getElementById('texte-conseil');
  const imageFleur = document.getElementById('image-fleur');
  const listeScores = document.getElementById('liste-scores');
  const elementNomBouquet = document.getElementById('nom-bouquet-lien');
  const conteneurImage = imageFleur ? imageFleur.parentElement : null;

  // Masquer les éventuelles erreurs
  if (zoneErreur) {
    zoneErreur.classList.add('hidden');
    zoneErreur.textContent = '';
  }

  // Remplissage sécurisé des textes via textContent
  if (elementNom) elementNom.textContent = fleur.nom;
  if (elementTitre) elementTitre.textContent = fleur.titre;
  if (elementDescription) elementDescription.textContent = fleur.description;

  // Gestion du conseil d'entretien (affiché uniquement s'il existe et n'est pas null)
  if (fleur.conseil && typeof fleur.conseil === 'string') {
    if (texteConseil) texteConseil.textContent = fleur.conseil;
    if (blocConseil) blocConseil.classList.remove('hidden');
  } else {
    if (texteConseil) texteConseil.textContent = '';
    if (blocConseil) blocConseil.classList.add('hidden');
  }

  // Gestion robuste de l'illustration SVG
  if (imageFleur && conteneurImage) {
    conteneurImage.classList.remove('hidden');
    imageFleur.onerror = function () {
      // Si le SVG n'existe pas, masquer proprement le cadre pour éviter une icône brisée
      conteneurImage.classList.add('hidden');
    };
    imageFleur.onload = function () {
      conteneurImage.classList.remove('hidden');
    };
    imageFleur.src = `img/fleurs/${fleur.id}.svg`;
    imageFleur.alt = `Illustration d'un(e) ${fleur.nom}`;
  }

  // Bonus : Affichage du récapitulatif des scores par fleur
  if (listeScores) {
    while (listeScores.firstChild) {
      listeScores.removeChild(listeScores.firstChild);
    }
    for (const f of donneesFleurs) {
      const item = document.createElement('li');
      item.className = 'rounded-md bg-white p-2 border border-gray-100 flex justify-between items-center';

      const nomSpan = document.createElement('span');
      nomSpan.textContent = f.nom;

      const scoreSpan = document.createElement('span');
      const point = scores[f.id] || 0;
      scoreSpan.className = 'font-bold text-roussel-vert';
      scoreSpan.textContent = `${point} vote${point > 1 ? 's' : ''}`;

      item.appendChild(nomSpan);
      item.appendChild(scoreSpan);
      listeScores.appendChild(item);
    }
  }

  // Bonus : Mise à jour du lien vers bouquets.html
  if (elementNomBouquet) {
    elementNomBouquet.textContent = fleur.nom;
  }

  // Révélation de la zone de résultat
  if (zoneResultat) {
    zoneResultat.classList.remove('hidden');
    zoneResultat.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Gère la soumission du formulaire de quiz.
 * @param {Event} evenement Événement submit
 */
function traiterSoumissionQuiz(evenement) {
  evenement.preventDefault();

  const questionManquante = trouverPremiereQuestionManquante();
  const zoneErreur = document.getElementById('zone-erreur');
  const zoneResultat = document.getElementById('zone-resultat');

  if (questionManquante) {
    // Si une réponse manque : masquer le résultat et indiquer précisément laquelle
    if (zoneResultat) {
      zoneResultat.classList.add('hidden');
    }

    const messageErreur = `Veuillez répondre à la question ${questionManquante.numero} (« ${questionManquante.titre} ») pour découvrir votre résultat.`;
    if (zoneErreur) {
      zoneErreur.textContent = messageErreur;
      zoneErreur.classList.remove('hidden');
    }

    // Si on est en mode "une question à la fois", positionner l'écran sur la question manquante
    if (modeUneQuestionALaFois) {
      afficherQuestionParIndex(questionManquante.numero - 1);
    }

    // Déplacement du focus vers la question concernée pour l'accessibilité
    const fieldset = document.getElementById(questionManquante.idGroupe);
    if (fieldset) {
      fieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const premierRadio = fieldset.querySelector('input[type="radio"]');
      if (premierRadio) {
        premierRadio.focus();
      }
    }
    return;
  }

  // Toutes les réponses sont présentes : calcul des scores et affichage du résultat
  const scores = calculerScoresParFleur();
  const gagnante = determinerFleurGagnante(scores);

  if (gagnante) {
    afficherResultatFleur(gagnante, scores);
  }
}

/**
 * Réinitialise l'intégralité du quiz, efface les réponses et masque les résultats.
 */
function recommencerQuiz() {
  const formulaire = document.getElementById('formulaire-quiz');
  const zoneResultat = document.getElementById('zone-resultat');
  const zoneErreur = document.getElementById('zone-erreur');

  if (formulaire) {
    formulaire.reset();
  }

  if (zoneResultat) {
    zoneResultat.classList.add('hidden');
  }

  if (zoneErreur) {
    zoneErreur.classList.add('hidden');
    zoneErreur.textContent = '';
  }

  // Remise à zéro de la barre de progression
  actualiserProgression();

  // Remise au début en mode pas-à-pas
  if (modeUneQuestionALaFois) {
    afficherQuestionParIndex(0);
  }

  // Retour fluide en haut du quiz
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Focus sur la première question pour l'accessibilité
  const premierRadio = document.querySelector('input[name="question-1"]');
  if (premierRadio) {
    premierRadio.focus();
  }
}

/**
 * Affiche une question spécifique et masque les autres (mode pas-à-pas).
 * @param {number} index Index de la question (0 à 4)
 */
function afficherQuestionParIndex(index) {
  indexQuestionCourante = Math.max(0, Math.min(index, QUESTIONS.length - 1));

  QUESTIONS.forEach((q, idx) => {
    const fieldset = document.getElementById(q.idGroupe);
    if (fieldset) {
      if (modeUneQuestionALaFois) {
        if (idx === indexQuestionCourante) {
          fieldset.classList.remove('hidden');
        } else {
          fieldset.classList.add('hidden');
        }
      } else {
        fieldset.classList.remove('hidden');
      }
    }
  });

  // Mise à jour de l'état des boutons de navigation
  const boutonPrecedent = document.getElementById('bouton-question-precedente');
  const boutonSuivant = document.getElementById('bouton-question-suivante');

  if (boutonPrecedent) {
    boutonPrecedent.disabled = (indexQuestionCourante === 0);
  }
  if (boutonSuivant) {
    boutonSuivant.disabled = (indexQuestionCourante === QUESTIONS.length - 1);
  }
}

/**
 * Bascule entre l'affichage complet du quiz et l'affichage une question à la fois.
 */
function basculerModeAffichage() {
  modeUneQuestionALaFois = !modeUneQuestionALaFois;

  const barreNavigation = document.getElementById('barre-navigation-etapes');
  const boutonBascule = document.getElementById('bouton-bascule-mode');

  if (modeUneQuestionALaFois) {
    if (barreNavigation) barreNavigation.classList.remove('hidden');
    if (boutonBascule) boutonBascule.textContent = 'Mode : Afficher toutes les questions';
    afficherQuestionParIndex(0);
  } else {
    if (barreNavigation) barreNavigation.classList.add('hidden');
    if (boutonBascule) boutonBascule.textContent = 'Mode : Afficher une question à la fois';
    afficherQuestionParIndex(0);
  }
}

/**
 * Initialisation au chargement du DOM.
 */
async function initialiserApplication() {
  // Chargement des portraits
  donneesFleurs = await chargerDonneesFleurs();

  // Écouteurs sur le formulaire
  const formulaire = document.getElementById('formulaire-quiz');
  if (formulaire) {
    formulaire.addEventListener('submit', traiterSoumissionQuiz);
    formulaire.addEventListener('change', actualiserProgression);
  }

  // Écouteur sur le bouton recommencer
  const boutonRecommencer = document.getElementById('bouton-recommencer');
  if (boutonRecommencer) {
    boutonRecommencer.addEventListener('click', recommencerQuiz);
  }

  // Écouteurs pour le bonus d'affichage pas-à-pas
  const boutonBasculeMode = document.getElementById('bouton-bascule-mode');
  if (boutonBasculeMode) {
    boutonBasculeMode.addEventListener('click', basculerModeAffichage);
  }

  const boutonPrecedent = document.getElementById('bouton-question-precedente');
  if (boutonPrecedent) {
    boutonPrecedent.addEventListener('click', function () {
      afficherQuestionParIndex(indexQuestionCourante - 1);
    });
  }

  const boutonSuivant = document.getElementById('bouton-question-suivante');
  if (boutonSuivant) {
    boutonSuivant.addEventListener('click', function () {
      afficherQuestionParIndex(indexQuestionCourante + 1);
    });
  }

  // Calcul initial de progression
  actualiserProgression();
}

// Lancement au chargement du document
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiserApplication);
} else {
  initialiserApplication();
}
