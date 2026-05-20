# Cadê?

## Descrição

**Cadê?** é uma aplicação web que permite ao usuário guardar, organizar e localizar documentos pessoais, acadêmicos e profissionais diretamente no navegador. Todo o armazenamento é feito localmente, sem necessidade de cadastro, servidor ou conexão com internet.

---

## Objetivo

Resolver o problema de não saber onde estão arquivos importantes (comprovantes, contratos, certificados, etc.) ao centralizar o registro desses documentos em um único lugar, com busca e organização por categoria.

---

## Funcionalidades

- Adicionar arquivos do dispositivo com nome personalizado, categoria e etiqueta opcional.
- Organizar arquivos em três categorias fixas: **Pessoal**, **Acadêmico** e **Trabalho**.
- Visualizar arquivos agrupados por categoria.
- Filtrar arquivos dentro de uma categoria por nome, tipo ou etiqueta.
- Ordenar arquivos por data de atualização, nome (A-Z) ou tipo de arquivo.
- Buscar arquivos globalmente por nome, tipo de arquivo, categoria ou etiqueta.
- Abrir o arquivo original em uma nova aba do navegador.
- Baixar o arquivo original caso a abertura em nova aba seja bloqueada pelo navegador.
- Editar as informações de um arquivo (nome, categoria, etiqueta e, opcionalmente, substituir o arquivo).
- Excluir arquivos com confirmação via modal.
- Exibir resumo da quantidade de arquivos salvos na tela inicial.
- Estados visuais para listas vazias (sem arquivos na categoria ou sem resultados de busca).

---

## Fluxo principal de uso

1. O usuário acessa a tela inicial e visualiza o total de arquivos salvos (ou o estado vazio).
2. Clica em **"+ Adicionar arquivo"** e é levado ao formulário de upload.
3. Seleciona um arquivo do dispositivo, preenche o nome, escolhe uma categoria e, opcionalmente, adiciona uma etiqueta.
4. Ao escolher a categoria, o formulário é submetido automaticamente (se nome e arquivo já estiverem preenchidos).
5. Após salvar, vê a tela de sucesso com opção de voltar à lista ou adicionar outro arquivo.
6. Na tela inicial, pode clicar em uma categoria para ver todos os arquivos daquela categoria.
7. Dentro da categoria, pode filtrar, ordenar, abrir, editar ou excluir arquivos.
8. Na barra de busca da tela inicial, pode digitar um termo e pressionar Enter para ver resultados de busca globais.
9. Nos resultados de busca, pode abrir, editar, excluir ou navegar para a categoria do arquivo encontrado.

---

## Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura e marcação semântica de toda a aplicação |
| CSS3 com Custom Properties | Estilização e design tokens (cores, tipografia, espaçamentos) |
| JavaScript (ES2020+, Vanilla) | Toda a lógica da aplicação, navegação entre telas e manipulação do DOM |
| IndexedDB (API nativa do navegador) | Armazenamento persistente dos metadados e dos arquivos (Blobs) |
| Font Inter (system-ui fallback) | Tipografia |

Não há dependências externas, frameworks, bundlers ou back-end.

---

## Estrutura do projeto

```
cade/
├── index.html              # Arquivo principal — contém todas as telas da aplicação
└── src/
    ├── assets/
    │   ├── icons/          # Ícones estáticos
    │   └── images/         # Imagens estáticas
    ├── css/
    │   ├── variables.css   # Design tokens (cores, espaçamentos, tipografia, sombras)
    │   ├── base.css        # Reset CSS e estilos globais
    │   ├── components.css  # Estilos dos componentes reutilizáveis
    │   └── home.css        # Estilos específicos da tela inicial
    └── js/
        └── main.js         # Toda a lógica JavaScript da aplicação
```

### Descrição dos arquivos principais

- **`index.html`** — Contém as quatro telas da aplicação (tela inicial, upload/edição, visualização por categoria e resultados de busca) e o modal de confirmação de exclusão. A navegação entre telas é feita via JavaScript, adicionando/removendo a classe `is-hidden`.
- **`src/css/variables.css`** — Define todos os tokens de design como variáveis CSS (ex.: `--color-primary`, `--font-size-md`, `--space-4`).
- **`src/css/base.css`** — Aplica reset de box-sizing, estilos de tipografia global e normalização de botões e inputs.
- **`src/css/components.css`** — Estilos dos componentes visuais: cards de arquivo, formulários, botões, barra de busca, modal, badges de tipo, etc.
- **`src/css/home.css`** — Estilos específicos da tela inicial (hero, grid de categorias, estado vazio).
- **`src/js/main.js`** — Toda a lógica da aplicação: abertura do banco IndexedDB, operações CRUD, navegação entre telas, renderização dinâmica das listas e eventos de UI.

---

## Como executar o projeto

Por ser uma aplicação frontend pura (HTML + CSS + JS), não é necessário instalar dependências ou rodar um servidor.

### Opção 1 — Abrir diretamente no navegador

1. Faça o download ou clone o repositório.
2. Abra o arquivo `index.html` no Google Chrome, Microsoft Edge ou Firefox.

> **Atenção:** Alguns navegadores restringem o IndexedDB quando o arquivo é aberto via `file://`. Se os arquivos não forem salvos, use a opção 2.

### Opção 2 — Servidor local (recomendado)

Com [VS Code](https://code.visualstudio.com/) e a extensão **Live Server**:

1. Abra a pasta do projeto no VS Code.
2. Clique com o botão direito em `index.html` e selecione **"Open with Live Server"**.
3. O app abrirá automaticamente no navegador em `http://127.0.0.1:5500`.

Alternativamente, com Python instalado:

```bash
# Python 3
python -m http.server 5500
```

Acesse `http://localhost:5500` no navegador.

---

## Como usar

1. **Tela inicial** — Exibe o total de arquivos salvos, a barra de busca e os cartões de categoria.
2. **Adicionar arquivo** — Clique em "**+ Adicionar arquivo**", selecione o arquivo, preencha o nome, escolha uma categoria e (opcionalmente) adicione uma etiqueta. O formulário é salvo ao selecionar a categoria.
3. **Ver por categoria** — Clique em um cartão de categoria (Pessoal, Acadêmico ou Trabalho) para ver os arquivos daquela categoria. Use o campo de filtro e o seletor de ordenação para refinar a lista.
4. **Busca global** — Digite um termo na barra de busca da tela inicial e pressione **Enter**.
5. **Abrir arquivo** — Clique em **"Abrir →"** no cartão do arquivo para visualizá-lo em uma nova aba.
6. **Editar** — Clique em **"Editar"** para alterar o nome, categoria, etiqueta ou substituir o arquivo.
7. **Excluir** — Clique em **"Excluir"** e confirme no modal para remover o arquivo permanentemente.

---

## Armazenamento de dados

O app utiliza **IndexedDB**, uma API nativa dos navegadores modernos, para armazenar os dados localmente.

| Configuração | Valor |
|---|---|
| Nome do banco | `cade_db` |
| Versão | `1` |
| Object Store | `files` |
| Chave primária | `id` (gerado automaticamente) |

### Estrutura de cada registro

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador único gerado com `Date.now()` + string aleatória |
| `displayName` | string | Nome dado pelo usuário ao arquivo |
| `originalFileName` | string | Nome original do arquivo no dispositivo |
| `fileType` | string | Tipo detectado: `pdf`, `docx`, `xlsx`, `pptx`, `imagem`, `txt` ou extensão bruta |
| `mimeType` | string | MIME type do arquivo |
| `fileSize` | number | Tamanho em bytes |
| `category` | string | `pessoal`, `academico` ou `trabalho` |
| `tag` | string | Etiqueta opcional definida pelo usuário |
| `blob` | Blob | Conteúdo binário do arquivo |
| `createdAt` | string | Data/hora de criação (ISO 8601) |
| `updatedAt` | string | Data/hora da última atualização (ISO 8601) |

> Os dados persistem apenas no navegador e no dispositivo em uso. Limpar os dados do navegador ou usar outro dispositivo/navegador resultará em perda dos arquivos salvos.

---

## Testes manuais sugeridos

1. **Adicionar arquivo** — Clique em "+ Adicionar arquivo", selecione um PDF ou imagem, preencha o nome, escolha "Pessoal" e verifique se o contador da tela inicial é atualizado.
2. **Validação do formulário** — Tente salvar sem selecionar arquivo, sem preencher o nome ou sem escolher categoria. Verifique se as mensagens de erro aparecem corretamente.
3. **Visualizar por categoria** — Clique no cartão "Acadêmico" e verifique se apenas os arquivos dessa categoria aparecem.
4. **Filtro dentro da categoria** — Com arquivos na categoria, use o campo de filtro e verifique se a lista é atualizada em tempo real.
5. **Ordenação** — Troque o seletor de ordenação entre "Mais recentes", "Nome A-Z" e "Tipo de arquivo" e verifique se a lista é reordenada.
6. **Busca global** — Digite parte do nome de um arquivo salvo na barra de busca e pressione Enter. Verifique se o arquivo aparece nos resultados.
7. **Abrir arquivo** — Clique em "Abrir →" em um arquivo salvo e verifique se ele é exibido em uma nova aba.
8. **Editar arquivo** — Clique em "Editar", altere o nome e salve. Verifique se as informações foram atualizadas.
9. **Excluir arquivo** — Clique em "Excluir", confirme no modal e verifique se o arquivo some da lista e o contador é atualizado.
10. **Estado vazio** — Em uma categoria sem arquivos, verifique se a mensagem de estado vazio e o botão de adicionar são exibidos.
11. **Persistência** — Adicione um arquivo, feche e reabra o navegador. Verifique se o arquivo ainda está salvo.

---

## Limitações conhecidas

- **Armazenamento local apenas** — Os dados ficam restritos ao navegador e dispositivo em que foram salvos. Não há sincronização entre dispositivos ou navegadores.
- **Sem exportação/importação** — Não é possível fazer backup dos arquivos ou restaurá-los em outro dispositivo.
- **Limite de armazenamento do navegador** — O IndexedDB usa o espaço de disco permitido pelo navegador. Arquivos muito grandes podem ser bloqueados dependendo do limite da quota do navegador.
- **Popup blocker** — Se o navegador bloquear a abertura de novas abas, o app usa um fallback para download do arquivo, o que pode ser inesperado para o usuário.
- **Sem autenticação** — Qualquer pessoa com acesso ao dispositivo e ao navegador pode ver, editar ou excluir os arquivos.
- **Categorias fixas** — As três categorias (Pessoal, Acadêmico e Trabalho) são definidas em código e não podem ser criadas ou alteradas pelo usuário.
- **Sem suporte a múltiplos arquivos** — O formulário de upload aceita apenas um arquivo por vez.
- **Sem visualização inline** — O app não exibe prévia de imagens ou documentos dentro da interface; apenas abre o arquivo em nova aba ou faz download.

---

## Melhorias futuras

- Suporte a categorias personalizadas criadas pelo usuário.
- Upload de múltiplos arquivos de uma só vez.
- Visualização prévia de imagens e PDFs dentro do app.
- Função de exportar/importar todos os arquivos como backup.
- Suporte a arrastar e soltar arquivos (drag-and-drop) na área de upload.
- Implementação como PWA (Progressive Web App) com service worker para funcionamento offline garantido e ícone instalável.
- Indicador de progresso durante o salvamento de arquivos grandes.
- Paginação ou scroll infinito para categorias com muitos arquivos.
- Filtro por data (intervalo de datas de adição).
- Confirmação ao tentar sair com o formulário preenchido (proteção contra perda de dados).

---

## Observações

- O app é uma **SPA (Single Page Application)** implementada sem frameworks. Toda a navegação entre telas é feita adicionando e removendo a classe CSS `is-hidden` nos elementos de tela.
- A função `escapeHTML` é usada em todo o código de geração de HTML dinâmico para evitar injeção de conteúdo malicioso no DOM.
- O ID de cada arquivo é gerado combinando `Date.now().toString(36)` com uma string aleatória, garantindo unicidade sem necessidade de autoincremento.
- O banco IndexedDB é aberto uma única vez na inicialização (`init()`) e reutilizado em todas as operações subsequentes via a variável `db`.
- O arquivo `main.js` concentra toda a lógica da aplicação em um único arquivo, o que é adequado para o tamanho atual do projeto, mas pode se tornar difícil de manter conforme o app crescer.