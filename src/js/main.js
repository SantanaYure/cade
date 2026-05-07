/* ============================================
   main.js — Cadê? | IndexedDB CRUD
   ============================================ */

console.log('[Cadê?] Protótipo carregado com sucesso.');

// ══════════════════════════════════════════════
//  CONFIGURAÇÃO
// ══════════════════════════════════════════════

const DB_NAME    = 'cade_db';
const DB_VERSION = 1;
const STORE_NAME = 'files';

const CATEGORIES = {
  pessoal:   { label: 'Pessoal',   icon: '🏠' },
  academico: { label: 'Acadêmico', icon: '🎓' },
  trabalho:  { label: 'Trabalho',  icon: '💼' },
};

// ══════════════════════════════════════════════
//  INDEXEDDB — Funções de acesso
// ══════════════════════════════════════════════

let db = null;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = e => {
      db = e.target.result;
      resolve(db);
    };
    req.onerror = e => reject(e.target.error);
  });
}

function addFileRecord(fileData) {
  return new Promise((resolve, reject) => {
    const tx     = db.transaction(STORE_NAME, 'readwrite');
    const store  = tx.objectStore(STORE_NAME);
    const now    = new Date().toISOString();
    const record = {
      id:               generateId(),
      displayName:      fileData.displayName.trim(),
      originalFileName: fileData.originalFileName,
      fileType:         fileData.fileType,
      mimeType:         fileData.mimeType || '',
      fileSize:         fileData.fileSize || 0,
      category:         fileData.category,
      tag:              fileData.tag ? fileData.tag.trim() : '',
      blob:             fileData.blob,
      createdAt:        now,
      updatedAt:        now,
    };
    const req   = store.add(record);
    req.onsuccess = () => { console.log('[Cadê?] Arquivo salvo:', record.displayName); resolve(record); };
    req.onerror   = e => reject(e.target.error);
  });
}

function getAllFileRecords() {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.getAll();
    req.onsuccess = e => resolve(e.target.result || []);
    req.onerror   = e => reject(e.target.error);
  });
}

function getFileRecordById(id) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.get(id);
    req.onsuccess = e => resolve(e.target.result || null);
    req.onerror   = e => reject(e.target.error);
  });
}

function updateFileRecord(id, updatedData) {
  return new Promise((resolve, reject) => {
    const tx     = db.transaction(STORE_NAME, 'readwrite');
    const store  = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = e => {
      const existing = e.target.result;
      if (!existing) { reject(new Error('Registro não encontrado.')); return; }
      const updated = {
        ...existing,
        displayName: updatedData.displayName.trim(),
        category:    updatedData.category,
        tag:         updatedData.tag ? updatedData.tag.trim() : '',
        updatedAt:   new Date().toISOString(),
      };
      if (updatedData.blob) {
        updated.originalFileName = updatedData.originalFileName;
        updated.fileType         = updatedData.fileType;
        updated.mimeType         = updatedData.mimeType || '';
        updated.fileSize         = updatedData.fileSize || 0;
        updated.blob             = updatedData.blob;
      }
      const putReq    = store.put(updated);
      putReq.onsuccess = () => { console.log('[Cadê?] Arquivo atualizado:', updated.displayName); resolve(updated); };
      putReq.onerror   = e2 => reject(e2.target.error);
    };
    getReq.onerror = e => reject(e.target.error);
  });
}

function deleteFileRecord(id) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.delete(id);
    req.onsuccess = () => { console.log('[Cadê?] Arquivo excluído:', id); resolve(); };
    req.onerror   = e => reject(e.target.error);
  });
}

// ══════════════════════════════════════════════
//  UTILITÁRIOS
// ══════════════════════════════════════════════

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function detectFileType(file) {
  const mime = (file.type || '').toLowerCase();
  const ext  = file.name.split('.').pop().toLowerCase();
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'imagem';
  if (mime === 'application/pdf' || ext === 'pdf')   return 'pdf';
  if (['doc', 'docx'].includes(ext) || mime.includes('word'))                                   return 'docx';
  if (['xls', 'xlsx'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel'))  return 'xlsx';
  if (['ppt', 'pptx'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) return 'pptx';
  if (ext === 'txt' || mime === 'text/plain') return 'txt';
  return ext || 'arquivo';
}

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('pt-BR');
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024)              return `${bytes} B`;
  if (bytes < 1024 * 1024)       return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ══════════════════════════════════════════════
//  ABRIR ARQUIVO
// ══════════════════════════════════════════════

async function openStoredFile(id) {
  try {
    const record = await getFileRecordById(id);
    if (!record || !record.blob) {
      console.warn('[Cadê?] Arquivo não encontrado no banco.');
      return;
    }
    const blob = record.blob instanceof Blob ? record.blob : new Blob([record.blob], { type: record.mimeType || 'application/octet-stream' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    if (!win) {
      // Popup bloqueado — fallback para download
      await downloadStoredFile(id);
    }
  } catch (err) {
    console.error('[Cadê?] Erro ao abrir arquivo:', err);
  }
}

async function downloadStoredFile(id) {
  try {
    const record = await getFileRecordById(id);
    if (!record || !record.blob) {
      console.warn('[Cadê?] Arquivo não encontrado no banco.');
      return;
    }
    const blob = record.blob instanceof Blob ? record.blob : new Blob([record.blob], { type: record.mimeType || 'application/octet-stream' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = record.originalFileName || record.displayName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (err) {
    console.error('[Cadê?] Erro ao baixar arquivo:', err);
  }
}

// ══════════════════════════════════════════════
//  NAVEGAÇÃO
// ══════════════════════════════════════════════

const SCREENS = {
  home:          document.querySelector('.screen-home'),
  upload:        document.getElementById('upload-screen'),
  category:      document.getElementById('category-screen'),
  searchResults: document.getElementById('search-results-screen'),
};

function showScreen(name) {
  Object.values(SCREENS).forEach(s => s.classList.add('is-hidden'));
  SCREENS[name].classList.remove('is-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════
//  TELA INICIAL
// ══════════════════════════════════════════════

const emptyState       = document.getElementById('empty-state');
const homeFilesSummary = document.getElementById('home-files-summary');
const btnAddFile       = document.getElementById('btn-add-file');
const searchInput      = document.getElementById('search-input');
const categoryCards    = document.querySelectorAll('.category-card');

async function renderHomeState() {
  try {
    const files = await getAllFileRecords();
    if (files.length === 0) {
      emptyState.classList.remove('is-hidden');
      homeFilesSummary.classList.add('is-hidden');
    } else {
      emptyState.classList.add('is-hidden');
      homeFilesSummary.classList.remove('is-hidden');
      const n = files.length;
      homeFilesSummary.querySelector('.home-summary__text').textContent =
        `Você tem ${n} arquivo${n !== 1 ? 's' : ''} salvo${n !== 1 ? 's' : ''}`;
    }
  } catch (err) {
    console.error('[Cadê?] Erro ao carregar estado da home:', err);
  }
}

btnAddFile.addEventListener('click', () => openCreateMode());

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim();
    if (query) openSearchResultsScreen(query);
  }
});

categoryCards.forEach(card => {
  card.addEventListener('click', () => openCategoryScreen(card.dataset.category));
});

// ══════════════════════════════════════════════
//  TELA 2: UPLOAD / EDIÇÃO
// ══════════════════════════════════════════════

let editingFileId    = null;
let selectedFile     = null;
let selectedCategory = null;

const uploadArea            = document.getElementById('upload-area');
const uploadInput           = document.getElementById('upload-input');
const uploadContent         = document.getElementById('upload-content');
const uploadSelected        = document.getElementById('upload-selected');
const filenameText          = document.getElementById('filename-text');
const fileNameInput         = document.getElementById('file-name');
const fileTagInput          = document.getElementById('file-tag');
const uploadCategoryOpts    = document.querySelectorAll('.category-option');
const uploadForm            = document.getElementById('upload-form');
const btnBack               = document.getElementById('btn-back');
const successMessage        = document.getElementById('success-message');
const uploadIntroTitle      = document.getElementById('upload-intro-title');
const uploadIntroSubtitle   = document.getElementById('upload-intro-subtitle');
const uploadAreaWrapper     = document.getElementById('upload-area-wrapper');
const editReferenceRow      = document.getElementById('edit-reference-row');
const editReferenceFilename = document.getElementById('edit-reference-filename');

function openCreateMode() {
  editingFileId = null;
  resetUploadForm();
  uploadIntroTitle.textContent    = 'Adicionar arquivo';
  uploadIntroSubtitle.textContent = 'Envie um documento e organize-o por categoria';
  uploadAreaWrapper.classList.remove('is-hidden');
  editReferenceRow.classList.add('is-hidden');
  showScreen('upload');
}

async function openEditMode(id) {
  try {
    const file = await getFileRecordById(id);
    if (!file) return;
    editingFileId = id;
    resetUploadForm();
    uploadIntroTitle.textContent    = 'Editar arquivo';
    uploadIntroSubtitle.textContent = 'Atualize as informações do arquivo';
    // Mantém área de upload visível (arquivo novo é opcional em edição)
    uploadAreaWrapper.classList.remove('is-hidden');
    editReferenceRow.classList.remove('is-hidden');
    editReferenceFilename.textContent = file.originalFileName;
    fileNameInput.value = file.displayName;
    fileTagInput.value  = file.tag || '';
    uploadCategoryOpts.forEach(opt => {
      const match = opt.dataset.category === file.category;
      opt.classList.toggle('is-selected', match);
      opt.setAttribute('aria-checked', String(match));
    });
    selectedCategory = file.category;
    showScreen('upload');
  } catch (err) {
    console.error('[Cadê?] Erro ao abrir modo de edição:', err);
  }
}

function resetUploadForm() {
  selectedFile     = null;
  selectedCategory = null;
  uploadInput.value        = '';
  fileNameInput.value      = '';
  fileTagInput.value       = '';
  filenameText.textContent = '';
  uploadContent.classList.remove('is-hidden');
  uploadSelected.classList.add('is-hidden');
  uploadCategoryOpts.forEach(o => {
    o.classList.remove('is-selected');
    o.setAttribute('aria-checked', 'false');
  });
  uploadArea.classList.remove('is-error');
  fileNameInput.closest('.form-input-wrapper')?.classList.remove('is-error');
  document.querySelector('.category-options')?.classList.remove('is-error');
  document.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
  successMessage.classList.add('is-hidden');
}

btnBack.addEventListener('click', async () => {
  resetUploadForm();
  await renderHomeState();
  showScreen('home');
});

uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile = file;
  filenameText.textContent = file.name;
  uploadContent.classList.add('is-hidden');
  uploadSelected.classList.remove('is-hidden');
  uploadArea.classList.remove('is-error');
  document.getElementById('error-file').textContent = '';
});

uploadCategoryOpts.forEach(option => {
  option.addEventListener('click', () => {
    uploadCategoryOpts.forEach(o => {
      o.classList.remove('is-selected');
      o.setAttribute('aria-checked', 'false');
    });
    option.classList.add('is-selected');
    option.setAttribute('aria-checked', 'true');
    selectedCategory = option.dataset.category;
    document.querySelector('.category-options')?.classList.remove('is-error');
    document.getElementById('error-category').textContent = '';
    // Auto-submit when category is chosen and name/file are already filled
    const nameReady = fileNameInput.value.trim().length > 0;
    const fileReady = !!editingFileId || !!selectedFile;
    if (nameReady && fileReady) uploadForm.requestSubmit();
  });
});

uploadForm.addEventListener('submit', async e => {
  e.preventDefault();
  let isValid = true;

  // Validar: arquivo (obrigatório apenas em modo criação)
  if (!editingFileId && !selectedFile) {
    uploadArea.classList.add('is-error');
    document.getElementById('error-file').textContent = 'Selecione um arquivo para continuar.';
    isValid = false;
  } else {
    uploadArea.classList.remove('is-error');
    document.getElementById('error-file').textContent = '';
  }

  // Validar: nome
  const displayName = fileNameInput.value.trim();
  const nameWrapper = fileNameInput.closest('.form-input-wrapper');
  if (!displayName) {
    nameWrapper?.classList.add('is-error');
    document.getElementById('error-name').textContent = 'O nome do arquivo é obrigatório.';
    isValid = false;
  } else {
    nameWrapper?.classList.remove('is-error');
    document.getElementById('error-name').textContent = '';
  }

  // Validar: categoria
  if (!selectedCategory) {
    document.querySelector('.category-options')?.classList.add('is-error');
    document.getElementById('error-category').textContent = 'Escolha uma categoria.';
    isValid = false;
  } else {
    document.querySelector('.category-options')?.classList.remove('is-error');
    document.getElementById('error-category').textContent = '';
  }

  if (!isValid) return;

  const targetCategory = selectedCategory;

  try {
    if (editingFileId) {
      const updatedData = {
        displayName,
        category: selectedCategory,
        tag: fileTagInput.value.trim(),
      };
      if (selectedFile) {
        updatedData.originalFileName = selectedFile.name;
        updatedData.fileType         = detectFileType(selectedFile);
        updatedData.mimeType         = selectedFile.type;
        updatedData.fileSize         = selectedFile.size;
        updatedData.blob             = selectedFile;
      }
      await updateFileRecord(editingFileId, updatedData);

    } else {
      await addFileRecord({
        displayName,
        originalFileName: selectedFile.name,
        fileType:         detectFileType(selectedFile),
        mimeType:         selectedFile.type,
        fileSize:         selectedFile.size,
        category:         selectedCategory,
        tag:              fileTagInput.value.trim(),
        blob:             selectedFile,
      });

    }

    successMessage.classList.remove('is-hidden');

    setTimeout(async () => {
      resetUploadForm();
      await renderHomeState();
      await openCategoryScreen(targetCategory);
    }, 1200);

  } catch (err) {
    console.error('[Cadê?] Erro ao salvar arquivo:', err);
    document.getElementById('error-file').textContent = 'Erro ao salvar o arquivo. Tente novamente.';

  }
});

// ══════════════════════════════════════════════
//  TELA 3: VISUALIZAÇÃO POR CATEGORIA
// ══════════════════════════════════════════════

let currentCategoryView = 'pessoal';

const categoryNameDisplay  = document.getElementById('category-name-display');
const categorySummaryIcon  = document.getElementById('category-summary-icon');
const categorySummaryLabel = document.getElementById('category-summary-label');
const categorySummaryCount = document.getElementById('category-summary-count');
const categoryFilterInput  = document.getElementById('category-filter-input');
const sortSelect           = document.getElementById('sort-select');
const fileList             = document.getElementById('file-list');
const emptyFilterState     = document.getElementById('empty-filter-state');
const btnCategoryBack      = document.getElementById('btn-category-back');
const btnAddNew            = document.getElementById('btn-add-new');

btnCategoryBack.addEventListener('click', async () => {
  await renderHomeState();
  showScreen('home');
});

btnAddNew.addEventListener('click', () => openCreateMode());

categoryFilterInput.addEventListener('input', () => renderCategoryFiles());
sortSelect.addEventListener('change', () => renderCategoryFiles());

async function openCategoryScreen(category) {
  currentCategoryView       = category || 'pessoal';
  categoryFilterInput.value = '';
  sortSelect.value          = 'recent';
  showScreen('category');
  await renderCategoryFiles();
}

async function renderCategoryFiles() {
  try {
    const cat      = CATEGORIES[currentCategoryView] || { label: currentCategoryView, icon: '📁' };
    const query    = categoryFilterInput.value.trim().toLowerCase();
    const order    = sortSelect.value;
    const allFiles = await getAllFileRecords();
    const allInCat = allFiles.filter(f => f.category === currentCategoryView);
    let   files    = [...allInCat];

    if (query) {
      files = files.filter(f =>
        f.displayName.toLowerCase().includes(query)                            ||
        (f.originalFileName || '').toLowerCase().includes(query)               ||
        f.fileType.toLowerCase().includes(query)                               ||
        (CATEGORIES[f.category]?.label || '').toLowerCase().includes(query)    ||
        (f.tag || '').toLowerCase().includes(query)
      );
    }

    if (order === 'name') {
      files.sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
    } else if (order === 'type') {
      files.sort((a, b) => a.fileType.localeCompare(b.fileType, 'pt-BR'));
    } else {
      files.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }

    categoryNameDisplay.textContent  = cat.label;
    categorySummaryIcon.textContent  = cat.icon;
    categorySummaryLabel.textContent = cat.label;
    const total = allInCat.length;
    categorySummaryCount.textContent = total === 1 ? '1 arquivo' : `${total} arquivos`;

    if (files.length === 0) {
      fileList.innerHTML = '';
      emptyFilterState.classList.remove('is-hidden');
      const titleEl    = emptyFilterState.querySelector('.empty-filter-state__title');
      const subtitleEl = emptyFilterState.querySelector('.empty-filter-state__subtitle');
      if (total === 0 && !query) {
        titleEl.textContent    = 'Nenhum arquivo nesta categoria';
        subtitleEl.textContent = 'Adicione um novo arquivo para começar';
      } else {
        titleEl.textContent    = 'Nenhum arquivo encontrado nesta categoria';
        subtitleEl.textContent = 'Tente buscar por outro nome, tipo ou etiqueta';
      }
    } else {
      emptyFilterState.classList.add('is-hidden');
      fileList.innerHTML = files.map(buildFileCardHTML).join('');
    }
  } catch (err) {
    console.error('[Cadê?] Erro ao renderizar categoria:', err);
  }
}

function buildFileCardHTML(file) {
  const cat       = CATEGORIES[file.category] || { label: file.category, icon: '📁' };
  const typeClass = `file-card__type-badge--${escapeHTML(file.fileType)}`;
  const typeLabel = file.fileType.toUpperCase();
  const dateStr   = formatDate(file.updatedAt || file.createdAt);
  const sizeStr   = formatFileSize(file.fileSize);
  const tagHTML   = file.tag
    ? `<div class="file-meta__item">
         <span class="file-meta__label">Etiqueta:</span>
         <span class="file-tag">${escapeHTML(file.tag)}</span>
       </div>`
    : '';
  const sizeHTML  = sizeStr
    ? `<div class="file-meta__item">
         <span class="file-meta__label">Tamanho:</span>
         <span class="file-meta__value">${escapeHTML(sizeStr)}</span>
       </div>`
    : '';

  return `
    <article class="file-card" role="listitem" data-id="${escapeHTML(file.id)}">
      <div class="file-card__header">
        <span class="file-card__type-badge ${typeClass}">${escapeHTML(typeLabel)}</span>
        <time class="file-card__date">${escapeHTML(dateStr)}</time>
      </div>
      <h3 class="file-card__name">${escapeHTML(file.displayName)}</h3>
      <div class="file-meta">
        <div class="file-meta__item">
          <span class="file-meta__label">Categoria:</span>
          <span class="file-meta__value">${escapeHTML(cat.icon)} ${escapeHTML(cat.label)}</span>
        </div>
        ${tagHTML}
        ${sizeHTML}
      </div>
      <div class="card-actions">
        <button type="button" class="btn-open-file" data-id="${escapeHTML(file.id)}"
          aria-label="Abrir ${escapeHTML(file.displayName)}">Abrir →</button>
        <button type="button" class="btn-edit-file" data-id="${escapeHTML(file.id)}"
          aria-label="Editar ${escapeHTML(file.displayName)}">Editar</button>
        <button type="button" class="btn-delete-file" data-id="${escapeHTML(file.id)}"
          aria-label="Excluir ${escapeHTML(file.displayName)}">Excluir</button>
      </div>
    </article>`;
}

// Event delegation — Tela 3
fileList.addEventListener('click', async e => {
  const openBtn   = e.target.closest('.btn-open-file');
  const editBtn   = e.target.closest('.btn-edit-file');
  const deleteBtn = e.target.closest('.btn-delete-file');
  if (openBtn)   await openStoredFile(openBtn.dataset.id);
  if (editBtn)   await openEditMode(editBtn.dataset.id);
  if (deleteBtn) await openDeleteConfirm(deleteBtn.dataset.id, 'category');
});

// ══════════════════════════════════════════════
//  TELA 4: RESULTADO DA BUSCA
// ══════════════════════════════════════════════

const resultsSearchForm  = document.getElementById('results-search-form');
const resultsSearchInput = document.getElementById('results-search-input');
const resultsFeedback    = document.getElementById('results-feedback');
const resultsTermDisplay = document.getElementById('results-term-display');
const searchResultsList  = document.getElementById('search-results-list');
const emptyResultsState  = document.getElementById('empty-results-state');
const btnSearchBack      = document.getElementById('btn-search-back');

btnSearchBack.addEventListener('click', async () => {
  await renderHomeState();
  showScreen('home');
});

resultsSearchForm.addEventListener('submit', e => {
  e.preventDefault();
  renderSearchResults(resultsSearchInput.value.trim());
});

async function openSearchResultsScreen(query) {
  resultsSearchInput.value = query || '';
  showScreen('searchResults');
  await renderSearchResults(query);
}

async function renderSearchResults(term) {
  try {
    const query   = (term || '').toLowerCase().trim();
    const allFiles = await getAllFileRecords();
    let results   = query
      ? allFiles.filter(f =>
          f.displayName.toLowerCase().includes(query)                          ||
          (f.originalFileName || '').toLowerCase().includes(query)             ||
          f.fileType.toLowerCase().includes(query)                             ||
          (CATEGORIES[f.category]?.label || '').toLowerCase().includes(query)  ||
          (f.tag || '').toLowerCase().includes(query)
        )
      : [...allFiles];

    if (query && results.length > 0) {
      resultsTermDisplay.textContent = term;
      resultsFeedback.classList.remove('is-hidden');
    } else {
      resultsFeedback.classList.add('is-hidden');
    }

    if (results.length === 0) {
      searchResultsList.innerHTML = '';
      emptyResultsState.classList.remove('is-hidden');
    } else {
      emptyResultsState.classList.add('is-hidden');
      searchResultsList.innerHTML = results.map(buildResultCardHTML).join('');
    }
  } catch (err) {
    console.error('[Cadê?] Erro ao buscar arquivos:', err);
  }
}

function buildResultCardHTML(file) {
  const cat       = CATEGORIES[file.category] || { label: file.category, icon: '📁' };
  const typeClass = `result-card__type-badge--${escapeHTML(file.fileType)}`;
  const typeLabel = file.fileType.toUpperCase();
  const dateStr   = formatDate(file.updatedAt || file.createdAt);
  const sizeStr   = formatFileSize(file.fileSize);
  const tagHTML   = file.tag
    ? `<div class="result-meta__item">
         <span class="result-meta__label">Etiqueta:</span>
         <span class="result-tag">${escapeHTML(file.tag)}</span>
       </div>`
    : '';
  const sizeHTML  = sizeStr
    ? `<div class="result-meta__item">
         <span class="result-meta__label">Tamanho:</span>
         <span class="result-meta__value">${escapeHTML(sizeStr)}</span>
       </div>`
    : '';

  return `
    <article class="result-card" role="listitem" data-id="${escapeHTML(file.id)}" data-categoria="${escapeHTML(file.category)}">
      <div class="result-card__header">
        <span class="result-card__type-badge ${typeClass}">${escapeHTML(typeLabel)}</span>
        <time class="result-card__date">${escapeHTML(dateStr)}</time>
      </div>
      <h3 class="result-card__name">${escapeHTML(file.displayName)}</h3>
      <div class="result-meta">
        <div class="result-meta__item">
          <span class="result-meta__label">Categoria:</span>
          <span class="result-meta__value">${escapeHTML(cat.icon)} ${escapeHTML(cat.label)}</span>
        </div>
        ${tagHTML}
        ${sizeHTML}
      </div>
      <div class="result-actions">
        <button type="button" class="btn-open-result" data-id="${escapeHTML(file.id)}"
          aria-label="Abrir ${escapeHTML(file.displayName)}">Abrir →</button>
        <button type="button" class="btn-ver-categoria" data-id="${escapeHTML(file.id)}" data-category="${escapeHTML(file.category)}"
          aria-label="Ver arquivos de ${escapeHTML(cat.label)}">Ver categoria</button>
        <button type="button" class="btn-edit-result" data-id="${escapeHTML(file.id)}"
          aria-label="Editar ${escapeHTML(file.displayName)}">Editar</button>
        <button type="button" class="btn-delete-result" data-id="${escapeHTML(file.id)}"
          aria-label="Excluir ${escapeHTML(file.displayName)}">Excluir</button>
      </div>
    </article>`;
}

// Event delegation — Tela 4
searchResultsList.addEventListener('click', async e => {
  const openBtn   = e.target.closest('.btn-open-result');
  const catBtn    = e.target.closest('.btn-ver-categoria');
  const editBtn   = e.target.closest('.btn-edit-result');
  const deleteBtn = e.target.closest('.btn-delete-result');
  if (openBtn)   await openStoredFile(openBtn.dataset.id);
  if (catBtn)    await openCategoryScreen(catBtn.dataset.category);
  if (editBtn)   await openEditMode(editBtn.dataset.id);
  if (deleteBtn) await openDeleteConfirm(deleteBtn.dataset.id, 'search');
});

// ══════════════════════════════════════════════
//  MODAL DE EXCLUSÃO
// ══════════════════════════════════════════════

const deleteModal      = document.getElementById('delete-modal');
const deleteModalName  = document.getElementById('delete-modal-name');
const btnDeleteConfirm = document.getElementById('btn-delete-confirm');
const btnDeleteCancel  = document.getElementById('btn-delete-cancel');

let pendingDeleteId      = null;
let pendingDeleteContext = null;

async function openDeleteConfirm(id, context) {
  try {
    const file = await getFileRecordById(id);
    if (!file) return;
    pendingDeleteId      = id;
    pendingDeleteContext = context;
    deleteModalName.textContent = file.displayName;
    deleteModal.classList.remove('is-hidden');
  } catch (err) {
    console.error('[Cadê?] Erro ao abrir confirmação de exclusão:', err);
  }
}

btnDeleteCancel.addEventListener('click', () => {
  pendingDeleteId      = null;
  pendingDeleteContext = null;
  deleteModal.classList.add('is-hidden');
});

btnDeleteConfirm.addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  try {
    await deleteFileRecord(pendingDeleteId);
    deleteModal.classList.add('is-hidden');
    await renderHomeState();
    if (pendingDeleteContext === 'search') {
      await renderSearchResults(resultsSearchInput.value.trim());
    } else {
      await renderCategoryFiles();
    }
  } catch (err) {
    console.error('[Cadê?] Erro ao excluir arquivo:', err);
    deleteModal.classList.add('is-hidden');
  } finally {
    pendingDeleteId      = null;
    pendingDeleteContext = null;
  }
});

deleteModal.addEventListener('click', e => {
  if (e.target === deleteModal) btnDeleteCancel.click();
});

// ══════════════════════════════════════════════
//  INICIALIZAÇÃO
// ══════════════════════════════════════════════

async function init() {
  try {
    await openDatabase();
    await renderHomeState();
    console.log('[Cadê?] IndexedDB inicializado com sucesso.');
  } catch (err) {
    console.error('[Cadê?] Erro ao inicializar banco de dados:', err);
  }
}

init();
