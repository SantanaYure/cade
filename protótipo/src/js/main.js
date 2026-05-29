/* ============================================
   Cadê? — main.js 
   
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

let db = null;
let cache = []; // 🔥 CACHE EM MEMÓRIA (IMPORTANTE)

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
  return str.toLowerCase().trim();
}

// ===============================
// DUPLICIDADE (🔥 NOVO)
// ===============================

function checkDuplicate(name) {
  const target = normalize(name);
  return cache.some(file =>
    normalize(file.displayName) === target ||
    normalize(file.originalFileName) === target
  );
}

function showDuplicateAlert(show = true) {
  const el = document.getElementById('duplicate-alert');
  if (!el) return;
  el.classList.toggle('is-hidden', !show);
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

// ===============================
// SEARCH (🔥 MEMÓRIA + TEMPO REAL)
// ===============================

function searchFiles(query) {
  const q = normalize(query);

  if (!q) return cache;

  return cache.filter(file =>
    normalize(file.displayName).includes(q) ||
    normalize(file.originalFileName).includes(q) ||
    normalize(file.fileType).includes(q) ||
    normalize(CATEGORIES[file.category]?.label).includes(q) ||
    normalize(file.tag).includes(q)
  );
}

// ===============================
// RENDER CARDS (🔥 updatedAt DESTACADO)
// ===============================

function renderCards(list) {
  const container = document.getElementById('file-list');
  if (!container) return;

  container.innerHTML = list.map(file => `
    <article class="file-card">

      <div class="file-card__top">
        <span class="file-type">${file.fileType}</span>

        <!-- 🔥 UPDATED AT DESTACADO -->
        <span class="file-date">
          Atualizado: ${new Date(file.updatedAt).toLocaleString('pt-BR')}
        </span>
      </div>

      <h3>${file.displayName}</h3>

      <p class="file-meta">
        ${CATEGORIES[file.category]?.icon || '📁'}
        ${CATEGORIES[file.category]?.label || file.category}
      </p>

      <div class="file-actions">
        <button data-id="${file.id}" class="open-btn">Abrir</button>
        <button data-id="${file.id}" class="edit-btn">Editar</button>
        <button data-id="${file.id}" class="delete-btn">Excluir</button>
      </div>

    </article>
  `).join('');
}

// ===============================
// DEBOUNCE SEARCH (🔥 UX MELHOR)
// ===============================

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ===============================
// INIT SEARCH GLOBAL
// ===============================

function initGlobalSearch() {
  const input = document.getElementById('search-input');

  if (!input) return;

  input.addEventListener('input', debounce((e) => {
    const results = searchFiles(e.target.value);
    renderCards(results);
  }, 250));
}

// ===============================
// UPLOAD LOGIC (COM DUPLICATE ALERT)
// ===============================

async function handleSave(fileData) {

  // 🔥 DUPLICATE CHECK
  if (checkDuplicate(fileData.displayName)) {
    showDuplicateAlert(true);
    return;
  }

  showDuplicateAlert(false);

  const saved = await addFile(fileData);
  await getAllFiles();

  return saved;
}

// ===============================
// INIT APP
// ===============================

async function init() {
  await openDatabase();
  await getAllFiles();

  initGlobalSearch();

  // render inicial
  renderCards(cache);

  console.log('[Cadê?] Ready ✔️');
}

init(); 