# Proposal

## Why

As regras já validam frotas e cenários, e o motor já inicia partidas a partir de um cenário preparado, mas hoje não há como produzir automaticamente os dois campos completos. Essa lacuna impede que a futura interface inicie uma partida sem exigir posicionamento manual.

## What Changes

- Oferecer preparação automática de um campo completo com a frota padrão em posições válidas, escolhidas com variação entre execuções.
- Preparar campos independentes para jogador e computador e devolvê-los como um cenário válido aceito pelos contratos de regras e pelo motor.
- Permitir que a escolha aleatória seja controlada nos testes, sem depender de serviços externos.
- Cobrir a geração com testes de validade, encerramento e repetibilidade com fonte de aleatoriedade controlada.
- Manter para changes posteriores a interface jogável, a integração com Signals, a estratégia de ataques do computador e o posicionamento manual.

## Capabilities

### New Capabilities

- `preparacao-automatica-da-partida`: montagem automática e confiável de campos completos e de um cenário para iniciar ou reiniciar partidas.

### Modified Capabilities

Nenhuma. A capacidade `regras-do-jogo` continuará responsável pelas mesmas validações de campo e cenário, sem mudança em seus requisitos.

## Impact

- Novo módulo TypeScript puro próximo de `src/app/jogo/regras/`, consumindo os tipos e funções existentes de posicionamento, validação e preparação de cenário.
- Testes unitários para geração de campos e cenário; nenhuma nova dependência npm prevista.
- Sem alterações necessárias ao motor, à página inicial ou ao comportamento da interface nesta change.
