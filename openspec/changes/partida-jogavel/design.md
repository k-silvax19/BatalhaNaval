# Design

## Context

Ver `proposal.md` e `specs/partida-contra-computador/spec.md`. A aplicação possui um componente raiz com apresentação informativa, uma API pura `prepararPartidaAutomatica` e o motor puro `MotorDaPartida`. A configuração global já habilita Zoneless; a versão inicial não tem rotas nem serviço de estado de jogo.

## Goals / Non-Goals

**Goals:**
- Integrar a preparação e o motor à interface com o menor número de camadas.
- Manter UI em português, responsiva e acessível a teclado/toque.
- Garantir que o computador ataque apenas coordenadas ainda não atacadas e que não execute ações depois de reinício ou encerramento.

**Non-Goals:**
- Posicionamento manual, seletor de dificuldade, estratégia de caça após acerto, persistência e multijogador.
- Adicionar roteador, backend ou biblioteca de estado.

## Decisions

### 1. Signals no componente raiz como adaptador de interface

Manter a tela inicial e a partida em estados distintos no componente Standalone existente. Um Signal guarda o snapshot de `MotorDaPartida`; `computed` deriva fase, turno, campos renderizados e a última mensagem de resultado. A interface chama os comandos do motor e publica o snapshot retornado no Signal. Essa solução cabe à aplicação de uma tela e evita um serviço Angular antes de existir reutilização entre rotas.

Um segundo motor mutável ou cópia independente das regras na UI não será criado. Motor e preparação permanecem TypeScript puro.

### 2. Tabuleiro com controles semânticos por coordenada

Renderizar rótulos A–J e 1–10 e uma grade de células em cada tabuleiro. O tabuleiro adversário usa botões, habilitados somente no turno do jogador e nas coordenadas não atacadas; o tabuleiro próprio é uma visualização sem controles de ataque. Nomes acessíveis descrevem coordenada e estado conhecido. Navios adversários só aparecem nas posições atingidas, sem revelar a frota por classe, rótulo ou atributo acessível.

As cores terão rótulos textuais/ícones para água, acerto e afundamento. A grade se empilha em telas estreitas e divide espaço em telas largas.

### 3. Computador aleatório orquestrado pela interface

Após o ataque válido do jogador, atualizar o snapshot, bloquear interação e agendar uma resposta curta. Na resposta, obter coordenadas não atacadas do campo do jogador consultado pelo estado atual, sortear uma, chamar `MotorDaPartida.atacar('computador', ...)` e publicar o novo snapshot. Não chamar estratégia quando a partida terminou ou foi reiniciada.

O temporizador fica no componente de interface, pois representa apenas ritmo visual e não regra do domínio. Guardar e cancelar seu identificador em reinício e destruição do componente. A função de seleção escolhe exclusivamente do conjunto de coordenadas disponíveis; não precisa consultar posições de navios.

### 4. Reinício re-prepara todo o estado

O comando de iniciar/reiniciar chama `prepararPartidaAutomatica` e entrega o cenário ao método correspondente do motor. Ao reiniciar, cancelar ação pendente do computador antes de enviar o novo cenário. A tela de entrada pode aparecer antes da primeira partida; após término, oferecer nova partida sem deixar o estado anterior visível.

### 5. Testes de componente e navegador

Atualizar o teste do componente para verificar a ação de início e os tabuleiros. Cobrir ataque permitido, repetição/desabilitação durante o turno do computador, ataque automático não repetido, vitória/encerramento e reinício. Usar fake timers onde for necessário; preservar testes puros existentes do domínio e do motor. Validar no navegador que o fluxo completo é operável em teclado/toque e em 360/1440 px.

## Risks / Trade-offs

- [Frota adversária revelada acidentalmente] → Renderizar o tabuleiro do computador apenas dos resultados de ataques e inspecionar DOM/árvore acessível antes e depois de disparos.
- [Temporizador executa após reinício ou destruição] → Cancelar timeout nos dois fluxos e conferir a fase e a referência do motor antes do ataque.
- [Grade de 100 células difícil em telas estreitas] → Manter células quadradas e tabuleiros empilhados no celular, sem rolagem horizontal.
- [Estado de Signals diverge do motor] → Toda ação atualiza o Signal a partir do snapshot devolvido pelo motor; nenhum turno é calculado paralelamente na UI.

## Migration Plan

1. Substituir a apresentação somente informativa por estado inicial com ação para começar.
2. Integrar motor e preparação automática a tabuleiros renderizados.
3. Implementar resposta aleatória do computador e cancelamento seguro de temporizadores.
4. Executar testes/build e validar o fluxo completo e responsividade no navegador.
5. Atualizar o README para refletir a primeira versão jogável.

Não há partidas persistidas a migrar. Para reverter, restaurar o componente informativo e retirar o adaptador de tela, preservando regras, motor e preparação.
