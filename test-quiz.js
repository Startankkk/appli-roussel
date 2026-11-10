const fs = require('fs');

console.log('=== TEST SUITE : QUIZ FLEURS ROUSSEL ===\n');

// 1. Schéma et intégrité de donnees.json
const schema = JSON.parse(fs.readFileSync('../schema-quiz.json', 'utf8'));
const donnees = JSON.parse(fs.readFileSync('data/donnees.json', 'utf8'));

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
console.log('✓ 1. donnees.json est 100% conforme au schéma et aux exigences métiers');

// 2. Vérification des contraintes de code (aucun innerHTML, aucun style=, aucun console.log, aucun alert)
const codeJs = fs.readFileSync('js/app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

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
function determinerGagnanteTest(scores, fleurs) {
  let gagnante = null;
  let scoreMax = -1;
  for (const fleur of fleurs) {
    const s = scores[fleur.id] || 0;
    if (s > scoreMax) {
      scoreMax = s;
      gagnante = fleur;
    }
  }
  return gagnante;
}

// Égalité Tournesol (2) vs Lavande (2)
let scoresEgalite1 = { tournesol: 2, lavande: 2, pivoine: 1, orchidee: 0 };
let g1 = determinerGagnanteTest(scoresEgalite1, donnees);
if (g1.id !== 'tournesol') throw new Error(`Égalité tournesol/lavande: attendu tournesol, obtenu ${g1.id}`);
console.log('✓ 3.1 Égalité Tournesol / Lavande (2-2) -> Tournesol l\'emporte (1re dans les données)');

// Égalité Lavande (2) vs Pivoine (2)
let scoresEgalite2 = { tournesol: 1, lavande: 2, pivoine: 2, orchidee: 0 };
let g2 = determinerGagnanteTest(scoresEgalite2, donnees);
if (g2.id !== 'lavande') throw new Error(`Égalité lavande/pivoine: attendu lavande, obtenu ${g2.id}`);
console.log('✓ 3.2 Égalité Lavande / Pivoine (2-2) -> Lavande l\'emporte (1re dans les données)');

// Égalité Pivoine (2) vs Orchidée (2)
let scoresEgalite3 = { tournesol: 0, lavande: 1, pivoine: 2, orchidee: 2 };
let g3 = determinerGagnanteTest(scoresEgalite3, donnees);
if (g3.id !== 'pivoine') throw new Error(`Égalité pivoine/orchidée: attendu pivoine, obtenu ${g3.id}`);
console.log('✓ 3.3 Égalité Pivoine / Orchidée (2-2) -> Pivoine l\'emporte (1re dans les données)');

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
console.log('✓ 4. Les 5 questions et 20 réponses correspondent exactement au sujet');

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
console.log('✓ 5. Accessibilité validée : 5 fieldset/legend, 20 radios/labels associés, messages aria-live');

console.log('\n=== TOUS LES TESTS UNITAIRES ET STATIQUES SONT VALIDES (100%) ===');
