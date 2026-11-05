# Spec Delta

## Purpose

Preparar automaticamente frotas completas e independentes para os dois participantes, produzindo um cenário válido que possa iniciar ou reiniciar uma partida sem posicionamento manual.

## ADDED Requirements

### Requirement: Geração de campo completo
A preparação SHALL produzir, para cada campo solicitado, exatamente um navio de cada tipo da frota padrão, em posições aceitas pelas regras do jogo e sem ataques registrados.

#### Scenario: Campo gerado
- **WHEN** um campo é gerado automaticamente
- **THEN** a frota do campo é completa e válida segundo as regras do jogo
- **AND** o campo não contém ataques registrados

### Requirement: Geração concluída para entradas válidas
A preparação SHALL concluir a geração de um campo válido sem depender de tentativas aleatórias ilimitadas, inclusive quando a fonte de escolhas fornece repetidamente o mesmo valor válido.

#### Scenario: Fonte de escolhas constante
- **GIVEN** uma fonte de escolhas que sempre retorna o mesmo valor válido
- **WHEN** um campo é gerado automaticamente
- **THEN** a geração termina com uma frota completa e válida

### Requirement: Cenário automático para dois participantes
A preparação SHALL produzir um cenário com campo completo para jogador e campo completo para computador, utilizável para iniciar ou reiniciar o motor da partida.

#### Scenario: Preparar nova partida
- **WHEN** um cenário é preparado automaticamente
- **THEN** os dois campos são completos e válidos segundo as regras do jogo
- **AND** o cenário é aceito para iniciar o motor da partida

#### Scenario: Preparar reinício
- **GIVEN** uma partida em andamento ou encerrada
- **WHEN** um novo cenário é preparado automaticamente
- **THEN** o cenário é aceito para reiniciar o motor da partida

### Requirement: Independência dos campos
A preparação SHALL criar os campos do jogador e do computador como valores independentes; ataques a um campo não SHALL modificar o outro.

#### Scenario: Ataque em apenas um campo
- **GIVEN** um cenário gerado automaticamente
- **WHEN** um ataque é aplicado ao campo do computador
- **THEN** o campo do jogador mantém a frota e os ataques anteriores inalterados

### Requirement: Escolhas controláveis e variáveis
A preparação SHALL permitir reproduzir uma disposição quando recebe a mesma sequência de escolhas e SHALL aceitar escolhas diferentes capazes de gerar disposições distintas.

#### Scenario: Repetição das escolhas
- **GIVEN** duas fontes com a mesma sequência de escolhas válidas
- **WHEN** dois cenários são gerados com essas fontes
- **THEN** os campos correspondentes apresentam as mesmas disposições

#### Scenario: Variação das escolhas
- **GIVEN** duas fontes com sequências de escolhas válidas diferentes
- **WHEN** campos são gerados a partir de cada fonte
- **THEN** é possível obter disposições válidas distintas

#### Scenario: Escolha fora do intervalo
- **GIVEN** uma fonte que retorna valor não finito ou fora de `[0, 1)`
- **WHEN** a preparação solicita uma escolha dessa fonte
- **THEN** a geração falha com erro identificável, sem entregar campo ou cenário parcial

### Requirement: Proteção dos resultados
A preparação SHALL devolver campos e cenário que preservem as garantias de imutabilidade dos valores de domínio, sem permitir alteração das frotas por consumidores externos.

#### Scenario: Tentativa de alteração de um cenário
- **GIVEN** um cenário gerado automaticamente
- **WHEN** um consumidor tenta modificar a posição de um navio retornado
- **THEN** a alteração é impedida ou não afeta o cenário gerado
