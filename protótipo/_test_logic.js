/* ============================================
   Cadê? — testes de lógica pura (Node)
   Executar:  node _test_logic.js
   Cobre os helpers de nome/extensão/dedup usados
   no upload múltiplo com renomeação.
   ============================================ */

const assert = require('assert');
const { splitName, buildDisplayName, dedupeBatchNames } = require('./src/js/main.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`      ${err.message}`);
  }
}

// ---------------------------------------------
// splitName
// ---------------------------------------------
console.log('splitName');

test('separa nome-base e extensão de um arquivo comum', () => {
  assert.deepStrictEqual(splitName('boletim.pdf'), { base: 'boletim', ext: 'pdf' });
});

test('mantém espaços no nome-base', () => {
  assert.deepStrictEqual(splitName('contrato escolar.png'), { base: 'contrato escolar', ext: 'png' });
});

test('arquivo sem extensão devolve ext vazia', () => {
  assert.deepStrictEqual(splitName('arquivo'), { base: 'arquivo', ext: '' });
});

test('preserva o caso original da extensão', () => {
  assert.deepStrictEqual(splitName('Foto.JPG'), { base: 'Foto', ext: 'JPG' });
});

test('usa apenas o último ponto (nome com vários pontos)', () => {
  assert.deepStrictEqual(splitName('backup.tar.gz'), { base: 'backup.tar', ext: 'gz' });
});

test('dotfile (ponto inicial) é tratado como nome, sem extensão', () => {
  assert.deepStrictEqual(splitName('.gitignore'), { base: '.gitignore', ext: '' });
});

// ---------------------------------------------
// buildDisplayName
// ---------------------------------------------
console.log('buildDisplayName');

test('junta nome-base e extensão', () => {
  assert.strictEqual(buildDisplayName('boletim aluno', 'pdf'), 'boletim aluno.pdf');
});

test('sem extensão devolve só o nome-base', () => {
  assert.strictEqual(buildDisplayName('arquivo', ''), 'arquivo');
});

test('faz trim do nome-base', () => {
  assert.strictEqual(buildDisplayName('  boletim  ', 'pdf'), 'boletim.pdf');
});

// ---------------------------------------------
// dedupeBatchNames
// ---------------------------------------------
console.log('dedupeBatchNames');

test('nomes únicos permanecem inalterados', () => {
  assert.deepStrictEqual(
    dedupeBatchNames(['contrato escolar.png', 'boletim.pdf', 'comprovante.jpg']),
    ['contrato escolar.png', 'boletim.pdf', 'comprovante.jpg']
  );
});

test('duplicata ganha sufixo numérico antes da extensão', () => {
  assert.deepStrictEqual(
    dedupeBatchNames(['comprovante.jpg', 'comprovante.jpg']),
    ['comprovante.jpg', 'comprovante 1.jpg']
  );
});

test('três iguais viram base, base 1, base 2', () => {
  assert.deepStrictEqual(
    dedupeBatchNames(['arquivo', 'arquivo', 'arquivo']),
    ['arquivo', 'arquivo 1', 'arquivo 2']
  );
});

test('colisão é case-insensitive', () => {
  assert.deepStrictEqual(
    dedupeBatchNames(['Foto.png', 'foto.png']),
    ['Foto.png', 'foto 1.png']
  );
});

test('extensões diferentes não colidem', () => {
  assert.deepStrictEqual(
    dedupeBatchNames(['doc.pdf', 'doc.txt']),
    ['doc.pdf', 'doc.txt']
  );
});

test('evita colisão com nomes já existentes (cache)', () => {
  assert.deepStrictEqual(
    dedupeBatchNames(['contrato.pdf'], ['contrato.pdf']),
    ['contrato 1.pdf']
  );
});

// ---------------------------------------------
// Cenários de aceite (replicam a composição de nomes feita em
// saveBatchKeepNames / confirmBatchSave -> buildBatchRecords)
// ---------------------------------------------
console.log('Cenários de aceite');

// Caminho "Não": nome desejado = file.name (igual ao código).
function resolveKeepNames(files, existing = []) {
  return dedupeBatchNames(files.map(f => f.name), existing);
}

// Caminho "Sim": nome-base editado (ou original) + extensão original.
function resolveRenamed(files, edits, existing = []) {
  const desired = files.map((f, i) => {
    const { base, ext } = splitName(f.name);
    const edited = edits && edits[i] != null ? String(edits[i]).trim() : '';
    return buildDisplayName(edited || base, ext);
  });
  return dedupeBatchNames(desired, existing);
}

const exemplo = [
  { name: 'contrato escolar.png' },
  { name: 'boletim.pdf' },
  { name: 'comprovante.jpg' },
];

test('"Não" mantém os nomes originais (exemplo do spec)', () => {
  assert.deepStrictEqual(
    resolveKeepNames(exemplo),
    ['contrato escolar.png', 'boletim.pdf', 'comprovante.jpg']
  );
});

test('"Sim" aplica os nomes editados preservando extensão (exemplo do spec)', () => {
  assert.deepStrictEqual(
    resolveRenamed(exemplo, ['contrato escola 2026', 'boletim aluno', 'comprovante matrícula']),
    ['contrato escola 2026.png', 'boletim aluno.pdf', 'comprovante matrícula.jpg']
  );
});

test('"Sim" com campo vazio volta ao nome-base original', () => {
  assert.deepStrictEqual(
    resolveRenamed(exemplo, ['', null, 'comprovante matrícula']),
    ['contrato escolar.png', 'boletim.pdf', 'comprovante matrícula.jpg']
  );
});

test('lote com nomes idênticos recebe sufixo (caminho "Não")', () => {
  assert.deepStrictEqual(
    resolveKeepNames([{ name: 'foto.jpg' }, { name: 'foto.jpg' }, { name: 'foto.jpg' }]),
    ['foto.jpg', 'foto 1.jpg', 'foto 2.jpg']
  );
});

// ---------------------------------------------
console.log('');
console.log(`Resultado: ${passed} passou(aram), ${failed} falhou(aram).`);
process.exit(failed === 0 ? 0 : 1);
