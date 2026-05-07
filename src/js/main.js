/* ============================================
   main.js — Lógica do protótipo Cadê?
   ============================================ */

console.log('[Cadê?] Protótipo carregado com sucesso.');

// ─── Mapa de categorias ───────────────────────
const CATEGORIES = {
  pessoal:   { label: 'Pessoal',   icon: '🏠' },
  academico: { label: 'Acadêmico', icon: '🎓' },
  trabalho:  { label: 'Trabalho',  icon: '💼' },
};

// ─── Arquivos simulados ───────────────────────
let simulatedFiles = [
  {
    id: 1,
    nome: 'Comprovante de residência 2026',
    tipo: 'pdf',
    categoria: 'pessoal',
    etiqueta: 'Comprovante',
    data: '06/05/2026',
    timestamp: Date.parse('2026-05-06'),
  },
  {
    id: 2,
    nome: 'CNH digital',
    tipo: 'imagem',
    categoria: 'pessoal',
    etiqueta: 'CNH',
    data: '05/05/2026',
    timestamp: Date.parse('2026-05-05'),
  },
  {
    id: 3,
    nome: 'Contrato de aluguel',
    tipo: 'docx',
    categoria: 'pessoal',
    etiqueta: 'Contrato',
    data: '02/05/2026',
    timestamp: Date.parse('2026-05-02'),
  },
  {
    id: 4,
    nome: 'Currículo Bruna 2026',
    tipo: 'pdf',
    categoria: 'trabalho',
    etiqueta: 'Currículo',
    data: '06/05/2026',
    timestamp: Date.parse('2026-05-06'),
  },
  {
    id: 5,
    nome: 'Currículo atualizado tecnologia',
    tipo: 'docx',
    categoria: 'trabalho',
    etiqueta: 'Currículo',
    data: '04/05/2026',
    timestamp: Date.parse('2026-05-04'),
  },
  {
    id: 6,
    nome: 'Modelo de currículo acadêmico',
    tipo: 'pdf',
    categoria: 'academico',
    etiqueta: 'Currículo',
    data: '28/04/2026',
    timestamp: Date.parse('2026-04-28'),
  },
];

let nextFileId = 7;

// ─── Referências: telas ───────────────────────
const screenHome          = document.querySelector('.screen-home');
const uploadScreen        = document.getElementById('upload-screen');
const categoryScreen      = document.getElementById('category-screen');
const searchResultsScreen = document.getElementById('search-results-screen');

// ─── Referências: Tela Inicial ────────────────
const btnAddFile    = document.getElementById('btn-add-file');
const searchInput   = document.getElementById('search-input');
const categoryCards = document.querySelectorAll('.category-card');

// ─── Referências: Tela 2 ─────────────────────
const uploadArea         = document.getElementById('upload-area');
const uploadInput        = document.getElementById('upload-input');
const uploadContent      = document.getElementById('upload-content');
const uploadSelected     = document.getElementById('upload-selected');
const filenameText       = document.getElementById('filename-text');
const fileNameInput      = document.getElementById('file-name');
const fileTagInput       = document.getElementById('file-tag');
const uploadCategoryOpts = document.querySelectorAll('.category-option');
const btnSave            = document.getElementById('btn-save');
const btnBack            = document.getElementById('btn-back');
const successMessage     = document.getElementById('success-message');

// ─── Referências: Tela 3 ─────────────────────
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

// ─── Referências: Tela 4 ─────────────────────
const resultsSearchForm  = document.getElementById('results-search-form');
const resultsSearchInput = document.getElementById('results-search-input');
const resultsFeedback    = document.getElementById('results-feedback');
const resultsTermDisplay = document.getElementById('results-term-display');
const searchResultsList  = document.getElementById('search-results-list');
const emptyResultsState  = document.getElementById('empty-results-state');
const btnSearchBack      = document.getElementById('btn-search-back');

// ─── Estado da aplicação ──────────────────────
let selectedFile        = null;
let selectedCategory    = null;
let currentCategoryView = 'pessoal';

// ════════════════════════════════════════════════
//  NAVEGAÇÃO
// ════════════════════════════════════════════════

const SCREENS = {
  home:          screenHome,
  upload:        uploadScreen,
  category:      categoryScreen,
  searchResults: searchResultsScreen,
};

function showScreen(name) {
  Object.values(SCREENS).forEach((s) => s.classList.add('is-hidden'));
  SCREENS[name].classList.remove('is-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ════════════════════════════════════════════════
//  TELA INICIAL
// ════════════════════════════════════════════════

btnAddFile.addEventListener('click', () => {
  console.log('[Cadê?] Navegando para a Tela de Upload.');
  showScreen('upload');
});

searchInput.addEventListener('input', (e) => {
  console.log(`[Cadê?] Busca digitada: "${e.target.value.trim()}"`);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim();
    if (query) {
      console.log(`[Cadê?] Busca enviada: "${query}"`);
      openSearchResultsScreen(query);
    }
  }
});

categoryCards.forEach((card) => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    console.log(`[Cadê?] Abrindo categoria: "${category}"`);
    openCategoryScreen(category);
  });
});

// ════════════════════════════════════════════════
//  TELA 2: UPLOAD E NOMEAÇÃO
// ════════════════════════════════════════════════

btnBack.addEventListener('click', () => {
  console.log('[Cadê?] Voltando para a Tela Inicial.');
  resetUploadForm();
  showScreen('home');
});

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile = file;
  filenameText.textContent = file.name;
  uploadContent.classList.add('is-hidden');
  uploadSelected.classList.remove('is-hidden');
  uploadArea.classList.remove('is-error');
  console.log(`[Cadê?] Arquivo selecionado: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
});

uploadCategoryOpts.forEach((option) => {
  option.addEventListener('click', () => {
    uploadCategoryOpts.forEach((o) => {
      o.classList.remove('is-selected');
      o.setAttribute('aria-checked', 'false');
    });
    option.classList.add('is-selected');
    option.setAttribute('aria-checked', 'true');
    selectedCategory = option.dataset.category;
    document.querySelector('.category-options')?.classList.remove('is-error');
    console.log(`[Cadê?] Categoria escolhida: "${selectedCategory}"`);
  });
});

btnSave.addEventListener('click', () => {
  const fileName = fileNameInput.value.trim();
  const fileTag  = fileTagInput.value.trim();
  let   isValid  = true;

  if (!selectedFile) {
    uploadArea.classList.add('is-error');
    console.warn('[Cadê?] Campo obrigatório ausente: arquivo não selecionado.');
    isValid = false;
  }

  const fileNameWrapper = fileNameInput.closest('.form-input-wrapper');
  if (!fileName) {
    fileNameWrapper?.classList.add('is-error');
    console.warn('[Cadê?] Campo obrigatório ausente: nome do arquivo.');
    isValid = false;
  } else {
    fileNameWrapper?.classList.remove('is-error');
  }

  const categoryOptionsEl = document.querySelector('.category-options');
  if (!selectedCategory) {
    categoryOptionsEl?.classList.add('is-error');
    console.warn('[Cadê?] Campo obrigatório ausente: categoria não selecionada.');
    isValid = false;
  }

  if (!isValid) {
    console.warn('[Cadê?] Formulário inválido. Preencha todos os campos obrigatórios.');
    return;
  }

  const now     = new Date();
  const newFile = {
    id:        nextFileId++,
    nome:      fileName,
    tipo:      detectFileType(selectedFile.name),
    categoria: selectedCategory,
    etiqueta:  fileTag || null,
    data:      now.toLocaleDateString('pt-BR'),
    timestamp: now.getTime(),
  };

  simulatedFiles.unshift(newFile);

  const uploadData = {
    nomeArquivo:     fileName,
    arquivoOriginal: selectedFile.name,
    categoria:       selectedCategory,
    etiqueta:        fileTag || null,
    dataUpload:      now.toLocaleString('pt-BR'),
  };

  console.log('[Cadê?] Arquivo salvo com sucesso:', uploadData);

  successMessage.classList.remove('is-hidden');
  btnSave.disabled = true;
  btnSave.textContent = 'Arquivo salvo ✓';

  setTimeout(() => {
    resetUploadForm();
    openCategoryScreen(newFile.categoria);
  }, 1500);
});

function resetUploadForm() {
  selectedFile     = null;
  selectedCategory = null;

  uploadInput.value        = '';
  fileNameInput.value      = '';
  fileTagInput.value       = '';
  filenameText.textContent = '';

  uploadContent.classList.remove('is-hidden');
  uploadSelected.classList.add('is-hidden');

  uploadCategoryOpts.forEach((o) => {
    o.classList.remove('is-selected');
    o.setAttribute('aria-checked', 'false');
  });

  uploadArea.classList.remove('is-error');
  fileNameInput.closest('.form-input-wrapper')?.classList.remove('is-error');
  document.querySelector('.category-options')?.classList.remove('is-error');

  successMessage.classList.add('is-hidden');
  btnSave.disabled = false;
  btnSave.textContent = 'Salvar arquivo';
}

function detectFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    pdf:  'pdf',
    png: 'imagem', jpg: 'imagem', jpeg: 'imagem',
    gif: 'imagem', webp: 'imagem', svg: 'imagem',
    doc: 'docx', docx: 'docx',
    xls: 'xlsx', xlsx: 'xlsx',
    ppt: 'pptx', pptx: 'pptx',
    txt: 'txt',
  };
  return map[ext] || ext || 'arquivo';
}

// ════════════════════════════════════════════════
//  TELA 3: VISUALIZAÇÃO POR CATEGORIA
// ════════════════════════════════════════════════

btnCategoryBack.addEventListener('click', () => {
  console.log('[Cadê?] Voltando para a Tela Inicial.');
  showScreen('home');
});

btnAddNew.addEventListener('click', () => {
  console.log('[Cadê?] Abrindo Tela de Upload a partir da Tela 3.');
  showScreen('upload');
});

categoryFilterInput.addEventListener('input', () => {
  renderFileCards(getFilteredAndSortedFiles());
});

sortSelect.addEventListener('change', () => {
  console.log(`[Cadê?] Ordenação alterada para: "${sortSelect.value}"`);
  renderFileCards(getFilteredAndSortedFiles());
});

function openCategoryScreen(category) {
  currentCategoryView = category || 'pessoal';
  categoryFilterInput.value = '';
  sortSelect.value = 'recent';
  updateCategorySummary();
  renderFileCards(getFilteredAndSortedFiles());
  showScreen('category');
}

function updateCategorySummary() {
  const cat   = CATEGORIES[currentCategoryView] || { label: currentCategoryView, icon: '📁' };
  const total = simulatedFiles.filter((f) => f.categoria === currentCategoryView).length;
  const label = total === 1 ? '1 arquivo' : `${total} arquivos`;

  categoryNameDisplay.textContent  = cat.label;
  categorySummaryIcon.textContent  = cat.icon;
  categorySummaryLabel.textContent = cat.label;
  categorySummaryCount.textContent = label;
}

function getFilteredAndSortedFiles() {
  const query = categoryFilterInput.value.trim().toLowerCase();
  const order = sortSelect.value;

  let files = simulatedFiles.filter((f) => f.categoria === currentCategoryView);

  if (query) {
    files = files.filter((f) =>
      f.nome.toLowerCase().includes(query)             ||
      f.tipo.toLowerCase().includes(query)             ||
      (f.etiqueta || '').toLowerCase().includes(query) ||
      (CATEGORIES[f.categoria]?.label || '').toLowerCase().includes(query)
    );
  }

  if (order === 'name') {
    files.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  } else if (order === 'type') {
    files.sort((a, b) => a.tipo.localeCompare(b.tipo, 'pt-BR'));
  } else {
    files.sort((a, b) => b.timestamp - a.timestamp);
  }

  return files;
}

function renderFileCards(files) {
  if (files.length === 0) {
    fileList.innerHTML = '';
    emptyFilterState.classList.remove('is-hidden');
    return;
  }

  emptyFilterState.classList.add('is-hidden');
  fileList.innerHTML = files.map(buildFileCardHTML).join('');

  fileList.querySelectorAll('.btn-open-file').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.closest('.file-card').querySelector('.file-card__name').textContent;
      console.log(`[Cadê?] Abrir arquivo: "${name}" (protótipo — sem ação real)`);
    });
  });
}

function buildFileCardHTML(file) {
  const cat       = CATEGORIES[file.categoria] || { label: file.categoria, icon: '📁' };
  const typeClass = `file-card__type-badge--${escapeHTML(file.tipo)}`;
  const typeLabel = file.tipo.toUpperCase();
  const tagHTML   = file.etiqueta
    ? `<div class="file-meta__item">
         <span class="file-meta__label">Etiqueta:</span>
         <span class="file-tag">${escapeHTML(file.etiqueta)}</span>
       </div>`
    : '';

  return `
    <article class="file-card" role="listitem" data-id="${file.id}">
      <div class="file-card__header">
        <span class="file-card__type-badge ${typeClass}">${escapeHTML(typeLabel)}</span>
        <time class="file-card__date">${escapeHTML(file.data)}</time>
      </div>
      <h3 class="file-card__name">${escapeHTML(file.nome)}</h3>
      <div class="file-meta">
        <div class="file-meta__item">
          <span class="file-meta__label">Categoria:</span>
          <span class="file-meta__value">${escapeHTML(cat.icon)} ${escapeHTML(cat.label)}</span>
        </div>
        ${tagHTML}
      </div>
      <button type="button" class="btn-open-file" aria-label="Abrir arquivo ${escapeHTML(file.nome)}">
        Abrir arquivo →
      </button>
    </article>
  `;
}

// ════════════════════════════════════════════════
//  TELA 4: RESULTADO DA BUSCA
// ════════════════════════════════════════════════

btnSearchBack.addEventListener('click', () => {
  console.log('[Cadê?] Voltando para a Tela Inicial.');
  showScreen('home');
});

resultsSearchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = resultsSearchInput.value.trim();
  console.log(`[Cadê?] Nova busca na Tela 4: "${query}"`);
  runSearch();
});

// Delegação de eventos nos cards de resultado
searchResultsList.addEventListener('click', (e) => {
  const openBtn = e.target.closest('.btn-open-result');
  const catBtn  = e.target.closest('.btn-ver-categoria');

  if (openBtn) {
    const name = openBtn.closest('.result-card').querySelector('.result-card__name').textContent;
    console.log(`[Cadê?] Abrir arquivo: "${name}" (protótipo — sem ação real)`);
  }

  if (catBtn) {
    const card     = catBtn.closest('.result-card');
    const category = card.dataset.categoria;
    console.log(`[Cadê?] Ver categoria: "${CATEGORIES[category]?.label || category}"`);
    openCategoryScreen(category);
  }
});

function openSearchResultsScreen(query) {
  resultsSearchInput.value = query || '';
  runSearch();
  showScreen('searchResults');
}

function runSearch() {
  const raw   = resultsSearchInput.value.trim();
  const query = raw.toLowerCase();

  let files = query
    ? simulatedFiles.filter((f) =>
        f.nome.toLowerCase().includes(query)             ||
        f.tipo.toLowerCase().includes(query)             ||
        (f.etiqueta || '').toLowerCase().includes(query) ||
        (CATEGORIES[f.categoria]?.label || '').toLowerCase().includes(query)
      )
    : [...simulatedFiles];

  // Feedback: visível apenas quando há query E resultados
  if (query && files.length > 0) {
    resultsTermDisplay.textContent = raw;
    resultsFeedback.classList.remove('is-hidden');
  } else {
    resultsFeedback.classList.add('is-hidden');
  }

  if (query && files.length === 0) {
    searchResultsList.innerHTML = '';
    emptyResultsState.classList.remove('is-hidden');
  } else {
    emptyResultsState.classList.add('is-hidden');
    searchResultsList.innerHTML = files.map(buildResultCardHTML).join('');
  }
}

function buildResultCardHTML(file) {
  const cat       = CATEGORIES[file.categoria] || { label: file.categoria, icon: '📁' };
  const typeClass = `result-card__type-badge--${escapeHTML(file.tipo)}`;
  const typeLabel = file.tipo.toUpperCase();
  const tagHTML   = file.etiqueta
    ? `<div class="result-meta__item">
         <span class="result-meta__label">Etiqueta:</span>
         <span class="result-tag">${escapeHTML(file.etiqueta)}</span>
       </div>`
    : '';

  return `
    <article class="result-card" role="listitem" data-id="${file.id}" data-categoria="${escapeHTML(file.categoria)}">
      <div class="result-card__header">
        <span class="result-card__type-badge ${typeClass}">${escapeHTML(typeLabel)}</span>
        <time class="result-card__date">${escapeHTML(file.data)}</time>
      </div>
      <h3 class="result-card__name">${escapeHTML(file.nome)}</h3>
      <div class="result-meta">
        <div class="result-meta__item">
          <span class="result-meta__label">Categoria:</span>
          <span class="result-meta__value">${escapeHTML(cat.icon)} ${escapeHTML(cat.label)}</span>
        </div>
        ${tagHTML}
      </div>
      <div class="result-actions">
        <button type="button" class="btn-open-result" aria-label="Abrir arquivo ${escapeHTML(file.nome)}">
          Abrir arquivo →
        </button>
        <button type="button" class="btn-ver-categoria" aria-label="Ver arquivos de ${escapeHTML(cat.label)}">
          Ver categoria
        </button>
      </div>
    </article>
  `;
}

// ─── Utilitário: escapar HTML ─────────────────
function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
