# Proposal

## Why

O projeto ainda não possui uma camada que coordene o ciclo de uma partida, os turnos e o encerramento sem depender da interface Angular. Um motor isolado permitirá testar a progressão completa da partida e integrar posteriormente computador, Signals e componentes sem duplicar decisões de fluxo.

## What Changes

- Introduzir um motor TypeScript puro para iniciar, consultar, avançar e reiniciar uma partida.
- Modelar as fases de preparação, turno do jogador, turno do computador e partida encerrada.
- Aceitar um único ataque válido por turno e rejeitar ações incompatíveis com a fase atual sem alterar o estado.
- Registrar um histórico ordenado das ações aceitas e determinar vencedor após cada ataque válido.
- Expor o estado por snapshots somente de leitura, sem permitir mutação externa.
- Definir os contratos que o futuro domínio de `regras-do-jogo` deverá fornecer ao motor, sem implementar tabuleiro, frota, posicionamento ou cálculo de disparos nesta change.
- Manter interface Angular, Signals, temporizadores, estratégia do computador e persistência para changes posteriores.

## Capabilities

### New Capabilities

- `motor-da-partida`: coordenação determinística do ciclo da partida, dos comandos aceitos, dos turnos, do histórico e do encerramento.

### Modified Capabilities

Nenhuma. Não existem specs duráveis relacionadas ao motor.

## Impact

- Novo código TypeScript puro e respectivos testes unitários sob uma área de domínio do jogo em `src/app/jogo/`.
- Dependência funcional explícita de contratos ainda futuros de `regras-do-jogo`; a implementação desta change permanecerá bloqueada até esses contratos existirem.
- Nenhuma alteração prevista na página inicial, no estilo visual ou no comportamento acessível já entregue.
- Nenhuma nova dependência npm, API remota, armazenamento ou integração com navegador.
