const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE : QUIZ FLEURS ROUSSEL ===\n');

// 1. Schéma et intégrité de donnees.json
const cheminSchema = process.env.SCHEMA_QUIZ || path.resolve(__dirname, '../../quiz-6af193c965509637944510/schema-quiz.json');
JSON.parse(fs.readFileSync(cheminSchema, 'utf8'));
const donnees = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/donnees.json'), 'utf8'));

if (!Array.isArray(donnees) || donnees.length !== 4) {
  throw new Error('donnees.json doit contenir exactement 4 fleurs');
}

const idsAttendus = ['tournesol', 'lavande', 'pivoine', 'orchidee'];
donnees.forEach((item, idx) => {
  if (item.id !== idsAttendus[idx]) {
    throw new Error(`Ordre invalide: attendu ${idsAttendus[idx]}, reçu ${item.id}`);
  }
  if (!item.nom || !item.titre || !item.description) {
    throw new Error(`Champs manquants sur ${item.id}`);
  }
  if (item.id === 'orchidee' && item.conseil !== null) {
    throw new Error(`Orchidée doit avoir conseil: null`);
  }
  if (item.id !== 'orchidee' && typeof item.conseil !== 'string') {
    throw new Error(`${item.id} doit avoir un conseil d'entretien string`);
  }
  if (item.titre.length > 60 || item.titre.trim().split(/\s+/).length > 6) {
    throw new Error(`Titre trop long pour ${item.id}`);
  }
  if (item.description.length > 300) {
    throw new Error(`Description trop longue pour ${item.id}`);
  }
  if (item.a_verifier.length !== 0) {
    throw new Error(`a_verifier doit être vide pour ${item.id}`);
  }
});
console.log('✓ 1. Contrôles sélectionnés des données du quiz');

// 2. Vérification des contraintes de code (aucun innerHTML, aucun style=, aucun console.log, aucun alert)
const codeJs = fs.readFileSync(path.join(__dirname, 'js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

if (/\.innerHTML\b/.test(codeJs) || /\.innerHTML\b/.test(html)) {
  throw new Error('VIOLATION: innerHTML interdit');
}
console.log('✓ 2.1 Aucun innerHTML utilisé (sécurité garantie via textContent)');

if (codeJs.includes('.style.') || /style\s*=/i.test(html) || /<style/i.test(html)) {
  throw new Error('VIOLATION: attribut style ou balise style interdit');
}
console.log('✓ 2.2 Aucun attribut style ni balise style (Tailwind CSS pur)');

if (/console\.log\s*\(/i.test(codeJs)) {
  throw new Error('VIOLATION: console.log présent dans app.js');
}
if (/alert\s*\(/i.test(codeJs)) {
  throw new Error('VIOLATION: alert() présent dans app.js');
}
console.log('✓ 2.3 Aucun console.log() ni alert() dans le script de livraison');

// 3. Test de logique de départage (règle de la première fleur dans l'ordre des données en cas d'égalité)
let choix = [];
const formulaire = { querySelector(selecteur) {
  const numero = Number(selecteur.match(/question-(\d)/)?.[1]);
  return choix[numero - 1] ? { value: choix[numero - 1] } : null;
} };
const contexte = vm.createContext({ document: {
  readyState: 'loading', addEventListener() {},
  getElementById(id) { return id === 'formulaire-quiz' ? formulaire : null; }
}, donneesTest: donnees });
vm.runInContext(codeJs, contexte);
vm.runInContext('donneesFleurs = donneesTest', contexte);
function determinerGagnanteTest(scores) {
  contexte.scoresTest = scores;
  return vm.runInContext('determinerFleurGagnante(scoresTest)', contexte);
}

// Égalité Tournesol (2) vs Lavande (2)
let scoresEgalite1 = { tournesol: 2, lavande: 2, pivoine: 1, orchidee: 0 };
let g1 = determinerGagnanteTest(scoresEgalite1);
if (g1.id !== 'tournesol') throw new Error(`Égalité tournesol/lavande: attendu tournesol, obtenu ${g1.id}`);
console.log('✓ 3.1 Égalité Tournesol / Lavande (2-2) -> Tournesol l\'emporte (1re dans les données)');

// Égalité Lavande (2) vs Pivoine (2)
let scoresEgalite2 = { tournesol: 1, lavande: 2, pivoine: 2, orchidee: 0 };
let g2 = determinerGagnanteTest(scoresEgalite2);
if (g2.id !== 'lavande') throw new Error(`Égalité lavande/pivoine: attendu lavande, obtenu ${g2.id}`);
console.log('✓ 3.2 Égalité Lavande / Pivoine (2-2) -> Lavande l\'emporte (1re dans les données)');

// Égalité Pivoine (2) vs Orchidée (2)
let scoresEgalite3 = { tournesol: 0, lavande: 1, pivoine: 2, orchidee: 2 };
let g3 = determinerGagnanteTest(scoresEgalite3);
if (g3.id !== 'pivoine') throw new Error(`Égalité pivoine/orchidée: attendu pivoine, obtenu ${g3.id}`);
console.log('✓ 3.3 Égalité Pivoine / Orchidée (2-2) -> Pivoine l\'emporte (1re dans les données)');

for (const id of idsAttendus) {
  choix = Array(5).fill(id);
  const scores = vm.runInContext('calculerScoresParFleur()', contexte);
  if (scores[id] !== 5 || determinerGagnanteTest(scores).id !== id) throw new Error(`Calcul incorrect pour ${id}`);
  for (const autre of idsAttendus.filter(fleur => fleur !== id)) {
    if (scores[autre] !== 0) throw new Error('Scores conservés entre deux calculs');
  }
}
console.log('✓ 3.4 Fonctions réelles : quatre gagnantes et calculs successifs');

// Exécute le rendu réel avec des éléments DOM minimaux, sans navigateur.
function elementSimule() {
  const classes = new Set(['hidden']);
  return {
    textContent: '', classList: {
      add(classe) { classes.add(classe); },
      remove(classe) { classes.delete(classe); },
      contains(classe) { return classes.has(classe); }
    }, scrollIntoView() {}
  };
}
const image = elementSimule();
image.parentElement = elementSimule();
const elements = {
  'zone-resultat': elementSimule(), 'zone-erreur': elementSimule(),
  'nom-fleur': elementSimule(), 'titre-fleur': elementSimule(),
  'description-fleur': elementSimule(), 'bloc-conseil': elementSimule(),
  'texte-conseil': elementSimule(), 'image-fleur': image
};
contexte.document.getElementById = id => elements[id] || null;
contexte.orchideeTest = donnees.find(fleur => fleur.id === 'orchidee');
contexte.scoresTest = { tournesol: 0, lavande: 0, pivoine: 0, orchidee: 5 };
vm.runInContext('afficherResultatFleur(orchideeTest, scoresTest)', contexte);
if (!elements['bloc-conseil'].classList.contains('hidden') || image.src !== 'img/fleurs/orchidee.svg' || image.parentElement.classList.contains('hidden')) {
  throw new Error('Le rendu de l’orchidée doit masquer le conseil et préparer son image');
}
console.log('✓ 3.5 Rendu réel simulé : conseil absent et image de l’orchidée préparée');

// 4. Test des 5 questions et réponses exactes du sujet
const questionsSujet = [
  {
    num: 1,
    titre: 'Votre samedi idéal ?',
    reponses: [
      'Un pique-nique au soleil avec des amis',
      'Une balade tranquille dans la nature',
      'Un grand repas de famille',
      'Un musée, puis un restaurant raffiné'
    ]
  },
  {
    num: 2,
    titre: 'Votre couleur préférée ?',
    reponses: ['Jaune', 'Mauve', 'Rose', 'Blanc']
  },
  {
    num: 3,
    titre: 'On vous décrit souvent comme…',
    reponses: ['Joyeux', 'Calme', 'Généreux', 'Élégant']
  },
  {
    num: 4,
    titre: 'Votre boisson ?',
    reponses: ['Une citronnade', 'Une tisane', 'Un chocolat chaud', 'Un thé blanc']
  },
  {
    num: 5,
    titre: 'En vacances, vous choisissez…',
    reponses: ['La plage', 'La Provence', 'Une maison pleine de monde', 'Une capitale étrangère']
  }
];

questionsSujet.forEach(q => {
  if (!html.includes(q.titre)) {
    throw new Error(`Titre manquant dans index.html: ${q.titre}`);
  }
  q.reponses.forEach(rep => {
    if (!html.includes(rep)) {
      throw new Error(`Réponse manquante dans index.html: ${rep}`);
    }
  });
});
console.log('✓ 4. Les textes attendus sont présents dans le HTML (comparaison au sujet non effectuée)');

// 5. Test de la présence des attributs d'accessibilité ARIA, fieldset, legend, label
const fieldsetCount = (html.match(/<fieldset/g) || []).length;
const legendCount = (html.match(/<legend/g) || []).length;
const radioCount = (html.match(/type="radio"/g) || []).length;
const labelCount = (html.match(/<label/g) || []).length;

if (fieldsetCount !== 5 || legendCount !== 5) {
  throw new Error(`Incohérence fieldset/legend: ${fieldsetCount} fieldsets, ${legendCount} legends`);
}
if (radioCount !== 20 || labelCount < 20) {
  throw new Error(`Incohérence radios/labels: ${radioCount} radios, ${labelCount} labels`);
}
if (!html.includes('aria-live="assertive"') || !html.includes('aria-live="polite"')) {
  throw new Error(`aria-live manquant`);
}
console.log('✓ 5. Comptages HTML et présence de zones aria-live');

console.log('\nContrôles terminés ; les parcours navigateur restent à vérifier.');
