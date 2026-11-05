# Design

## Context

Ver `proposal.md` para a motivação e `specs/motor-da-partida/spec.md` para o contrato de comportamento. A aplicação atual possui somente um componente Standalone de apresentação e um teste de renderização; ainda não há modelos de tabuleiro, frota, coordenada ou ataque.

Por decisão do desenvolvedor, esta change planeja o motor antes de `regras-do-jogo`. O motor será implementável apenas quando essa capacidade futura disponibilizar tipos e operações compatíveis. Não serão criados modelos provisórios ou duplicados para contornar essa dependência.

## Goals / Non-Goals

**Goals:**
- Isolar a máquina de estados e a sequência de comandos da aplicação Angular.
- Produzir resultados determinísticos para os mesmos estados, comandos e respostas das regras.
- Manter o estado interno protegido e cobrir todas as transições com testes unitários.
- Definir uma fronteira explícita entre orquestração, regras do tabuleiro e estratégia dos participantes.

**Non-Goals:**
- Definir dimensões do tabuleiro, composição da frota, posicionamento ou semântica interna dos resultados de ataque.
- Escolher coordenadas para o computador ou adicionar atrasos entre turnos.
- Expor Signals, serviços Angular, componentes, persistência ou serialização de partidas.
- Alterar a página inicial antes de existir uma partida jogável.

## Decisions

### 1. Bloqueio explícito pela capacidade `regras-do-jogo`

A implementação deverá começar somente após `regras-do-jogo` fornecer, no mínimo:

- uma coordenada válida e comparável;
- um campo de batalha profundamente somente de leitura;
- um cenário preparado contendo os campos dos dois participantes;
- uma operação para aplicar ataque que diferencie aceitação e rejeição;
- para ataques aceitos, campo atualizado, resultado público e indicação de frota derrotada.

Esses contratos serão importados da área de regras. O motor não deverá declarar versões locais equivalentes, pois isso criaria duas fontes de verdade e uma migração posterior. Fakes usados nos testes devem implementar os contratos reais.

Alternativa descartada: implementar tabuleiro mínimo dentro do motor. Embora desbloqueasse a codificação imediatamente, misturaria validação e orquestração e contrariaria a separação em changes.

### 2. Motor TypeScript puro com estado encapsulado

O motor será criado por uma API TypeScript sem dependências de Angular. Ele manterá o estado internamente e oferecerá operações equivalentes a criar, iniciar, atacar, reiniciar e consultar. Cada comando retornará uma união discriminada de aceito ou rejeitado, permitindo ao chamador tratar erros sem exceções para fluxos esperados.

Uma classe pública com propriedades mutáveis foi descartada porque facilitaria transições fora dos comandos. Um serviço Angular também foi descartado: Signals e efeitos pertencem ao adaptador de aplicação da fase jogável.

### 3. Estados discriminados por fase

O estado será uma união discriminada para impedir combinações inválidas:

```text
Preparando
    |
    | iniciar(cenario)
    v
TurnoJogador <------------------+
    |                            |
    | ataque valido              | ataque valido
    v                            |
TurnoComputador -----------------+
    |
    | ataque que derrota frota
    v
Encerrada
```

- `preparando`: não possui campos, turno ou vencedor;
- `turno-do-jogador` e `turno-do-computador`: possuem campos e histórico, sem vencedor;
- `encerrada`: possui campos, histórico e vencedor, sem próximo turno.

O reinício substitui qualquer fase por um novo estado no turno do jogador. O estado não terá um valor nulo genérico para representar todas as fases, evitando verificações espalhadas e estados parcialmente preenchidos.

### 4. O motor recebe coordenadas, não escolhe ataques

O mesmo comando de ataque será usado para jogador e computador, sempre com participante e coordenada explícitos. Uma estratégia futura escolhe a coordenada do computador e o adaptador Angular decide quando enviar o comando. Assim, o motor não conhece aleatoriedade, temporizadores nem informações ocultas além do necessário para aplicar o ataque via regras.

Alternativa descartada: injetar a estratégia no motor. Isso acoplaria progressão da partida à decisão de jogada e dificultaria testar cada responsabilidade isoladamente.

### 5. Transições atômicas e histórico derivado de comandos aceitos

Para um ataque, o motor deverá seguir uma única sequência:

1. validar fase e participante do turno;
2. solicitar às regras a aplicação da coordenada no campo adversário;
3. rejeitar sem alteração quando as regras recusarem o ataque;
4. para ataque aceito, substituir o campo adversário e acrescentar o histórico;
5. encerrar com vencedor quando a frota for derrotada ou alternar o turno.

O histórico recebe numeração monotônica iniciada em 1 e conserva participante, coordenada e resultado público devolvido pelas regras. Comandos rejeitados nunca geram registros. Exceções inesperadas das regras não devem ser convertidas em comando rejeitado; devem propagar para revelar violação de contrato durante desenvolvimento.

### 6. Snapshots defensivos e imutabilidade profunda

O cenário recebido será copiado para posse do motor, e consultas devolverão snapshots desacoplados do estado interno. Os tipos serão profundamente `readonly`; a implementação também deverá impedir mutação em tempo de execução, por cópia defensiva ou congelamento recursivo compatível com os valores definidos por `regras-do-jogo`.

Somente usar `Readonly<T>` foi descartado porque protege apenas durante compilação e não satisfaz o cenário de alteração externa em tempo de execução.

### 7. Testes orientados à máquina de estados

Os testes usarão Vitest e fakes dos contratos reais de regras, sem TestBed ou DOM. A matriz mínima cobrirá todas as fases, resultados água/acerto/afundado, rejeições, duas condições de vitória, reinício e tentativa de mutar snapshots. Testes devem comparar o estado completo antes e depois de comandos rejeitados.

Testes de componente e integração com Signals serão adicionados na change da partida jogável, não aqui.

## Risks / Trade-offs

- [Contratos futuros de regras divergirem deste desenho] → Tratar `regras-do-jogo` como pré-requisito e revisar esta change antes do apply caso tipos ou operações não satisfaçam a fronteira definida.
- [Planejamento ficar obsoleto enquanto a dependência é construída] → Validar novamente proposal, spec, design e tasks após arquivar a change de regras.
- [Cópia defensiva ser incompatível com objetos ricos] → Exigir que os contratos de regras definam valores de domínio copiáveis ou uma operação explícita de cópia; não recorrer silenciosamente a cópia rasa.
- [Histórico duplicar dados presentes nos campos] → Manter apenas dados públicos necessários para reconstituir a sequência de ataques, sem snapshots completos por evento.
- [Motor permitir conhecimento indevido ao computador] → Não expor o estado completo à futura estratégia; um adaptador deverá produzir uma visão limitada em outra change.

## Migration Plan

1. Arquivar a fundação e implementar/arquivar `regras-do-jogo`.
2. Confirmar que os contratos de regras atendem à fronteira desta change; atualizar os artefatos de planejamento se houver divergência material.
3. Implementar o motor e seus testes sem conectá-lo à interface existente.
4. Executar testes e build; manter a página inicial com o comportamento atual.
5. Integrar o motor com Signals e estratégia do computador somente em uma change posterior.

Como ainda não existe estado de partida persistido, não há migração de dados. A reversão remove apenas o módulo do motor e seus testes, sem alterar a página existente.
