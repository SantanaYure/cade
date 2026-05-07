/* ============================================
   main.js — Lógica inicial do protótipo Cadê?
   ============================================ */

console.log('[Cadê?] Protótipo carregado com sucesso.');

// ─── Referências aos elementos ───────────────
const btnAddFile   = document.getElementById('btn-add-file');
const searchInput  = document.getElementById('search-input');
const categoryCards = document.querySelectorAll('.category-card');

// ─── Botão: Adicionar arquivo ─────────────────
btnAddFile.addEventListener('click', () => {
  console.log('[Cadê?] Botão "Adicionar arquivo" clicado.');
  // TODO: abrir modal ou tela de upload na próxima iteração
});

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

// ─── Categorias: clique ───────────────────────
categoryCards.forEach((card) => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    console.log(`[Cadê?] Categoria selecionada: "${category}"`);
    // TODO: navegar para tela de categoria na próxima iteração
  });
});
