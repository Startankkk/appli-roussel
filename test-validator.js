const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// SCHEMA_QUIZ permet de déplacer le schéma sans modifier le test.
const cheminSchema = process.env.SCHEMA_QUIZ || path.resolve(__dirname, '../../quiz-6af193c965509637944510/schema-quiz.json');
const schema = JSON.parse(fs.readFileSync(cheminSchema, 'utf8'));
const donnees = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/donnees.json'), 'utf8'));
const proprietes = schema.items.properties;

// Contrôle des contraintes utilisées par le schéma fourni ; pas un validateur JSON Schema générique.
assert.equal(schema.type, 'array');
assert.ok(Array.isArray(donnees) && donnees.length >= schema.minItems);
for (const fleur of donnees) {
  assert.deepEqual(Object.keys(fleur).sort(), [...schema.items.required].sort());
  for (const champ of ['id', 'nom', 'titre', 'description']) {
    assert.equal(typeof fleur[champ], 'string');
    const regle = proprietes[champ];
    if (regle.minLength !== undefined) assert.ok([...fleur[champ]].length >= regle.minLength);
    if (regle.maxLength !== undefined) assert.ok([...fleur[champ]].length <= regle.maxLength);
    if (regle.pattern) assert.match(fleur[champ], new RegExp(regle.pattern));
  }
  assert.ok(fleur.conseil === null || typeof fleur.conseil === 'string');
  assert.ok(Array.isArray(fleur.a_verifier));
  assert.equal(new Set(fleur.a_verifier).size, fleur.a_verifier.length);
  assert.ok(fleur.a_verifier.every(cle => proprietes.a_verifier.items.enum.includes(cle)));
  assert.ok(fleur.titre.trim().split(/\s+/).length <= 6);
  assert.equal(fleur.description.match(/[.!?]+(?=\s|$)/g)?.length, 2);
}
assert.equal(new Set(donnees.map(fleur => fleur.id)).size, donnees.length);
const orchidee = donnees.find(fleur => fleur.id === 'orchidee');
assert.ok(orchidee && orchidee.conseil === null && !orchidee.a_verifier.includes('conseil'));
console.log('Données réelles : contrôles de structure et règles sélectionnées réussis.');
