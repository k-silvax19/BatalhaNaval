# Tasks

## 1. Valores básicos do domínio

- [x] 1.1 Criar tipos profundamente somente de leitura para coordenadas, navios, campos e resultados discriminados; verificar compilando TypeScript estrito e adicionando testes para coordenadas válidas e fora do tabuleiro.
- [x] 1.2 Definir a frota padrão e operações para criar campos e posicionar navios; verificar com testes de comprimentos, completude, orientações, adjacência permitida, sobreposição, limites e posicionamento inválido sem mutação.

## 2. Cenários e ataques

- [x] 2.1 Implementar validação e preparação de cenário com campos completos dos dois participantes; verificar testes para cenário válido, campos incompletos ou inválidos e preservação das entradas.
- [x] 2.2 Implementar aplicação atômica de ataque com resultados água, acerto, navio afundado, ataque repetido e frota derrotada; verificar testes para todos os resultados, último segmento da frota, rejeições e ausência de mutação em falha.
- [x] 2.3 Garantir imutabilidade em execução dos valores exportados e retornados; verificar em testes que tentativas de alterar coordenadas, campos, cenário e resultados não afetam consultas posteriores.

## 3. Integração e documentação

- [x] 3.1 Documentar no README que regras puras do jogo foram modeladas, mantendo explícito que ainda não é possível jogar e que motor, interface de partida e estratégia do computador são fases futuras; verificar o texto atualizado.
- [x] 3.2 Executar `npm test -- --watch=false` e `npm run build`, inspecionar imports para confirmar ausência de dependências Angular/DOM/Signals e comparar com a spec para confirmar todos os cenários cobertos.

## Workflow follow-up

- Confirmar os contratos exportados com `motor-do-jogo` e arquivar esta change antes de retomar a implementação do motor.
