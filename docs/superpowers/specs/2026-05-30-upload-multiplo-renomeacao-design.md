# Upload múltiplo de arquivos com decisão de renomeação

**Data:** 2026-05-30
**Projeto:** protótipo `Cadê?` (SPA vanilla JS + IndexedDB)

## Objetivo

Permitir que o usuário selecione múltiplos arquivos de uma vez e, no momento do
envio, escolha se deseja renomear cada arquivo ou manter os nomes originais.

## Escopo

- **Mexe em:** fluxo de ADIÇÃO de arquivos (Tela 2 / `openAdd`).
- **Não mexe em:** edição (`openEdit`/form single-file), busca, telas de
  categoria, modal de exclusão, abertura/download, formato do registro e
  metadados existentes.

## Decisões (confirmadas com o usuário)

1. **Categoria por arquivo**, com um *default* de lote. A categoria clicada na
   Tela 2 é o gatilho de envio e também o default aplicado a todos. No caminho
   "Sim" o usuário pode trocar a categoria por arquivo na lista.
2. **Gatilho:** clicar numa categoria abre o modal "Deseja renomear seus
   arquivos?". (Preserva a interação atual de "categoria = enviar".)

## Fluxo

1. `+ Adicionar arquivo` → Tela 2. Input `#upload-input` ganha `multiple`; campo
   único `Nome do arquivo` fica oculto no modo adicionar.
2. Seleciona 1+ arquivos → área mostra "N arquivos selecionados".
3. Clica numa categoria (gatilho + default do lote) → modal **"Deseja renomear
   seus arquivos?"** (`Sim, renomear` / `Não, manter nomes originais`).
4. **Não** → salva todos com nomes originais + categoria escolhida. Painel de
   sucesso: "N arquivos adicionados".
5. **Sim** → modal de lista; cada linha: nome original (muted) · campo editável
   de **nome-base** · chip `.ext` fixo · seletor compacto de **categoria por
   arquivo** (pré-selecionado com o default). `Salvar arquivos` → salva o lote.

## Regras de nome / deduplicação

- Campo editável = só o nome-base; a extensão é um chip fixo → extensão sempre
  preservada.
- Campo vazio → fallback para o nome-base original.
- Dedup dentro do lote (case-insensitive sobre o nome final): colisões viram
  `arquivo`, `arquivo 1`, `arquivo 2`… (número inserido antes da extensão).
  Também evita colisão exata com arquivos já existentes no `cache`.
- `displayName` = `base + .ext`; `originalFileName` = igual; `blob` +
  `detectFileMeta` (tipo/isImage/mime) preservados; `createdAt`/`updatedAt`
  gerados como no `addFile` atual.

## Mudanças de código

- **index.html:** `multiple` no input; dois modais (`#rename-decision-modal`,
  `#rename-list-modal`) seguindo o padrão de `.delete-modal`.
- **main.js:** modo lote no `openAdd`/`onFileSelected`; helpers puros
  `splitName`, `buildDisplayName`, `dedupeBatchNames`; `saveBatch(records)`
  (uma transação IndexedDB reusando o shape de `addFile`); `openRenameDecision`,
  `renderRenameList`, `confirmBatchSave`. `init()` guardado para browser +
  export CommonJS para testes em Node.
- **components.css:** estilos dos dois modais/linhas.
- **_test_logic.js:** testes Node (TDD) para `splitName` / `buildDisplayName` /
  `dedupeBatchNames`.

## Critérios de aceite

Seleção múltipla; pergunta de renomeação; renomear individual (Sim); salvar
nomes originais (Não); funciona com 1 ou N arquivos; aparecem na listagem; busca
continua funcionando; metadados preservados; sem erros no console.
