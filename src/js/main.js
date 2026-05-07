/* ============================================
   main.js — Lógica do protótipo Cadê?
   ============================================ */

console.log('[Cadê?] Protótipo carregado com sucesso.');

// ─── Tela Inicial ────────────────────────────
const screenHome    = document.querySelector('.screen-home');
const btnAddFile    = document.getElementById('btn-add-file');
const searchInput   = document.getElementById('search-input');
const categoryCards = document.querySelectorAll('.category-card');

// ─── Tela 2: Upload e Nomeação ───────────────
const uploadScreen         = document.getElementById('upload-screen');
const uploadArea           = document.getElementById('upload-area');
const uploadInput          = document.getElementById('upload-input');
const uploadContent        = document.getElementById('upload-content');
const uploadSelected       = document.getElementById('upload-selected');
const filenameText         = document.getElementById('filename-text');
const fileNameInput        = document.getElementById('file-name');
const fileTagInput         = document.getElementById('file-tag');
const uploadCategoryOpts   = document.querySelectorAll('.category-option');
const btnSave              = document.getElementById('btn-save');
const btnBack              = document.getElementById('btn-back');
const successMessage       = document.getElementById('success-message');

let selectedFile     = null;
let selectedCategory = null;

// ─── Navegação entre telas ────────────────────
function showUploadScreen() {
  screenHome.classList.add('is-hidden');
  uploadScreen.classList.remove('is-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHomeScreen() {
  uploadScreen.classList.add('is-hidden');
  screenHome.classList.remove('is-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Botão: Adicionar arquivo ─────────────────
btnAddFile.addEventListener('click', () => {
  console.log('[Cadê?] Navegando para a Tela de Upload.');
  showUploadScreen();
});

// ─── Botão: Voltar ────────────────────────────
btnBack.addEventListener('click', () => {
  console.log('[Cadê?] Voltando para a Tela Inicial.');
  resetUploadForm();
  showHomeScreen();
});

// ─── Arquivo selecionado ──────────────────────
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

// ─── Seleção de categoria ─────────────────────
uploadCategoryOpts.forEach((option) => {
  option.addEventListener('click', () => {
    uploadCategoryOpts.forEach((o) => {
      o.classList.remove('is-selected');
      o.setAttribute('aria-checked', 'false');
    });
    option.classList.add('is-selected');
    option.setAttribute('aria-checked', 'true');
    selectedCategory = option.dataset.category;

    const categoryOptionsEl = document.querySelector('.category-options');
    if (categoryOptionsEl) categoryOptionsEl.classList.remove('is-error');

    console.log(`[Cadê?] Categoria escolhida: "${selectedCategory}"`);
  });
});

// ─── Salvar arquivo ───────────────────────────
btnSave.addEventListener('click', () => {
  const fileName = fileNameInput.value.trim();
  const fileTag  = fileTagInput.value.trim();
  let   isValid  = true;

  // Valida: arquivo
  if (!selectedFile) {
    uploadArea.classList.add('is-error');
    console.warn('[Cadê?] Campo obrigatório ausente: arquivo não selecionado.');
    isValid = false;
  }

  // Valida: nome
  const fileNameWrapper = fileNameInput.closest('.form-input-wrapper');
  if (!fileName) {
    if (fileNameWrapper) fileNameWrapper.classList.add('is-error');
    console.warn('[Cadê?] Campo obrigatório ausente: nome do arquivo.');
    isValid = false;
  } else {
    if (fileNameWrapper) fileNameWrapper.classList.remove('is-error');
  }

  // Valida: categoria
  const categoryOptionsEl = document.querySelector('.category-options');
  if (!selectedCategory) {
    if (categoryOptionsEl) categoryOptionsEl.classList.add('is-error');
    console.warn('[Cadê?] Campo obrigatório ausente: categoria não selecionada.');
    isValid = false;
  }

  if (!isValid) {
    console.warn('[Cadê?] Formulário inválido. Preencha todos os campos obrigatórios.');
    return;
  }

  const uploadData = {
    nomeArquivo:     fileName,
    arquivoOriginal: selectedFile.name,
    categoria:       selectedCategory,
    etiqueta:        fileTag || null,
    dataUpload:      new Date().toLocaleString('pt-BR'),
  };

  console.log('[Cadê?] Arquivo salvo com sucesso:', uploadData);
  successMessage.classList.remove('is-hidden');
  btnSave.disabled = true;
  btnSave.textContent = 'Arquivo salvo ✓';
});

// ─── Limpar formulário ────────────────────────
function resetUploadForm() {
  selectedFile     = null;
  selectedCategory = null;

  uploadInput.value    = '';
  fileNameInput.value  = '';
  fileTagInput.value   = '';
  filenameText.textContent = '';

  uploadContent.classList.remove('is-hidden');
  uploadSelected.classList.add('is-hidden');

  uploadCategoryOpts.forEach((o) => {
    o.classList.remove('is-selected');
    o.setAttribute('aria-checked', 'false');
  });

  uploadArea.classList.remove('is-error');

  const fileNameWrapper = fileNameInput.closest('.form-input-wrapper');
  if (fileNameWrapper) fileNameWrapper.classList.remove('is-error');

  const categoryOptionsEl = document.querySelector('.category-options');
  if (categoryOptionsEl) categoryOptionsEl.classList.remove('is-error');

  successMessage.classList.add('is-hidden');
  btnSave.disabled = false;
  btnSave.textContent = 'Salvar arquivo';
}

// ─── Busca: digitação em tempo real ───────────
searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim();
  console.log(`[Cadê?] Busca digitada: "${query}"`);
  // TODO: filtrar lista de arquivos na próxima iteração
});

// ─── Busca: envio via Enter ────────────────────
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const query = event.target.value.trim();
    console.log(`[Cadê?] Busca enviada: "${query}"`);
    // TODO: executar busca completa na próxima iteração
  }
});

// ─── Categorias: clique (Tela Inicial) ───────
categoryCards.forEach((card) => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    console.log(`[Cadê?] Categoria selecionada: "${category}"`);
    // TODO: navegar para tela de categoria na próxima iteração
  });
});
