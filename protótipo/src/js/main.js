/* ============================================
   Cadê? — main.js
   SPA local (IndexedDB) para organizar e
   localizar arquivos. Sem servidor.
   ============================================ */

console.log('[Cadê?] Sistema inicializado 🚀');

// ===============================
// CONFIG
// ===============================

const DB_NAME = 'cade_db';
const DB_VERSION = 1;
const STORE_NAME = 'files';

const CATEGORIES = {
  pessoal:   { label: 'Pessoal', icon: '🏠' },
  academico: { label: 'Acadêmico', icon: '🎓' },
  trabalho:  { label: 'Trabalho', icon: '💼' },
};

// Extensões tratadas como imagem (busca por "imagem" e badge).
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'avif'];

let db = null;
let cache = []; // 🔥 CACHE EM MEMÓRIA (IMPORTANTE)

// Estado da UI
let currentScreen = 'home-screen';
let currentCategory = null;
let editingId = null;
let selectedFileObj = null;   // File escolhido no upload (add ou substituição)
let selectedCategory = null;
let lastSearchTerm = '';
let lastSavedCategory = null;
let pendingDeleteId = null;

// Estado do upload em lote (modo adicionar)
let batchFiles = [];              // File[] selecionados no seletor nativo
let batchRowCategories = [];      // categoria escolhida por arquivo (modal "Sim")
let batchDefaultCategory = null;  // categoria clicada na Tela 2 (default do lote)

// ===============================
// INDEXEDDB
// ===============================

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    req.onerror = (e) => reject(e.target.error);
  });
}

function getAllFiles() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      cache = req.result || [];
      resolve(cache);
    };

    req.onerror = (e) => reject(e.target.error);
  });
}

// ===============================
// UTILS
// ===============================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function normalize(str = '') {
  return String(str ?? '').toLowerCase().trim();
}

// Evita quebra de markup ao injetar conteúdo do usuário via innerHTML.
function escapeHtml(str = '') {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR');
}

// Extensão (sem ponto) a partir do nome do arquivo.
function getExtension(filename = '') {
  const m = String(filename).toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

// Deriva metadados de tipo a partir de um File.
function detectFileMeta(file) {
  const ext = getExtension(file.name) || ((file.type || '').split('/')[1] || '');
  const isImage = IMAGE_EXT.includes(ext) || (file.type || '').startsWith('image/');
  return {
    extension: ext,
    fileType: ext,                 // mantém compatibilidade com a busca existente
    isImage,
    mimeType: file.type || '',
  };
}

// ===============================
// NOME / EXTENSÃO / DEDUPLICAÇÃO (upload em lote)
// ===============================

// Separa o nome de um arquivo em { base, ext }, usando o último ponto.
// A extensão preserva o caso original e só é considerada quando parece
// uma extensão real (até 10 caracteres alfanuméricos). Dotfiles e nomes
// sem ponto devolvem ext vazia.
function splitName(filename = '') {
  const name = String(filename ?? '');
  const lastDot = name.lastIndexOf('.');

  if (lastDot > 0) {
    const ext = name.slice(lastDot + 1);
    if (/^[A-Za-z0-9]{1,10}$/.test(ext)) {
      return { base: name.slice(0, lastDot), ext };
    }
  }

  return { base: name, ext: '' };
}

// Reconstrói o nome de exibição a partir de base + extensão.
// Faz trim do nome-base e mantém a extensão original quando existir.
function buildDisplayName(base = '', ext = '') {
  const b = String(base ?? '').trim();
  return ext ? `${b}.${ext}` : b;
}

// Garante nomes únicos num lote (case-insensitive). Em caso de colisão,
// insere um sufixo numérico ANTES da extensão: arquivo, arquivo 1, ...
// `existingNames` permite evitar também colisão com itens já salvos.
function dedupeBatchNames(names = [], existingNames = []) {
  const key = (n) => String(n ?? '').trim().toLowerCase();
  const taken = new Set(existingNames.map(key));
  const result = [];

  for (const name of names) {
    const { base, ext } = splitName(name);
    let candidate = name;
    let n = 1;

    while (taken.has(key(candidate))) {
      candidate = buildDisplayName(`${base} ${n}`, ext);
      n++;
    }

    taken.add(key(candidate));
    result.push(candidate);
  }

  return result;
}

// Marca arquivos atualizados há menos de 48h (destaque visual — spec).
function isRecent(file) {
  const t = new Date(file.updatedAt).getTime();
  if (isNaN(t)) return false;
  return (Date.now() - t) < 48 * 60 * 60 * 1000;
}

// ===============================
// SIMILARIDADE — DICE COEFFICIENT (🔥 NOVO)
// ===============================

// Normaliza texto: minúsculas, sem acentos, sem caracteres
// especiais e sem espaços duplicados.
function normalizeText(text = '') {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // remove acentos
    .replace(/[^a-z0-9\s]/g, '')       // remove caracteres especiais
    .replace(/\s+/g, ' ')              // colapsa espaços duplicados
    .trim();
}

// Gera os bigramas (pares de caracteres) do texto já normalizado.
function getBigrams(text = '') {
  const compact = normalizeText(text);
  const bigrams = [];

  for (let i = 0; i < compact.length - 1; i++) {
    bigrams.push(compact.slice(i, i + 2));
  }

  return bigrams;
}

// Dice = (2 * interseção de bigramas) / (bigramas A + bigramas B)
// Retorna um score entre 0 e 1.
function diceCoefficient(a = '', b = '') {
  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);

  if (bigramsA.length === 0 && bigramsB.length === 0) return 1;
  if (bigramsA.length === 0 || bigramsB.length === 0) return 0;

  const counts = new Map();

  for (const bigram of bigramsA) {
    counts.set(bigram, (counts.get(bigram) || 0) + 1);
  }

  let intersection = 0;

  for (const bigram of bigramsB) {
    const count = counts.get(bigram) || 0;
    if (count > 0) {
      intersection++;
      counts.set(bigram, count - 1);
    }
  }

  return (2 * intersection) / (bigramsA.length + bigramsB.length);
}

// Limiar mínimo de similaridade para considerar um arquivo relevante.
const SIMILARITY_THRESHOLD = 0.6;

// ===============================
// DETECÇÃO DE NOMES SIMILARES (spec: aviso visual)
// ===============================

// Retorna o nome mais parecido já salvo (ou null), ignorando o
// próprio arquivo em edição. Usa igualdade exata OU Dice >= limiar.
function findSimilarName(name, excludeId = null) {
  const norm = normalizeText(name);
  if (norm.length < 3) return null;

  let best = null;
  let bestScore = 0;

  for (const file of cache) {
    if (excludeId && file.id === excludeId) continue;

    const exact = normalize(file.displayName) === normalize(name);
    const score = diceCoefficient(name, file.displayName || '');

    if (exact || score >= SIMILARITY_THRESHOLD) {
      if (score >= bestScore) {
        bestScore = score;
        best = file.displayName;
      }
    }
  }

  return best;
}

function showSimilarAlert(name) {
  const el = document.getElementById('duplicate-alert');
  if (!el) return;
  el.textContent = `⚠️ Já existe um arquivo com nome parecido: "${name}"`;
  el.classList.remove('is-hidden');
}

function hideSimilarAlert() {
  const el = document.getElementById('duplicate-alert');
  if (!el) return;
  el.classList.add('is-hidden');
}

// ===============================
// FILE CRUD
// ===============================

function addFile(record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const now = new Date().toISOString();

    const data = {
      id: generateId(),
      ...record,
      createdAt: now,
      updatedAt: now,
    };

    const req = store.add(data);

    req.onsuccess = () => {
      cache.push(data);
      resolve(data);
    };

    req.onerror = (e) => reject(e.target.error);
  });
}

// Adiciona vários registros numa única transação (upload em lote).
// Reaproveita o mesmo shape de addFile (id/createdAt/updatedAt).
function saveBatch(records) {
  return new Promise((resolve, reject) => {
    if (!records || !records.length) return resolve([]);

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const now = new Date().toISOString();
    const saved = [];

    for (const record of records) {
      const data = {
        id: generateId(),
        ...record,
        createdAt: now,
        updatedAt: now,
      };
      store.add(data);
      saved.push(data);
    }

    tx.oncomplete = () => resolve(saved);
    tx.onerror = (e) => reject(e.target.error);
    tx.onabort = (e) => reject((e.target && e.target.error) || new Error('Transação abortada'));
  });
}

// Atualiza metadados (e opcionalmente substitui o arquivo).
function updateFile(id, changes) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const current = getReq.result;
      if (!current) return reject(new Error('Arquivo não encontrado'));

      const updated = {
        ...current,
        ...changes,
        updatedAt: new Date().toISOString(),
      };

      const putReq = store.put(updated);
      putReq.onsuccess = () => {
        const i = cache.findIndex(f => f.id === id);
        if (i !== -1) cache[i] = updated; else cache.push(updated);
        resolve(updated);
      };
      putReq.onerror = (e) => reject(e.target.error);
    };

    getReq.onerror = (e) => reject(e.target.error);
  });
}

function deleteFile(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => {
      cache = cache.filter(f => f.id !== id);
      resolve();
    };

    req.onerror = (e) => reject(e.target.error);
  });
}

// Persistência + atualização do cache na adição (não bloqueia em
// duplicidade — o aviso é apenas visual; ver findSimilarName).
async function handleSave(fileData) {
  const saved = await addFile(fileData);
  await getAllFiles();
  return saved;
}

// ===============================
// SEARCH (🔥 MEMÓRIA + DICE)
// ===============================

function searchFiles(query) {
  const q = normalize(query);

  if (!q) return cache;

  // Avalia cada arquivo: combina busca parcial/exata (já existente)
  // com similaridade textual por Dice Coefficient sobre o nome.
  const matches = [];

  for (const file of cache) {
    // 1) Busca parcial/exata (mantém o comportamento atual)
    const partialMatch =
      normalize(file.displayName).includes(q) ||
      normalize(file.originalFileName).includes(q) ||
      normalize(file.fileType).includes(q) ||
      (file.isImage && 'imagem'.includes(q)) ||
      normalize(CATEGORIES[file.category]?.label).includes(q) ||
      normalize(file.tag).includes(q);

    // 2) Similaridade por Dice sobre os nomes do arquivo
    const score = Math.max(
      diceCoefficient(query, file.displayName || ''),
      diceCoefficient(query, file.originalFileName || '')
    );

    if (partialMatch || score >= SIMILARITY_THRESHOLD) {
      // Match parcial garante prioridade máxima na ordenação.
      matches.push({ file, score: partialMatch ? Math.max(score, 1) : score });
    }
  }

  // Ordena pelos mais similares primeiro.
  matches.sort((a, b) => b.score - a.score);

  return matches.map(m => m.file);
}

// Filtra arquivos de uma categoria por um termo (nome/tipo/etiqueta).
function filterInCategory(catKey, term) {
  const inCat = cache.filter(f => f.category === catKey);
  const q = normalize(term);
  if (!q) return inCat;

  return inCat.filter(file =>
    normalize(file.displayName).includes(q) ||
    normalize(file.originalFileName).includes(q) ||
    normalize(file.fileType).includes(q) ||
    (file.isImage && 'imagem'.includes(q)) ||
    normalize(file.tag).includes(q)
  );
}

function sortFiles(list, mode) {
  const arr = list.slice();
  if (mode === 'name') {
    arr.sort((a, b) => normalize(a.displayName).localeCompare(normalize(b.displayName), 'pt-BR'));
  } else if (mode === 'type') {
    arr.sort((a, b) => normalize(a.fileType).localeCompare(normalize(b.fileType), 'pt-BR'));
  } else {
    // 'recent' (padrão)
    arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
  return arr;
}

// ===============================
// RENDER — CARDS (Telas 3 e 4)
// ===============================

function badgeSuffix(file) {
  if (file.isImage) return 'imagem';
  const ext = (file.fileType || '').toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'docx';
  if (ext === 'xls' || ext === 'xlsx') return 'xlsx';
  if (ext === 'txt') return 'txt';
  return '';
}

function badgeLabel(file) {
  if (file.fileType) return file.fileType.toUpperCase();
  return file.isImage ? 'IMG' : 'ARQ';
}

// Markup unificado para card de arquivo (variant 'file' ou 'result').
function cardMarkup(file, variant = 'file') {
  const isFile = variant === 'file';
  const wrap   = isFile ? 'file-card'          : 'result-card';
  const head   = isFile ? 'file-card__header'  : 'result-card__header';
  const badge  = isFile ? 'file-card__type-badge' : 'result-card__type-badge';
  const dateC  = isFile ? 'file-card__date'    : 'result-card__date';
  const nameC  = isFile ? 'file-card__name'    : 'result-card__name';
  const metaC  = isFile ? 'file-meta'          : 'result-meta';
  const itemC  = isFile ? 'file-meta__item'    : 'result-meta__item';
  const labelC = isFile ? 'file-meta__label'   : 'result-meta__label';
  const valueC = isFile ? 'file-meta__value'   : 'result-meta__value';
  const tagC   = isFile ? 'file-tag'           : 'result-tag';
  const actC   = isFile ? 'card-actions'       : 'result-actions';
  const openC  = isFile ? 'btn-open-file'      : 'btn-open-result';
  const editC  = isFile ? 'btn-edit-file'      : 'btn-edit-result';
  const delC   = isFile ? 'btn-delete-file'    : 'btn-delete-result';

  const suffix = badgeSuffix(file);
  const badgeMod = suffix ? `${badge}--${suffix}` : '';
  const cat = CATEGORIES[file.category];
  const recent = isRecent(file) ? ' <span class="badge">Recente</span>' : '';

  return `
    <article class="${wrap}">
      <div class="${head}">
        <span class="${badge} ${badgeMod}">${escapeHtml(badgeLabel(file))}</span>
        <span class="${dateC}">Atualizado: ${escapeHtml(formatDate(file.updatedAt))}</span>
      </div>

      <h3 class="${nameC}">${escapeHtml(file.displayName)}${recent}</h3>

      <div class="${metaC}">
        <span class="${itemC}">
          <span class="${labelC}">Categoria:</span>
          <span class="${valueC}">${cat ? cat.icon + ' ' + cat.label : escapeHtml(file.category || '—')}</span>
        </span>
        ${file.tag ? `<span class="${tagC}">🏷️ ${escapeHtml(file.tag)}</span>` : ''}
      </div>

      <div class="${actC}">
        <button class="${openC}" data-action="open" data-id="${file.id}">Abrir →</button>
        <button class="${editC}" data-action="edit" data-id="${file.id}">Editar</button>
        <button class="${delC}"  data-action="delete" data-id="${file.id}">Excluir</button>
      </div>
    </article>`;
}

function renderEmpty(container, variant, icon, title, subtitle) {
  if (!container) return;
  container.innerHTML = `
    <div class="${variant}">
      <div class="${variant}__icon">${icon}</div>
      <p class="${variant}__title">${escapeHtml(title)}</p>
      <p class="${variant}__subtitle">${escapeHtml(subtitle)}</p>
    </div>`;
}

// ===============================
// NAVEGAÇÃO ENTRE TELAS
// ===============================

const SCREENS = ['home-screen', 'upload-screen', 'category-screen', 'search-results-screen'];

function showScreen(id) {
  SCREENS.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.toggle('is-hidden', s !== id);
  });
  currentScreen = id;
  window.scrollTo(0, 0);
}

function goHome() {
  refreshHome();
  showScreen('home-screen');
}

// ===============================
// TELA INICIAL — empty state / resumo
// ===============================

function refreshHome() {
  const empty = document.getElementById('empty-state');
  const summary = document.getElementById('home-files-summary');
  const summaryText = summary ? summary.querySelector('.home-summary__text') : null;

  const total = cache.length;

  if (total > 0) {
    if (empty) empty.classList.add('is-hidden');
    if (summary) summary.classList.remove('is-hidden');
    if (summaryText) {
      summaryText.textContent =
        `Você tem ${total} ${total === 1 ? 'arquivo salvo' : 'arquivos salvos'}. ` +
        `Use a busca ou as categorias para encontrá-los.`;
    }
  } else {
    if (empty) empty.classList.remove('is-hidden');
    if (summary) summary.classList.add('is-hidden');
  }
}

// ===============================
// TELA 2 — UPLOAD / EDIÇÃO
// ===============================

const UPLOAD_CONTENT_DEFAULT = `
  <span class="upload-area__icon">📎</span>
  <span class="upload-area__text">Toque ou clique para selecionar um arquivo</span>
  <span class="upload-area__hint">PDF, imagem ou documento</span>`;

function setUploadContentSelected(filename, hint) {
  const content = document.getElementById('upload-content');
  if (!content) return;
  content.innerHTML = `
    <span class="upload-area__selected-icon">📄</span>
    <span class="upload-area__filename">${escapeHtml(filename)}</span>
    <span class="upload-area__change-hint">${escapeHtml(hint)}</span>`;
}

function resetUploadContent() {
  const content = document.getElementById('upload-content');
  if (content) content.innerHTML = UPLOAD_CONTENT_DEFAULT;
}

function setFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg || '';
}

function clearUploadErrors() {
  setFieldError('error-file', '');
  setFieldError('error-name', '');
  setFieldError('error-category', '');
  const area = document.getElementById('upload-area');
  if (area) area.classList.remove('is-error');
  const opts = document.querySelector('.category-options');
  if (opts) opts.classList.remove('is-error');
}

function markCategorySelection(catKey) {
  document.querySelectorAll('.category-option').forEach(btn => {
    btn.classList.toggle('is-selected', btn.dataset.category === catKey);
  });
}

function showUploadForm() {
  const form = document.getElementById('upload-form');
  const panel = document.getElementById('upload-success-panel');
  if (form) form.classList.remove('is-hidden');
  if (panel) panel.classList.add('is-hidden');
}

// Mostra/oculta o campo único "Nome do arquivo" (usado só na edição).
function setNameFieldVisible(visible) {
  const group = document.getElementById('name-field-group');
  if (group) group.classList.toggle('is-hidden', !visible);
}

// Abre a Tela 2 em modo "adicionar" (upload em lote).
function openAdd() {
  editingId = null;
  selectedFileObj = null;
  selectedCategory = null;
  resetBatchState();

  setText('upload-intro-title', 'Adicionar arquivos');
  setText('upload-intro-subtitle', 'Envie um ou mais documentos e organize-os por categoria');

  const nameInput = document.getElementById('file-name');
  const tagInput = document.getElementById('file-tag');
  if (nameInput) nameInput.value = '';
  if (tagInput) tagInput.value = '';

  setNameFieldVisible(false);   // a nomeação acontece no fluxo de renomeação
  resetUploadContent();
  markCategorySelection(null);
  clearUploadErrors();
  hideSimilarAlert();
  showUploadForm();

  showScreen('upload-screen');
}

// Abre a Tela 2 em modo "editar" (reaproveita a mesma tela).
function openEdit(id) {
  const file = cache.find(f => f.id === id);
  if (!file) return;

  editingId = id;
  selectedFileObj = null;            // só muda o arquivo se o usuário escolher um novo
  selectedCategory = file.category;
  resetBatchState();

  setText('upload-intro-title', 'Editar arquivo');
  setText('upload-intro-subtitle', 'Altere as informações e escolha a categoria para salvar');

  setNameFieldVisible(true);         // edição continua usando o campo único de nome

  const nameInput = document.getElementById('file-name');
  const tagInput = document.getElementById('file-tag');
  if (nameInput) nameInput.value = file.displayName || '';
  if (tagInput) tagInput.value = file.tag || '';

  setUploadContentSelected(file.originalFileName || file.displayName, 'Arquivo atual — toque para substituir');
  markCategorySelection(file.category);
  clearUploadErrors();
  hideSimilarAlert();
  showUploadForm();

  showScreen('upload-screen');
}

function onFileSelected(e) {
  const files = e.target.files ? Array.from(e.target.files) : [];
  if (!files.length) return;

  if (editingId) {
    // Edição: substitui por um único arquivo (mantém o fluxo atual).
    selectedFileObj = files[0];
    setUploadContentSelected(files[0].name, 'Arquivo atual — toque para substituir');
  } else {
    // Adição: guarda o lote selecionado.
    batchFiles = files;
    if (files.length === 1) {
      setUploadContentSelected(files[0].name, 'Toque para trocar os arquivos');
    } else {
      setUploadContentSelected(
        `${files.length} arquivos selecionados`,
        'Toque para trocar a seleção'
      );
    }
  }

  setFieldError('error-file', '');
  const area = document.getElementById('upload-area');
  if (area) area.classList.remove('is-error');
}

function onNameInput() {
  const name = (document.getElementById('file-name') || {}).value || '';
  const similar = findSimilarName(name, editingId);
  if (similar) showSimilarAlert(similar);
  else hideSimilarAlert();
}

// Clique numa categoria. Na edição mantém o auto-save single-file; na
// adição é o gatilho de envio do lote (abre a pergunta de renomeação).
function onCategoryClick(catKey) {
  selectedCategory = catKey;
  markCategorySelection(catKey);

  if (editingId) {
    trySave();
  } else {
    startBatchSubmit(catKey);
  }
}

async function trySave() {
  const name = ((document.getElementById('file-name') || {}).value || '').trim();
  const tag = ((document.getElementById('file-tag') || {}).value || '').trim();

  clearUploadErrors();
  let hasError = false;

  // Arquivo é obrigatório ao adicionar (na edição pode manter o atual).
  if (!editingId && !selectedFileObj) {
    setFieldError('error-file', 'Selecione um arquivo para continuar.');
    const area = document.getElementById('upload-area');
    if (area) area.classList.add('is-error');
    hasError = true;
  }

  if (!name) {
    setFieldError('error-name', 'Dê um nome ao arquivo.');
    hasError = true;
  }

  if (!selectedCategory) {
    setFieldError('error-category', 'Escolha uma categoria.');
    hasError = true;
  }

  if (hasError) return;

  try {
    let saved;
    if (editingId) {
      const changes = { displayName: name, category: selectedCategory, tag };
      if (selectedFileObj) {
        Object.assign(changes, detectFileMeta(selectedFileObj), {
          originalFileName: selectedFileObj.name,
          blob: selectedFileObj,
        });
      }
      saved = await updateFile(editingId, changes);
      showSuccess('edit', saved);
    } else {
      const meta = detectFileMeta(selectedFileObj);
      const record = {
        displayName: name,
        originalFileName: selectedFileObj.name,
        tag,
        category: selectedCategory,
        blob: selectedFileObj,
        ...meta,
      };
      saved = await handleSave(record);
      showSuccess('add', saved);
    }
  } catch (err) {
    console.error('[Cadê?] Erro ao salvar:', err);
    setFieldError('error-name', 'Não foi possível salvar. Tente novamente.');
  }
}

function showSuccess(mode, file) {
  lastSavedCategory = file ? file.category : null;

  setText('upload-success-title',
    mode === 'edit' ? 'Arquivo atualizado com sucesso' : 'Arquivo adicionado com sucesso');
  setText('upload-success-subtitle',
    mode === 'edit'
      ? 'As alterações foram salvas. Você já pode vê-las na lista.'
      : 'Seu arquivo foi salvo e já pode ser encontrado na busca.');

  const form = document.getElementById('upload-form');
  const panel = document.getElementById('upload-success-panel');
  if (form) form.classList.add('is-hidden');
  if (panel) panel.classList.remove('is-hidden');

  hideSimilarAlert();
  refreshHome();
}

// ===============================
// TELA 2 — UPLOAD EM LOTE (múltiplos arquivos + renomeação)
// ===============================

function resetBatchState() {
  batchFiles = [];
  batchRowCategories = [];
  batchDefaultCategory = null;
  const input = document.getElementById('upload-input');
  if (input) input.value = '';
}

// --- helpers de modal genéricos ---
function showModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('is-hidden');
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('is-hidden');
}

function closeBatchModals() {
  hideModal('rename-decision-modal');
  hideModal('rename-list-modal');
}

// Gatilho de envio na adição: valida a seleção e pergunta sobre renomear.
function startBatchSubmit(catKey) {
  batchDefaultCategory = catKey;
  clearUploadErrors();

  if (!batchFiles.length) {
    setFieldError('error-file', 'Selecione um ou mais arquivos para continuar.');
    const area = document.getElementById('upload-area');
    if (area) area.classList.add('is-error');
    return;
  }

  openRenameDecision();
}

// Pergunta "Deseja renomear seus arquivos?".
function openRenameDecision() {
  const n = batchFiles.length;

  setText('rename-decision-subtitle',
    n === 1
      ? 'Você selecionou 1 arquivo. Renomeie-o agora ou mantenha o nome original.'
      : `Você selecionou ${n} arquivos. Renomeie-os agora ou mantenha os nomes originais.`);

  const list = document.getElementById('rename-decision-list');
  if (list) {
    list.innerHTML = batchFiles
      .map(f => `<li class="batch-files-preview__item">${escapeHtml(f.name)}</li>`)
      .join('');
  }

  showModal('rename-decision-modal');
}

// "Não": salva todos com os nomes originais e a categoria padrão do lote.
function saveBatchKeepNames() {
  hideModal('rename-decision-modal');
  const names = batchFiles.map(f => f.name);
  const categories = batchFiles.map(() => batchDefaultCategory);
  commitBatch(buildBatchRecords(names, categories));
}

// "Sim": abre a lista de renomeação (nome-base + extensão + categoria por arquivo).
function openRenameList() {
  hideModal('rename-decision-modal');
  batchRowCategories = batchFiles.map(() => batchDefaultCategory);
  renderRenameList();
  showModal('rename-list-modal');
}

function renderRenameList() {
  const container = document.getElementById('rename-list');
  if (!container) return;

  container.innerHTML = batchFiles.map((file, i) => {
    const { base, ext } = splitName(file.name);
    const extChip = ext ? `<span class="rename-row__ext">.${escapeHtml(ext)}</span>` : '';

    const cats = Object.keys(CATEGORIES).map(key => {
      const c = CATEGORIES[key];
      const sel = batchRowCategories[i] === key ? ' is-selected' : '';
      return `<button type="button" class="category-option category-option--mini${sel}" data-row="${i}" data-category="${key}">${c.icon} ${escapeHtml(c.label)}</button>`;
    }).join('');

    return `
      <div class="rename-row" data-index="${i}">
        <span class="rename-row__original" title="${escapeHtml(file.name)}">Original: ${escapeHtml(file.name)}</span>
        <div class="rename-row__name">
          <div class="form-input-wrapper rename-row__field">
            <input type="text" class="form-input rename-row__input" data-row="${i}" value="${escapeHtml(base)}" placeholder="${escapeHtml(base)}" aria-label="Novo nome para ${escapeHtml(file.name)}" />
          </div>
          ${extChip}
        </div>
        <div class="rename-row__categories">${cats}</div>
      </div>`;
  }).join('');
}

// Lê os campos da lista, monta os registros e salva.
function confirmBatchSave() {
  const container = document.getElementById('rename-list');

  const names = batchFiles.map((file, i) => {
    const { base, ext } = splitName(file.name);
    const input = container
      ? container.querySelector(`.rename-row__input[data-row="${i}"]`)
      : null;
    const edited = input ? input.value.trim() : '';
    const finalBase = edited || base;       // campo vazio -> nome original (fallback)
    return buildDisplayName(finalBase, ext);
  });

  const categories = batchFiles.map((_, i) => batchRowCategories[i] || batchDefaultCategory);

  hideModal('rename-list-modal');
  commitBatch(buildBatchRecords(names, categories));
}

// Monta os registros do lote: deduplica nomes e preserva metadados.
function buildBatchRecords(desiredNames, categories) {
  const tag = ((document.getElementById('file-tag') || {}).value || '').trim();
  const existing = cache.map(f => f.displayName);
  const finalNames = dedupeBatchNames(desiredNames, existing);

  return batchFiles.map((file, i) => ({
    displayName: finalNames[i],
    originalFileName: finalNames[i],
    tag,
    category: categories[i],
    blob: file,
    ...detectFileMeta(file),
  }));
}

// Persiste o lote, atualiza o cache e mostra o painel de sucesso.
async function commitBatch(records) {
  if (!records.length) return;

  try {
    const saved = await saveBatch(records);
    await getAllFiles();

    const cats = [...new Set(records.map(r => r.category))];
    showBatchSuccess(saved.length, cats.length === 1 ? cats[0] : null);
    resetBatchState();
  } catch (err) {
    console.error('[Cadê?] Erro ao salvar lote:', err);
    setFieldError('error-file', 'Não foi possível salvar os arquivos. Tente novamente.');
  }
}

function showBatchSuccess(count, category) {
  lastSavedCategory = category || null;

  setText('upload-success-title',
    count === 1 ? 'Arquivo adicionado com sucesso' : `${count} arquivos adicionados com sucesso`);
  setText('upload-success-subtitle',
    count === 1
      ? 'Seu arquivo foi salvo e já pode ser encontrado na busca.'
      : 'Seus arquivos foram salvos e já podem ser encontrados na busca.');

  const form = document.getElementById('upload-form');
  const panel = document.getElementById('upload-success-panel');
  if (form) form.classList.add('is-hidden');
  if (panel) panel.classList.remove('is-hidden');

  hideSimilarAlert();
  refreshHome();
}

// ===============================
// TELA 3 — CATEGORIA
// ===============================

function openCategory(catKey) {
  currentCategory = catKey;

  const cat = CATEGORIES[catKey];
  setText('category-summary-icon', cat ? cat.icon : '📁');
  setText('category-summary-label', cat ? cat.label : catKey);

  const filterInput = document.getElementById('category-filter-input');
  if (filterInput) filterInput.value = '';
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'recent';

  renderCategory();
  showScreen('category-screen');
}

function renderCategory() {
  const container = document.getElementById('file-list');
  if (!container) return;

  const totalInCat = cache.filter(f => f.category === currentCategory).length;
  const term = (document.getElementById('category-filter-input') || {}).value || '';
  const mode = (document.getElementById('sort-select') || {}).value || 'recent';

  let list = filterInCategory(currentCategory, term);
  list = sortFiles(list, mode);

  const cat = CATEGORIES[currentCategory];
  setText('category-summary-count',
    `${totalInCat} ${totalInCat === 1 ? 'arquivo' : 'arquivos'}`);

  if (totalInCat === 0) {
    renderEmpty(container, 'empty-filter-state', '📂',
      'Nenhum arquivo nesta categoria',
      `Adicione um documento e coloque em ${cat ? cat.label : 'esta categoria'}.`);
    return;
  }

  if (list.length === 0) {
    renderEmpty(container, 'empty-filter-state', '🔍',
      'Nenhum arquivo encontrado',
      'Tente outro termo no filtro desta categoria.');
    return;
  }

  container.innerHTML = list.map(f => cardMarkup(f, 'file')).join('');
}

// ===============================
// TELA 4 — RESULTADO DA BUSCA
// ===============================

function runSearch(term) {
  lastSearchTerm = term || '';
  const input = document.getElementById('results-search-input');
  if (input) input.value = lastSearchTerm;
  renderSearch();
  showScreen('search-results-screen');
}

function renderSearch() {
  const term = lastSearchTerm;
  const results = term.trim() ? searchFiles(term) : cache.slice();

  const fb = document.getElementById('search-results-feedback');
  if (fb) {
    if (term.trim()) {
      fb.innerHTML = `
        <div class="results-feedback">
          <span class="results-feedback__term">Resultado para: <span class="results-feedback__highlight">${escapeHtml(term)}</span></span>
          <span class="results-feedback__count">${results.length} ${results.length === 1 ? 'arquivo encontrado' : 'arquivos encontrados'}</span>
        </div>`;
    } else {
      fb.innerHTML = `
        <div class="results-feedback">
          <span class="results-feedback__count">${results.length} ${results.length === 1 ? 'arquivo no total' : 'arquivos no total'}</span>
        </div>`;
    }
  }

  const list = document.getElementById('search-results-list');
  if (!list) return;

  if (results.length === 0) {
    renderEmpty(list, 'empty-results-state', '🔍',
      'Nenhum arquivo encontrado',
      'Tente palavras diferentes ou verifique a ortografia.');
    return;
  }

  list.innerHTML = results.map(f => cardMarkup(f, 'result')).join('');
}

// ===============================
// ABRIR ARQUIVO (com fallback de download)
// ===============================

function openFile(id) {
  const file = cache.find(f => f.id === id);
  if (!file || !file.blob) {
    console.warn('[Cadê?] Arquivo sem conteúdo para abrir:', id);
    return;
  }

  const url = URL.createObjectURL(file.blob);
  const win = window.open(url, '_blank');

  // Fallback: popup bloqueado -> força download.
  if (!win || win.closed || typeof win.closed === 'undefined') {
    const a = document.createElement('a');
    a.href = url;
    a.download = file.originalFileName || file.displayName || 'arquivo';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ===============================
// EXCLUSÃO (modal de confirmação)
// ===============================

function promptDelete(id) {
  const file = cache.find(f => f.id === id);
  if (!file) return;

  pendingDeleteId = id;
  setText('delete-modal-name', file.displayName || file.originalFileName || 'este arquivo');

  const modal = document.getElementById('delete-modal');
  if (modal) modal.classList.remove('is-hidden');
}

function hideDeleteModal() {
  pendingDeleteId = null;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.classList.add('is-hidden');
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  try {
    await deleteFile(pendingDeleteId);
  } catch (err) {
    console.error('[Cadê?] Erro ao excluir:', err);
  }
  hideDeleteModal();
  refreshActiveView();
}

function refreshActiveView() {
  refreshHome();
  if (currentScreen === 'category-screen') renderCategory();
  else if (currentScreen === 'search-results-screen') renderSearch();
}

// ===============================
// HELPERS DE DOM
// ===============================

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ===============================
// BIND DE EVENTOS
// ===============================

function bindEvents() {
  // --- Home: adicionar arquivo ---
  on('btn-add-file', 'click', openAdd);
  on('btn-empty-state-add', 'click', openAdd);

  // --- Home: categorias ---
  document.querySelectorAll('.screen-home .category-card[data-category]').forEach(card => {
    card.addEventListener('click', () => openCategory(card.dataset.category));
  });

  // --- Home: busca global (Enter) ---
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runSearch(searchInput.value);
      }
    });
  }

  // --- Tela 2: upload ---
  on('upload-input', 'change', onFileSelected);
  on('btn-back', 'click', goHome);

  const nameInput = document.getElementById('file-name');
  if (nameInput) nameInput.addEventListener('input', debounce(onNameInput, 250));

  document.querySelectorAll('.category-option[data-category]').forEach(btn => {
    btn.addEventListener('click', () => onCategoryClick(btn.dataset.category));
  });

  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) uploadForm.addEventListener('submit', (e) => e.preventDefault());

  // --- Tela 2: painel de sucesso ---
  on('btn-success-view-files', 'click', () => {
    if (lastSavedCategory) openCategory(lastSavedCategory);
    else goHome();
  });
  on('btn-success-add-another', 'click', openAdd);

  // --- Tela 3: categoria ---
  on('btn-category-back', 'click', goHome);
  const filterInput = document.getElementById('category-filter-input');
  if (filterInput) filterInput.addEventListener('input', debounce(renderCategory, 200));
  on('sort-select', 'change', renderCategory);

  // --- Tela 4: resultados ---
  on('btn-search-back', 'click', goHome);
  const resultsForm = document.getElementById('results-search-form');
  if (resultsForm) {
    resultsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (document.getElementById('results-search-input') || {}).value || '';
      lastSearchTerm = v;
      renderSearch();
    });
  }
  const resultsInput = document.getElementById('results-search-input');
  if (resultsInput) {
    resultsInput.addEventListener('input', debounce(() => {
      lastSearchTerm = resultsInput.value;
      renderSearch();
    }, 250));
  }

  // --- Modal de exclusão ---
  on('btn-delete-cancel', 'click', hideDeleteModal);
  on('btn-delete-confirm', 'click', confirmDelete);
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideDeleteModal(); // clicar fora fecha
    });
  }

  // --- Modais do upload em lote (renomeação) ---
  on('btn-rename-yes', 'click', openRenameList);
  on('btn-rename-no', 'click', saveBatchKeepNames);
  on('btn-rename-save', 'click', confirmBatchSave);
  on('btn-rename-cancel', 'click', () => {
    hideModal('rename-list-modal');
    showModal('rename-decision-modal');     // "Voltar" reabre a pergunta
  });

  // Seleção de categoria por arquivo (delegação dentro da lista)
  const renameList = document.getElementById('rename-list');
  if (renameList) {
    renameList.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-option[data-row]');
      if (!btn) return;
      const row = Number(btn.dataset.row);
      batchRowCategories[row] = btn.dataset.category;
      renameList.querySelectorAll(`.category-option[data-row="${row}"]`).forEach(b => {
        b.classList.toggle('is-selected', b.dataset.category === btn.dataset.category);
      });
    });
  }

  // Clicar fora fecha o modal de lote (cancela, mantendo a seleção)
  ['rename-decision-modal', 'rename-list-modal'].forEach(id => {
    const m = document.getElementById(id);
    if (m) m.addEventListener('click', (e) => { if (e.target === m) hideModal(id); });
  });

  // Esc fecha os modais de lote
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBatchModals();
  });

  // --- Delegação: ações dos cards (abrir/editar/excluir) ---
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'open') openFile(id);
    else if (action === 'edit') openEdit(id);
    else if (action === 'delete') promptDelete(id);
  });
}

function on(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

// ===============================
// INIT APP
// ===============================

async function init() {
  try {
    await openDatabase();
    await getAllFiles();
  } catch (err) {
    console.error('[Cadê?] Falha ao iniciar o banco local:', err);
  }

  bindEvents();
  refreshHome();
  showScreen('home-screen');

  console.log('[Cadê?] Ready ✔️');
}

// Só inicializa a UI em ambiente de navegador. Em Node (testes de lógica)
// apenas exportamos os helpers puros.
if (typeof document !== 'undefined') {
  init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { splitName, buildDisplayName, dedupeBatchNames };
}
