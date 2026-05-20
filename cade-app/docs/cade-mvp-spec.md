# Cadê? - Documento de Descoberta, Persona e Revisão de Escopo

## Visão Geral

O **Cadê?** é um aplicativo voltado para busca facilitada de documentos por meio de organização automática e localização inteligente de arquivos.

Este documento reúne:
- dados coletados em formulário de validação,
- definição da persona principal,
- análise das dores dos usuários,
- revisão de escopo do MVP,
- direcionamentos para desenvolvimento orientado por IA.

---

# 1. Dados Colhidos do Formulário de Pesquisa

Os dados coletados mostram que existe um problema real, frequente e validado relacionado à organização de arquivos digitais.

## Principais Insights

### Frequência de busca por arquivos
- 50% dos usuários procuraram arquivos no mesmo dia da pesquisa.
- 33,3% procuraram arquivos nos últimos 3 dias.

Isso demonstra que localizar arquivos é uma atividade recorrente no cotidiano dos usuários.

---

### Dificuldade para encontrar arquivos

A dificuldade média relatada ficou entre 4 e 8 em uma escala de 10.

O problema não é extremo, mas é constante e gera frustração recorrente.

---

### Organização manual não resolve totalmente

- 66,7% afirmaram utilizar pastas organizadas.
- Mesmo assim, continuam enfrentando dificuldades para localizar documentos.

Isso indica que apenas criar pastas não resolve o problema de forma eficiente.

---

### Problemas com versões duplicadas

- 83,3% dos usuários já tiveram problemas com diferentes versões do mesmo arquivo.

Exemplos comuns:

- `relatorio_final`
- `relatorio_final_v2`
- `relatorio_FINAL_agora_vai`

Esse é um dos sinais mais fortes para justificar funcionalidades relacionadas a:

- controle de versões,
- detecção de duplicatas,
- padronização.

---

### Tempo gasto procurando arquivos

- 66,7% levam entre 1 e 5 minutos para encontrar arquivos importantes.

Isso gera:
- perda de produtividade,
- retrabalho,
- interrupções constantes no fluxo de trabalho.

---

### Dores identificadas nas respostas abertas

Os principais problemas relatados foram:
- arquivos salvos em locais errados,
- falta de organização,
- acúmulo na pasta Downloads,
- dificuldade para localizar documentos rapidamente.

---

# 2. Conclusão da Validação

O Cadê? resolve um problema real e validado pelos usuários.

Os dados indicam que:
- existe frequência alta de uso,
- existe dor recorrente,
- as soluções atuais dos usuários não são suficientes.

Com isso, não existe necessidade imediata de um novo micro-rediscovery completo.

---

# 3. Persona Principal

# Carlos, o Profissional Sobrecarregado

> “Eu sei que salvei esse arquivo aqui semana passada, mas agora não consigo encontrar ele em lugar nenhum.”

---

## Perfil

- Nome: Carlos Mendes
- Idade: 32 anos
- Profissão: Analista de escritório
- Nível técnico: Intermediário
- Dispositivos:
  - notebook Windows,
  - smartphone.

Carlos utiliza computador diariamente, mas não possui conhecimento avançado em organização digital.

---

## Contexto

Carlos trabalha constantemente com:
- documentos,
- planilhas,
- relatórios.

Mesmo tentando manter uma estrutura de pastas organizada, o volume de arquivos cresce mais rápido do que ele consegue administrar.

A pasta Downloads virou um depósito caótico de arquivos.

Ele frequentemente:
- salva arquivos rapidamente,
- esquece onde salvou,
- abre versões erradas do mesmo documento.

---

## Comportamento com Arquivos

Carlos:
- procura arquivos praticamente todos os dias,
- perde entre 1 e 5 minutos buscando documentos importantes,
- utiliza pastas organizadas,
- ainda enfrenta dificuldades frequentes.

A organização manual não acompanha sua rotina.

Também sofre com múltiplas versões do mesmo documento:
- `relatorio_final`
- `relatorio_final_v2`
- `relatorio_FINAL_agora_vai`

---

## Dores Principais

### 1. Arquivos salvos em locais errados

Salva rapidamente e depois não lembra onde colocou.

---

### 2. Acúmulo na pasta Downloads

A pasta Downloads se transforma em um espaço desorganizado.

---

### 3. Falta de padronização

Nomes inconsistentes dificultam buscas futuras.

---

### 4. Versões duplicadas

Confusão sobre qual documento é o mais atualizado.

---

### 5. Perda recorrente de tempo

A busca por arquivos interrompe constantemente sua produtividade.

---

## Motivações

Carlos deseja:
- encontrar arquivos em segundos,
- saber qual versão está correta,
- reduzir esforço manual,
- manter organização automática,
- aumentar produtividade.

---

## Prioridades da Persona

| Funcionalidade | Prioridade |
|---|---|
| Localização rápida de arquivos | Alta |
| Controle de versões e duplicatas | Alta |
| Interface simples | Alta |
| Categorização automática | Média |
| Organização da pasta Downloads | Média |

---

## Frases Representativas

> “Fico perdido quando tenho vários arquivos com nomes parecidos.”

> “Sempre acabo salvando na pasta errada e depois não acho mais.”

> “Minha pasta Downloads é um caos.”

---

# 4. Como o Cadê? Resolve o Problema

O aplicativo atua diretamente nas dores identificadas na pesquisa.

## Funcionalidades alinhadas às dores

### Busca inteligente

Reduz o tempo de localização de arquivos de minutos para segundos.

---

### Organização automática

Ajuda a reduzir arquivos salvos aleatoriamente.

---

### Controle parcial de versões

Centraliza arquivos atualizados em um único registro.

---

### Organização da pasta Downloads

Transforma o principal ponto de entrada de arquivos em um ambiente mais funcional.

---

# 5. Revisão de Escopo do MVP

## Objetivo da Revisão

Verificar:
- alinhamento do escopo atual com a persona,
- lacunas críticas,
- funcionalidades prioritárias,
- funcionalidades que podem ficar fora do MVP.

---

# 6. Necessidades da Persona x Escopo Atual

| Necessidade | Status |
|---|---|
| Busca rápida de arquivos | Atendido |
| Controle de versões | Parcial |
| Interface simples | Atendido |
| Categorização automática | Não implementado |
| Organização automática da Downloads | Não implementado |

---

# 7. O Que Está Bem Alinhado

## Busca e localização rápida

A busca global por:
- nome,
- tipo,
- categoria,
- etiquetas

resolve diretamente a principal dor da persona.

---

## Zero fricção de entrada

O sistema:
- não exige cadastro,
- não exige configuração complexa,
- funciona de forma direta.

---

## Categorização manual com etiquetas

As categorias:
- Pessoal,
- Acadêmico,
- Trabalho

cobrem os principais contextos de uso.

---

## Edição de metadados

A substituição de arquivos ajuda parcialmente no problema de versões conflitantes.

---

# 8. Lacunas Críticas

## Controle de versões e duplicatas

Principal problema ainda não resolvido.

Atualmente:
- o sistema não detecta duplicatas,
- não existe histórico de versões,
- arquivos similares podem ser cadastrados múltiplas vezes.

---

## Melhorias sugeridas

### Curto prazo

- destacar `updatedAt` nos cards,
- avisar sobre nomes muito parecidos.

### Futuro

- histórico completo de versões,
- detecção inteligente de duplicatas.

---

# 9. Funcionalidades Fora do MVP

As funcionalidades abaixo não atacam diretamente a principal dor validada:

- visualização inline,
- drag-and-drop,
- PWA,
- upload múltiplo,
- exportação/importação,
- scroll infinito,
- paginação avançada.

Essas melhorias podem permanecer como backlog futuro.

---

# 10. Funcionalidades Importantes para UX

Devem permanecer:
- estados visuais para listas vazias,
- modal de confirmação de exclusão,
- fallback para bloqueio de popup no download.

---

# 11. Escopo Revisado do MVP

## O MVP Deve Conter

### Gerenciamento de arquivos

- adição de arquivos,
- nome,
- categoria,
- etiquetas,
- substituição de arquivo.

---

### Busca e organização

- busca global,
- filtros,
- ordenação,
- visualização por categoria.

---

### Segurança e usabilidade

- exclusão com confirmação,
- exibição de `updatedAt`,
- alerta visual para nomes similares.

---

## Fora do Escopo Atual

- categorias personalizadas,
- upload múltiplo,
- visualização inline,
- drag-and-drop,
- PWA,
- backup/exportação.

---

# 12. Direcionamento para Desenvolvimento com IA

## Objetivo técnico do sistema

Criar uma aplicação SPA para organização e localização inteligente de arquivos.

---

## Prioridades técnicas

### Alta prioridade

- busca extremamente rápida,
- interface simples,
- fluxo sem cadastro,
- filtros eficientes,
- atualização visual imediata.

---

### Média prioridade

- categorização automática,
- heurística para nomes similares,
- organização automática da Downloads.

---

## Requisitos funcionais

### Upload de arquivos

O usuário deve conseguir:
- adicionar arquivos,
- definir categoria,
- adicionar etiquetas.

---

### Busca global

A busca deve funcionar por:
- nome,
- extensão,
- categoria,
- etiquetas.

---

### Controle visual de atualização

Cada arquivo deve exibir:
- data de atualização,
- destaque visual para arquivos recentes.

---

### Detecção de nomes similares

O sistema deve:
- detectar nomes parecidos,
- emitir aviso visual,
- sugerir possível duplicidade.

---

## Requisitos não funcionais

### Performance

A busca deve responder em poucos milissegundos.

---

### Simplicidade

A interface deve possuir baixa curva de aprendizado.

---

### Escalabilidade futura

A arquitetura deve permitir:
- histórico de versões,
- categorização automática,
- sincronização futura.

---

# 13. Conclusão Final

O Cadê? resolve uma dor real, recorrente e validada.

O MVP atual já cobre:
- localização rápida,
- organização básica,
- categorização inicial,
- fluxo simples.

A principal lacuna é:
- controle de versões,
- detecção de duplicatas.

Mesmo assim, ajustes incrementais já entregam valor significativo sem aumentar drasticamente a complexidade do projeto.

O produto possui validação suficiente para seguir para desenvolvimento orientado por IA.