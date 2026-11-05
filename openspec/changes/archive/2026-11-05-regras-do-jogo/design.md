# Design

## Context

Consulte `proposal.md` para o motivo e `specs/regras-do-jogo/spec.md` para o contrato. O código atual não contém modelos de domínio do jogo. Esta capacidade deve fornecer valores utilizáveis futuramente pelo motor, preservando a separação entre regras, orquestração e interface.

## Goals / Non-Goals

**Goals:**
- Expor funções determinísticas que recebem valores e retornam novos valores, sem mutar entradas.
- Fornecer coordenada, campo, frota, cenário preparado e aplicação de ataque compatíveis com o consumidor `motor-do-jogo`.
- Validar frota e posicionamento antes de permitir iniciar uma partida.

**Non-Goals:**
- Decidir ou gerar posicionamentos aleatórios, selecionar ataques, controlar turnos ou declarar vencedor da partida.
- Integrar Angular, Signals, DOM, temporizadores, persistência ou interface.
- Implementar posicionamento manual de navios na interface.

## Decisions

### 1. Valores de domínio puros e imutáveis

Organizar o módulo em `src/app/jogo/regras/`, sem imports externos. Coordenadas usam `linha` e `coluna` inteiras de 0 a 9. Tipos de domínio serão profundamente `readonly`; operações criarão novos campos e resultados, sem modificar valores recebidos. Isso mantém os testes isolados e permite que o motor mantenha a própria cópia de um cenário.

Alternativa descartada: classes com setters ou mutação in-place, que tornam rejeições parciais difíceis de evitar e enfraquecem snapshots do motor.

### 2. Campo como composição explícita de navios e ataques

Um campo contém identificadores e tipos dos navios, as coordenadas ocupadas por cada navio e as coordenadas já atacadas. `criarCampo` inicia vazio. `posicionarNavio` retorna aceitação com um novo campo ou rejeição com motivo discriminado. `validarCampoCompleto` exige exatamente um navio de cada tipo padrão e posições legais. Navios são retos e contíguos; adjacência é permitida, sobreposição não.

Comprimentos: porta-aviões 5, encouraçado 4, cruzador 3, submarino 3 e destróier 2. A validação impede IDs duplicados e mais de um navio do mesmo tipo.

Alternativa descartada: inferir geometria do navio a partir de posições arbitrárias no momento do ataque, pois isso repetiria validação e permitiria campos malformados escaparem para o motor.

### 3. Preparação de cenário valida os dois campos

`prepararCenario` recebe os campos do jogador e do computador, valida ambos como completos e válidos e retorna uma união discriminada de sucesso ou rejeição. O cenário de sucesso mantém os dois campos como valores imutáveis. A regra não escolhe posições nem usa aleatoriedade; geração de frota pertence a uma estratégia ou change posterior.

Alternativa descartada: aceitar campos sem validação e transferir ao motor o conhecimento da frota, o que misturaria responsabilidades e deixaria inválidos os dados de início.

### 4. Ataque é uma transformação atômica do campo-alvo

`aplicarAtaque(campo, coordenada)` valida a coordenada e a repetição antes de criar qualquer resultado. Rejeições retornam motivos identificáveis sem campo atualizado. Aceitações retornam o novo campo, resultado público (`agua`, `acerto` ou `navio-afundado`) e `frotaDerrotada`. O resultado de acerto/afundamento identifica o navio sem expor dados não necessários ao histórico.

Ataques só são considerados repetidos contra o campo que está sendo atacado, pois cada campo representa um participante distinto. A regra não alterna turnos nem limita a quantidade de ataques por rodada.

Alternativa descartada: exceções para erros de entrada esperados; a união discriminada facilita integração atômica pelo motor, enquanto defeitos inesperados continuam visíveis.

### 5. Cópia defensiva compatível com o motor

Os valores são compostos de primitivas, arrays e objetos simples congeláveis. O módulo congela recursivamente valores que publica ou retorna, além de usar tipos `readonly` em compilação. Não usar `structuredClone` nem serialização como cópia genérica, evitando dependência do ambiente do navegador e perda de valores futuros.

## Risks / Trade-offs

- [Contrato dos resultados não corresponder ao desenho do motor] → Expor explicitamente campo atualizado, resultado público e indicador booleano de frota derrotada; validar os tipos contra o artefato de motor antes do archive.
- [Índices iniciados em zero divergirem de convenções futuras de interface] → Manter a coordenada de domínio independente da apresentação; adaptadores convertem índices ao exibir letras e números.
- [Frota padrão mudar] → Centralizar tipos e comprimentos na definição de frota e cobrir completude e ataques com testes.

## Migration Plan

1. Implementar os valores e operações puros com testes unitários.
2. Executar `npm test -- --watch=false` e `npm run build`.
3. Confirmar que os tipos satisfazem a fronteira em `motor-do-jogo` e arquivar esta change.
4. Implementar o motor consumindo estes contratos; não é necessária migração porque ainda não há estado de partida persistido.

Rollback: remover o módulo e os testes da capacidade antes de sua integração ao motor, sem afetar a página inicial.
