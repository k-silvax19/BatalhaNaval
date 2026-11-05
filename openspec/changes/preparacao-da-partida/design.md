# Design

## Context

Ver `proposal.md` e `specs/preparacao-automatica-da-partida/spec.md`. O projeto já fornece `COMPRIMENTOS_FROTA`, `criarCampo`, `posicionarNavio`, `validarCampoCompleto` e `prepararCenario` em `src/app/jogo/regras/`. O motor recebe um `CenarioPreparado` em `iniciar` ou `reiniciar` e não escolhe posições. O README ainda declara a geração automática como pendente. As alterações não versionadas existentes em `src/app/jogo/`, README e OpenSpec pertencem ao trabalho já realizado e devem ser preservadas.

## Goals / Non-Goals

**Goals:**
- Entregar um produtor reutilizável de campos e cenários válidos para o motor, sem modificar o domínio existente.
- Assegurar término mesmo com escolhas aleatórias desfavoráveis e permitir testes determinísticos.
- Preservar independência e imutabilidade dos campos resultantes.

**Non-Goals:**
- Implementar o fluxo de iniciar uma partida na interface, estratégia de ataques, Signals ou posicionamento manual.
- Garantir distribuição estatística uniforme de todas as frotas possíveis ou que duas gerações sucessivas sempre sejam diferentes.
- Modificar os requisitos ou os contratos de `regras-do-jogo` e `motor-da-partida`.

## Decisions

### 1. Módulo de preparação separado do motor e das regras

Criar uma pequena área `src/app/jogo/preparacao/` com operações para gerar um campo e preparar um cenário automático. Consumir as funções públicas de `regras/` em vez de duplicar critérios de posicionamento. O cenário será construído por `prepararCenario` e poderá ser passado diretamente a `MotorDaPartida.iniciar` ou `reiniciar`, sem mudar o motor.

Alternativas descartadas: gerar frotas dentro do motor mistura criação de cenário com controle de turnos; ampliar `regras-do-jogo` com política de aleatoriedade mistura regra e preparação.

### 2. Fonte de escolhas injetável

Adotar uma função que devolva um número finito no intervalo `[0, 1)`; usar `Math.random` como padrão e permitir injeção dessa função para testes. Rejeitar explicitamente valores fora do intervalo ou não finitos, sem retornos parcialmente preparados. Em testes, duas fontes reiniciadas com a mesma sequência devem produzir a mesma disposição. Isso não significa que chamadas consecutivas à mesma fonte produzirão campos iguais.

Alternativa descartada: semente e gerador próprio nesta change; exigiria definir algoritmo público estável de pseudoaleatoriedade sem necessidade para a primeira versão.

### 3. Candidatos finitos e busca que termina

Para cada tipo de navio, enumerar previamente posições horizontais e verticais possíveis no tabuleiro 10 × 10. Percorrer os tipos em ordem fixa (preferencialmente maior para menor) e ordenar candidatos conforme a fonte injetada. Tentar posicionar via `posicionarNavio`, com busca reversível quando uma escolha impedir a conclusão. Limitar o trabalho da busca e manter uma disposição determinística de reserva validada pelas mesmas regras; assim nenhuma sequência válida de escolhas provoca laço sem fim ou falha por repetição.

Uma estratégia que apenas tenta coordenadas aleatórias até funcionar foi descartada: uma fonte constante pode escolher uma posição impossível indefinidamente. A disposição de reserva não deve ser o caminho normal e será coberta em teste. A busca não precisa prometer uniformidade estatística.

### 4. Campos independentes e validação final

Gerar cada campo a partir de `criarCampo`, com IDs de navios distintos dentro do respectivo campo e uma instância separada de campo para cada participante. A mesma sequência de escolhas pode gerar frotas iguais para jogador e computador, mas nunca objetos compartilhados. Confirmar ambos os campos com `validarCampoCompleto`, e chamar `prepararCenario` para produzir o valor profundamente imutável. Se uma invariante interna falhar, lançar erro explícito em vez de apresentar um cenário inválido como válido.

Alternativa descartada: obrigar as frotas a ter layouts diferentes; isso não é regra do jogo e tornaria a geração e os testes mais complexos sem beneficiar a partida.

### 5. Testes dos contratos e do consumidor

Usar Vitest sem TestBed. Exercitar fonte constante, sequências reproduzíveis e distintas, frota completa, ausência de ataques, proteção de estruturas, independência dos campos e aceite por `prepararCenario`/motor. Usar uma fonte de escolhas adversa controlada para verificar o limite/fallback sem teste frágil baseado em tempo de execução.

## Risks / Trade-offs

- [Busca combinatória custosa] → Definir limite finito e reserva válida, medindo por testes que tanto o caminho habitual quanto a reserva terminam.
- [Variação insuficiente por ordenação enviesada] → Variar a ordem dos candidatos por uma fonte controlável e testar que ao menos duas sequências geram posições distintas; uniformidade não é promessa desta change.
- [Contratos públicos das regras mudarem enquanto há trabalho não arquivado] → Confirmar os exports reais no começo do apply e revisar o design se houver divergência; não apagar alterações existentes.
- [Uso indevido dos campos do computador pela futura estratégia] → Manter a preparação independente da visão que a estratégia receberá; a restrição de informação cabe ao adaptador da partida jogável.

## Migration Plan

1. Confirmar as APIs atuais de regras e do motor.
2. Implementar geração e preparação em módulo separado com seus testes.
3. Atualizar o README para refletir a preparação automática disponível como API, esclarecendo que ainda não há interface jogável.
4. Executar testes, build e verificação OpenSpec; a integração visual pertence à próxima change.

Não há dados persistidos a migrar. O rollback remove apenas o novo módulo e sua documentação, preservando regras, motor e a página existente.
