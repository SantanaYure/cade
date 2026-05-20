# Revisão de Escopo — Cadê?

> Revisão realizada com base na persona **Carlos, o Profissional Sobrecarregado**, construída a partir dos dados de validação do formulário.

---

## 1. Objetivo da Revisão

Verificar se o escopo atual do **Cadê?** responde às dores e prioridades reais da persona, identificar lacunas críticas e propor ajustes para que o produto entregue valor máximo dentro do contexto de desenvolvimento atual.

---

## 2. Necessidades da Persona × Escopo Atual

| Necessidade da Persona | Prioridade | Presente no Cadê? | Observação |
|---|---|---|---|
| Localização rápida de arquivos | Alta | ✅ Sim | Busca global por nome, tipo, categoria e etiqueta |
| Controle de versões / duplicatas | Alta | ⚠️ Parcial | A edição permite substituir o arquivo, mas não há histórico de versões nem detecção de duplicatas |
| Interface simples e sem curva de aprendizado | Alta | ✅ Sim | SPA direta, sem cadastro, sem configuração |
| Categorização automática | Média | ❌ Não | O usuário deve escolher a categoria manualmente |
| Organização da pasta Downloads | Média | ❌ Não | O app não acessa ou monitora a pasta Downloads |

---

## 3. O que está bem alinhado com a Persona

### Busca e localização rápida ✅
A busca global por nome, tipo, categoria e etiqueta atende diretamente à principal dor de Carlos: gastar entre 1 e 5 minutos para encontrar um arquivo. O filtro dentro de categorias e a ordenação reforçam isso.

### Zero fricção de entrada ✅
Sem cadastro, sem servidor, sem instalação. Carlos não quer aprender uma nova ferramenta — ele quer resolver um problema. O Cadê? elimina barreiras de adoção.

### Categorização manual com etiqueta ✅
Mesmo que não seja automática, a divisão em **Pessoal**, **Acadêmico** e **Trabalho** cobre bem o perfil de uso de um profissional. A etiqueta opcional dá flexibilidade adicional sem complicar a interface.

### Edição de metadados + substituição de arquivo ✅
Carlos tem o problema de versões conflitantes. A funcionalidade de edição — que permite substituir o arquivo e atualizar o nome — resolve parcialmente esse problema, já que centraliza o arquivo definitivo em um único registro.

---

## 4. Lacunas Críticas (Alta Prioridade)

### Controle de versões / duplicatas ⚠️
**Por quê é crítico:** 83,3% dos usuários já tiveram problemas com versões diferentes do mesmo arquivo. Essa é a dor mais estatisticamente forte da pesquisa.

**Situação atual:** O Cadê? não detecta duplicatas e não mantém histórico de versões. O usuário pode cadastrar o mesmo arquivo várias vezes com nomes diferentes sem nenhum aviso.

**Sugestão de ajuste de escopo:**
- Exibir **data de atualização** em destaque no card do arquivo (já existe no modelo de dados via `updatedAt`) — implementação simples.
- Adicionar **aviso de possível duplicata** ao cadastrar um arquivo com nome muito similar a outro já existente — implementação média.
- Histórico completo de versões → manter como **melhoria futura** (alta complexidade, baixo custo de adiar).

---

## 5. Funcionalidades Fora do Escopo da Persona (Podem Ser Despriorizadas)

| Funcionalidade | Motivo para Despriorizar |
|---|---|
| Visualização inline de imagens e PDFs | Carlos quer *encontrar* o arquivo, não necessariamente visualizá-lo dentro do app |
| Drag-and-drop | Melhoria de UX, mas não resolve a dor central |
| PWA / instalação como app | Aumenta complexidade técnica sem resolver o problema principal |
| Paginação / scroll infinito | Relevante apenas com volume muito alto de arquivos |
| Exportar/importar backup | Dor secundária — Carlos primeiro precisa conseguir organizar os arquivos |

> Essas funcionalidades constam em "Melhorias futuras" no README e estão bem posicionadas lá. Não devem entrar no MVP.

---

## 6. Funcionalidades sem Respaldo Direto na Persona (Neutras)

- **Estados visuais para listas vazias** — boa prática de UX, mantém.
- **Modal de confirmação de exclusão** — previne erro, mantém.
- **Baixar arquivo como fallback** — resolve limitação técnica de popup blocker, mantém.

---

## 7. Escopo Revisado — MVP Alinhado à Persona

### Manter (essencial para a persona)
- [x] Adicionar arquivo com nome, categoria e etiqueta
- [x] Busca global (nome, tipo, categoria, etiqueta)
- [x] Visualização por categoria
- [x] Filtro e ordenação dentro da categoria
- [x] Editar informações + substituir arquivo
- [x] Excluir com confirmação
- [x] Exibir data de atualização em destaque no card

### Ajustar (para fechar a lacuna crítica de versões)
- [ ] **Aviso visual** quando o nome do arquivo novo é muito similar ao de um já existente
- [ ] **Destaque da data `updatedAt`** no card do arquivo (já existe nos dados, só precisa aparecer na UI)

### Remover do escopo atual / manter como futuro
- [ ] Categorias personalizadas
- [ ] Upload múltiplo
- [ ] Visualização inline
- [ ] Drag-and-drop
- [ ] PWA
- [ ] Exportar/importar backup

---

## 8. Conclusão

O escopo do **Cadê?** está bem alinhado com a persona em **3 dos 5 critérios de alta/média prioridade**. A maior lacuna — controle de versões e duplicatas — pode ser parcialmente coberta com ajustes simples na UI (exibir `updatedAt` com destaque e sinalizar nomes similares), sem exigir uma refatoração grande.

O produto resolve um problema real e validado. As funcionalidades centrais estão corretas. Os ajustes sugeridos são incrementais e podem ser implementados dentro do escopo atual sem comprometer a entrega.

---

*Revisão baseada na Persona.md e no README.md do projeto Cadê? — Desafio Semana 7.*
