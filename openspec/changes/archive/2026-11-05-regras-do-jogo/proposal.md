# Proposal

## Why

O projeto precisa de regras de domínio determinísticas para modelar tabuleiros, frota, posicionamento e ataques sem dependência da interface. Esses contratos também são pré-requisito para que o motor da partida coordene turnos e encerramento sem duplicar regras.

## What Changes

- Introduzir valores e operações puros de TypeScript para coordenadas, campos, frota, posicionamento e cenários preparados.
- Validar posicionamentos e aplicar ataques com resultados aceitos ou rejeitados, incluindo a condição de frota derrotada.
- Definir um tabuleiro 10×10 e a frota padrão: porta-aviões (5), encouraçado (4), cruzador (3), submarino (3) e destróier (2); navios podem ser adjacentes, mas não se sobrepor.
- Manter os contratos desacoplados do Angular e fornecer os tipos e operações necessários ao futuro motor da partida.

## Capabilities

### New Capabilities

- `regras-do-jogo`: regras puras de domínio para coordenadas, campos, frota, cenários e aplicação de ataques.

### Modified Capabilities

Nenhuma.

## Impact

- Novo módulo TypeScript puro e testes unitários sob `src/app/jogo/regras/`.
- Contratos importáveis pelo futuro motor da partida, sem dependências de Angular, DOM, Signals ou aleatoriedade.
- Nenhuma alteração prevista na interface inicial ou dependência npm adicional.
