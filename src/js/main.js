/* ============================================
   main.js — Lógica do protótipo Cadê?
   ============================================ */

console.log('[Cadê?] Protótipo carregado com sucesso.');

// ══════════════════════════════════════════════
//  CONFIGURAÇÃO
// ══════════════════════════════════════════════

const STORAGE_KEY = 'cade_files';

const CATEGORIES = {
  pessoal:   { label: 'Pessoal',   icon: '🏠' },
  academico: { label: 'Acadêmico', icon: '🎓' },
  trabalho:  { label: 'Trabalho',  icon: '💼' },
};

// ══════════════════════════════════════════════
//  CRUD — LocalStorage
// ══════════════════════════════════════════════

function getFiles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFiles(files) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

function createFile(fileData) {
  const files = getFiles();
  const now   = new Date().toISOString();
  const newFile = {
    id:               generateId(),
    displayName:      fileData.displayName.trim(),
    originalFileName: fileData.originalFileName,
    fileType:         fileData.fileType,
    category:         fileData.category,
    tag:              fileData.tag ? fileData.tag.trim() : '',
    createdAt:        now,
    updatedAt:        now,
  };
  files.unshift(newFile);
  saveFiles(files);
  console.log('[Cadê?] Arquivo criado:', newFile.displayName);
  return newFile;
}

function updateFile(id, updatedData) {
  const files = getFiles();
  const idx   = files.findIndex(f => f.id === id);
  if (idx === -1) return null;
  files[idx] = {
    ...files[idx],
    displayName: updatedData.displayName.trim(),
    category:    updatedData.category,
    tag:         updatedData.tag ? updatedData.tag.trim() : '',
    updatedAt:   new Date().toISOString(),
  };
  saveFiles(files);
  console.log('[Cadê?] Arquivo atualizado:', files[idx].displayName);
  return files[idx];
}

function deleteFile(id) {
  const files = getFiles().filter(f => f.id !== id);
  saveFiles(files);
  console.log('[Cadê?] Arquivo excluído:', id);
}

function getFileById(id) {
  return getFiles().find(f => f.id === id) || null;
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
  if (['doc', 'docx'].includes(ext) || mime.includes('word'))                                  return 'docx';
  if (['xls', 'xlsx'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) return 'xlsx';
  if (['ppt', 'pptx'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) return 'pptx';
  if (ext === 'txt' || mime === 'text/plain') return 'txt';
  return ext || 'arquivo';
}

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('pt-BR');
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

function renderHomeState() {
  const files = getFiles();
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
const btnSave               = document.getElementById('btn-save');
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
  btnSave.textContent             = 'Salvar arquivo';
  uploadAreaWrapper.classList.remove('is-hidden');
  editReferenceRow.classList.add('is-hidden');
  showScreen('upload');
}

function openEditMode(id) {
  const file = getFileById(id);
  if (!file) return;
  editingFileId = id;
  resetUploadForm();
  uploadIntroTitle.textContent    = 'Editar arquivo';
  uploadIntroSubtitle.textContent = 'Atualize as informações do arquivo';
  btnSave.textContent             = 'Salvar alterações';
  uploadAreaWrapper.classList.add('is-hidden');
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
  btnSave.disabled = false;
}

btnBack.addEventListener('click', () => {
  resetUploadForm();
  renderHomeState();
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
  });
});

btnSave.addEventListener('click', () => {
  let isValid = true;

  // Validar: arquivo (apenas em modo criação)
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

  if (editingFileId) {
    updateFile(editingFileId, {
      displayName,
      category: selectedCategory,
      tag: fileTagInput.value.trim(),
    });
    btnSave.textContent = 'Alterações salvas ✓';
  } else {
    createFile({
      displayName,
      originalFileName: selectedFile.name,
      fileType:         detectFileType(selectedFile),
      category:         selectedCategory,
      tag:              fileTagInput.value.trim(),
    });
    btnSave.textContent = 'Arquivo salvo ✓';
  }

  successMessage.classList.remove('is-hidden');
  btnSave.disabled = true;

  setTimeout(() => {
    resetUploadForm();
    renderHomeState();
    openCategoryScreen(targetCategory);
  }, 1200);
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

btnCategoryBack.addEventListener('click', () => {
  renderHomeState();
  showScreen('home');
});

btnAddNew.addEventListener('click', () => openCreateMode());

categoryFilterInput.addEventListener('input', () => renderCategoryFiles());
sortSelect.addEventListener('change', () => renderCategoryFiles());

function openCategoryScreen(category) {
  currentCategoryView       = category || 'pessoal';
  categoryFilterInput.value = '';
  sortSelect.value          = 'recent';
  renderCategoryFiles();
  showScreen('category');
}

function renderCategoryFiles() {
  const cat      = CATEGORIES[currentCategoryView] || { label: currentCategoryView, icon: '📁' };
  const query    = categoryFilterInput.value.trim().toLowerCase();
  const order    = sortSelect.value;
  const allInCat = getFiles().filter(f => f.category === currentCategoryView);
  let   files    = [...allInCat];

  if (query) {
    files = files.filter(f =>
      f.displayName.toLowerCase().includes(query)                              ||
      (f.originalFileName || '').toLowerCase().includes(query)                 ||
      f.fileType.toLowerCase().includes(query)                                 ||
      (CATEGORIES[f.category]?.label || '').toLowerCase().includes(query)      ||
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
}

function buildFileCardHTML(file) {
  const cat       = CATEGORIES[file.category] || { label: file.category, icon: '📁' };
  const typeClass = `file-card__type-badge--${escapeHTML(file.fileType)}`;
  const typeLabel = file.fileType.toUpperCase();
  const dateStr   = formatDate(file.updatedAt || file.createdAt);
  const tagHTML   = file.tag
    ? `<div class="file-meta__item">
         <span class="file-meta__label">Etiqueta:</span>
         <span class="file-tag">${escapeHTML(file.tag)}</span>
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
      </div>
      <div class="card-actions">
        <button type="button" class="btn-open-file" data-id="${escapeHTML(file.id)}"
          aria-label="Abrir arquivo ${escapeHTML(file.displayName)}">Abrir arquivo →</button>
        <button type="button" class="btn-edit-file" data-id="${escapeHTML(file.id)}"
          aria-label="Editar arquivo ${escapeHTML(file.displayName)}">Editar</button>
        <button type="button" class="btn-delete-file" data-id="${escapeHTML(file.id)}"
          aria-label="Excluir arquivo ${escapeHTML(file.displayName)}">Excluir</button>
      </div>
    </article>`;
}

// Event delegation — Tela 3
fileList.addEventListener('click', e => {
  const openBtn   = e.target.closest('.btn-open-file');
  const editBtn   = e.target.closest('.btn-edit-file');
  const deleteBtn = e.target.closest('.btn-delete-file');
  if (openBtn)   console.log(`[Cadê?] Abrir arquivo (protótipo): "${openBtn.closest('.file-card').querySelector('.file-card__name').textContent}"`);
  if (editBtn)   openEditMode(editBtn.dataset.id);
  if (deleteBtn) openDeleteConfirm(deleteBtn.dataset.id, 'category');
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

btnSearchBack.addEventListener('click', () => {
  renderHomeState();
  showScreen('home');
});

resultsSearchForm.addEventListener('submit', e => {
  e.preventDefault();
  renderSearchResults(resultsSearchInput.value.trim());
});

function openSearchResultsScreen(query) {
  resultsSearchInput.value = query || '';
  renderSearchResults(query);
  showScreen('searchResults');
}

function renderSearchResults(term) {
  const query = (term || '').toLowerCase().trim();
  const files = getFiles();
  let results = query
    ? files.filter(f =>
        f.displayName.toLowerCase().includes(query)                              ||
        (f.originalFileName || '').toLowerCase().includes(query)                 ||
        f.fileType.toLowerCase().includes(query)                                 ||
        (CATEGORIES[f.category]?.label || '').toLowerCase().includes(query)      ||
        (f.tag || '').toLowerCase().includes(query)
      )
    : [...files];

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
}

function buildResultCardHTML(file) {
  const cat       = CATEGORIES[file.category] || { label: file.category, icon: '📁' };
  const typeClass = `result-card__type-badge--${escapeHTML(file.fileType)}`;
  const typeLabel = file.fileType.toUpperCase();
  const dateStr   = formatDate(file.updatedAt || file.createdAt);
  const tagHTML   = file.tag
    ? `<div class="result-meta__item">
         <span class="result-meta__label">Etiqueta:</span>
         <span class="result-tag">${escapeHTML(file.tag)}</span>
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
      </div>
      <div class="result-actions">
        <button type="button" class="btn-open-result" data-id="${escapeHTML(file.id)}"
          aria-label="Abrir arquivo ${escapeHTML(file.displayName)}">Abrir arquivo →</button>
        <button type="button" class="btn-ver-categoria" data-id="${escapeHTML(file.id)}" data-category="${escapeHTML(file.category)}"
          aria-label="Ver arquivos de ${escapeHTML(cat.label)}">Ver categoria</button>
        <button type="button" class="btn-edit-result" data-id="${escapeHTML(file.id)}"
          aria-label="Editar arquivo ${escapeHTML(file.displayName)}">Editar</button>
        <button type="button" class="btn-delete-result" data-id="${escapeHTML(file.id)}"
          aria-label="Excluir arquivo ${escapeHTML(file.displayName)}">Excluir</button>
      </div>
    </article>`;
}

// Event delegation — Tela 4
searchResultsList.addEventListener('click', e => {
  const openBtn   = e.target.closest('.btn-open-result');
  const catBtn    = e.target.closest('.btn-ver-categoria');
  const editBtn   = e.target.closest('.btn-edit-result');
  const deleteBtn = e.target.closest('.btn-delete-result');
  if (openBtn)   console.log(`[Cadê?] Abrir arquivo (protótipo): "${openBtn.closest('.result-card').querySelector('.result-card__name').textContent}"`);
  if (catBtn)    openCategoryScreen(catBtn.dataset.category);
  if (editBtn)   openEditMode(editBtn.dataset.id);
  if (deleteBtn) openDeleteConfirm(deleteBtn.dataset.id, 'search');
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

function openDeleteConfirm(id, context) {
  const file = getFileById(id);
  if (!file) return;
  pendingDeleteId      = id;
  pendingDeleteContext = context;
  deleteModalName.textContent = file.displayName;
  deleteModal.classList.remove('is-hidden');
}

btnDeleteCancel.addEventListener('click', () => {
  pendingDeleteId      = null;
  pendingDeleteContext = null;
  deleteModal.classList.add('is-hidden');
});

btnDeleteConfirm.addEventListener('click', () => {
  if (!pendingDeleteId) return;
  deleteFile(pendingDeleteId);
  deleteModal.classList.add('is-hidden');
  renderHomeState();
  if (pendingDeleteContext === 'search') {
    renderSearchResults(resultsSearchInput.value.trim());
  } else {
    renderCategoryFiles();
  }
  pendingDeleteId      = null;
  pendingDeleteContext = null;
});

deleteModal.addEventListener('click', e => {
  if (e.target === deleteModal) btnDeleteCancel.click();
});

// ══════════════════════════════════════════════
//  INICIALIZAÇÃO
// ══════════════════════════════════════════════

renderHomeState();
