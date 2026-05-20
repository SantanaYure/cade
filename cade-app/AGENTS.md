# AGENTS.md

## Regras Gerais

- Nunca execute commits automaticamente.
- Nunca execute `git push`.
- Nunca execute `git merge`, `rebase` ou alterações destrutivas no histórico.
- Nunca crie branches automaticamente.
- Toda ação Git deve ser feita manualmente pelo usuário.
- Só execute comandos Git se o usuário pedir explicitamente.

---

## Segurança

- Nunca delete arquivos sem autorização explícita.
- Nunca sobrescreva documentação sem confirmação.
- Nunca instale dependências automaticamente.
- Nunca execute comandos destrutivos.

---

## Desenvolvimento

- Prefira mudanças pequenas e incrementais.
- Preserve a arquitetura existente.
- Sempre priorize simplicidade e legibilidade.
- Evite adicionar complexidade desnecessária.

---

## Estrutura do Projeto

- `README.md` contém documentação técnica.
- `docs/` contém documentação de produto e especificação.
- `docs/cade-mvp-spec.md` é a principal referência de produto e regras do MVP.

---

## Fluxo de Trabalho

- O usuário revisa todas as alterações manualmente.
- O usuário é responsável pelos commits.
- A IA deve apenas sugerir mensagens de commit quando solicitado.