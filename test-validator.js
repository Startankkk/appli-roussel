const fs = require('fs');

const schema = JSON.parse(fs.readFileSync('../schema-quiz.json', 'utf8'));

const cases = {
  cas1: [
    {
      "id": "coquelicot",
      "nom": "Coquelicot",
      "titre": "Fleur de la spontanéité",
      "description": "Vous suivez vos envies et vous vous épanouissez là où on ne vous attend pas. Vous incarnez la spontanéité.",
      "conseil": "Très fragile, mettez-le en vase dès la cueillette.",
      "a_verifier": []
    }
  ],
  cas2: [
    {
      "id": "marguerite",
      "nom": "Marguerite",
      "titre": "Innocence et simplicité",
      "description": "Vous êtes une personne honnête et joyeuse. Vous appréciez l'innocence et la simplicité au quotidien.",
      "conseil": "Changez l'eau tous les deux jours.",
      "a_verifier": []
    }
  ],
  cas3: [
    {
      "id": "muguet",
      "nom": "Muguet",
      "titre": "Porte-bonheur du 1er mai",
      "description": "Vous incarnez le porte-bonheur printanier.",
      "conseil": null,
      "a_verifier": ["description"]
    }
  ],
  cas4: [
    {
      "id": "rose",
      "nom": "Rose",
      "titre": "La reine des fleurs",
      "description": "Vous symbolisez l'amour et la passion. Vous rayonnez avec grâce et fierté.",
      "conseil": "Recoupez les tiges tous les deux jours.",
      "a_verifier": []
    }
  ],
  cas5: [
    {
      "id": "iris",
      "nom": "Iris",
      "titre": "Créatif et plein d'idées",
      "description": "Vous qui aimez l'iris, vous êtes créatif et vous avez plein d'idées. Vous exprimez une grande originalité.",
      "conseil": "Mettez peu d'eau dans le vase.",
      "a_verifier": []
    }
  ],
  cas6: [
    {
      "id": "jasmin",
      "nom": "Jasmin",
      "titre": "Douceur et sensualité",
      "description": "Vous symbolisez la douceur et la sensualité.",
      "conseil": null,
      "a_verifier": ["description"]
    },
    {
      "id": "cactus-fleuri",
      "nom": "Cactus fleuri",
      "titre": "Résistance et patience",
      "description": "Vous faites preuve de résistance et de patience. Vous ne demandez presque rien pour vous épanouir.",
      "conseil": "Arrosez-le une fois par mois.",
      "a_verifier": []
    }
  ],
  contenuQuiz: [
    {
      "id": "tournesol",
      "nom": "Tournesol",
      "titre": "Symbole de joie et de chaleur",
      "description": "Vous êtes optimiste et entraînez votre entourage dans votre bonne humeur. Rayonnant et chaleureux, vous diffusez la joie autour de vous.",
      "conseil": "Offrez-lui beaucoup de lumière et renouvelez l'eau fraîche chaque jour dans le vase.",
      "a_verifier": []
    },
    {
      "id": "lavande",
      "nom": "Lavande",
      "titre": "Calme et douceur provençale",
      "description": "Vous aimez prendre votre temps et savourer pleinement les petits moments du quotidien. Vous diffusez le calme et la douceur des étés provençaux.",
      "conseil": "Conservez-la en bouquet sec, suspendue la tête en bas.",
      "a_verifier": []
    },
    {
      "id": "pivoine",
      "nom": "Pivoine",
      "titre": "Généreuse et pleine de vie",
      "description": "Généreux et plein de vie, vous aimez les grandes tablées et les moments de partage. Vous symbolisez la prospérité et le bonheur partagé.",
      "conseil": "Coupez les tiges en biseau et changez l'eau régulièrement.",
      "a_verifier": []
    },
    {
      "id": "orchidee",
      "nom": "Orchidée",
      "titre": "Raffinée et mystérieuse",
      "description": "Raffiné et mystérieux, vous symbolisez une élégance rare. Vous possédez un goût prononcé pour le détail et les belles choses.",
      "conseil": null,
      "a_verifier": []
    }
  ]
};

function validate(data, sch, label) {
  if (!Array.isArray(data) || data.length < 1) throw new Error(`${label}: Must be non-empty array`);
  const idRegex = /^[a-z]+(-[a-z]+)*$/;
  data.forEach((item, idx) => {
    const keys = Object.keys(item);
    const required = sch.items.required;
    for (const r of required) {
      if (!(r in item)) throw new Error(`${label} [${idx}]: Missing ${r}`);
    }
    for (const k of keys) {
      if (!required.includes(k)) throw new Error(`${label} [${idx}]: Extra key ${k}`);
    }
    if (!idRegex.test(item.id)) throw new Error(`${label} [${idx}]: Invalid id ${item.id}`);
    if (typeof item.nom !== 'string' || item.nom.length < 1) throw new Error(`${label} [${idx}]: Invalid nom`);
    if (typeof item.titre !== 'string' || item.titre.length < 1 || item.titre.length > 60) throw new Error(`${label} [${idx}]: Invalid titre length (${item.titre.length})`);
    const words = item.titre.trim().split(/\s+/).length;
    if (words > 6) throw new Error(`${label} [${idx}]: Titre exceeds 6 words (${words})`);
    if (typeof item.description !== 'string' || item.description.length < 1 || item.description.length > 300) throw new Error(`${label} [${idx}]: Invalid description length (${item.description.length})`);
    // Check sentences (max 2)
    const sentences = item.description.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 2) throw new Error(`${label} [${idx}]: Description exceeds 2 sentences (${sentences.length})`);
    if (item.conseil !== null && typeof item.conseil !== 'string') throw new Error(`${label} [${idx}]: Invalid conseil`);
    if (item.conseil !== null) {
      const conseilSentences = item.conseil.split(/(?<=[.!?])\s+/).filter(Boolean);
      if (conseilSentences.length > 1) throw new Error(`${label} [${idx}]: Conseil exceeds 1 sentence (${conseilSentences.length})`);
    }
    if (!Array.isArray(item.a_verifier)) throw new Error(`${label} [${idx}]: Invalid a_verifier`);
    const validKeys = ['nom', 'titre', 'description', 'conseil'];
    for (const av of item.a_verifier) {
      if (!validKeys.includes(av)) throw new Error(`${label} [${idx}]: Invalid item in a_verifier: ${av}`);
    }
    if (new Set(item.a_verifier).size !== item.a_verifier.length) throw new Error(`${label} [${idx}]: Duplicate in a_verifier`);
  });
  console.log(`✓ ${label}: Validated successfully (${data.length} items)`);
}

for (const [key, list] of Object.entries(cases)) {
  validate(list, schema, key);
}
console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
