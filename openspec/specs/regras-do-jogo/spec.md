# regras-do-jogo Specification

## Purpose

Definir regras determinísticas e reutilizáveis para tabuleiros, frotas, cenários preparados e ataques de Batalha Naval, sem acoplamento à interface ou à estratégia dos participantes.

## Requirements

### Requirement: Coordenadas e limites do tabuleiro
As regras SHALL representar coordenadas inteiras e rejeitar posições fora do tabuleiro de 10×10.

#### Scenario: Coordenada dentro do tabuleiro
- **WHEN** uma coordenada com linha e coluna entre 0 e 9 é consultada
- **THEN** ela é aceita como uma coordenada válida

#### Scenario: Coordenada fora do tabuleiro
- **WHEN** uma coordenada possui linha ou coluna menor que 0 ou maior que 9
- **THEN** ela é rejeitada com motivo identificável

### Requirement: Frota padrão
Cada campo completo SHALL conter exatamente um navio de cada tipo da frota padrão, com seus comprimentos definidos.

#### Scenario: Frota completa
- **WHEN** um campo é preparado com porta-aviões de 5 posições, encouraçado de 4, cruzador de 3, submarino de 3 e destróier de 2
- **THEN** o campo é considerado completo e válido

#### Scenario: Frota incompleta ou duplicada
- **WHEN** um campo não contém exatamente um navio de cada tipo exigido
- **THEN** ele não pode compor um cenário preparado e informa a validação correspondente

### Requirement: Posicionamento de navios
As regras SHALL aceitar somente navios retilíneos, contíguos, no comprimento exigido e inteiramente dentro do tabuleiro, sem sobreposição.

#### Scenario: Posicionamento horizontal ou vertical válido
- **WHEN** um navio ocupa posições contíguas horizontais ou verticais com o comprimento correto
- **THEN** o posicionamento é aceito mesmo quando toca outro navio pelas laterais ou diagonais

#### Scenario: Posicionamento inválido
- **WHEN** um navio sai do tabuleiro, sobrepõe outro navio, tem lacunas, dobra ou comprimento incorreto
- **THEN** o posicionamento é rejeitado com motivo identificável e o campo permanece inalterado

### Requirement: Cenário preparado
As regras SHALL produzir um cenário imutável somente quando ambos os campos contiverem frotas completas e válidas.

#### Scenario: Preparar cenário válido
- **WHEN** dois campos válidos e completos são fornecidos
- **THEN** é retornado um cenário preparado com o campo de cada participante

#### Scenario: Preparar cenário inválido
- **WHEN** pelo menos um campo é incompleto ou inválido
- **THEN** o cenário é rejeitado sem alterar os campos fornecidos

### Requirement: Aplicação de ataque
As regras SHALL aplicar um ataque novo a um campo válido e informar o resultado público e se todos os navios foram derrotados.

#### Scenario: Ataque na água
- **WHEN** uma coordenada ainda não atacada não contém navio
- **THEN** o ataque é aceito como água, o campo atualizado registra a coordenada e a frota não é indicada como derrotada

#### Scenario: Ataque acerta navio
- **WHEN** uma coordenada ainda não atacada contém parte de um navio que permanece parcialmente intacto
- **THEN** o ataque é aceito como acerto e informa o navio atingido

#### Scenario: Ataque afunda navio
- **WHEN** uma coordenada ainda não atacada atinge a última posição intacta de um navio
- **THEN** o ataque é aceito como navio afundado e identifica o navio

#### Scenario: Derrota da frota
- **WHEN** um ataque aceito destrói a última posição intacta de toda a frota
- **THEN** o resultado indica que a frota foi derrotada

#### Scenario: Ataque repetido ou inválido
- **WHEN** uma coordenada fora do tabuleiro ou já atacada é aplicada
- **THEN** o ataque é rejeitado com motivo identificável e o campo permanece inalterado

### Requirement: Imutabilidade dos valores de domínio
Coordenadas, campos, cenários e resultados SHALL ser expostos como valores profundamente somente de leitura e não permitir mutação externa do estado de domínio.

#### Scenario: Consulta defensiva de campo
- **WHEN** um consumidor consulta um campo ou cenário e tenta alterar seus navios ou ataques
- **THEN** a alteração é impedida ou não afeta consultas posteriores

#### Scenario: Reutilização de coordenada
- **WHEN** uma coordenada é mantida entre consultas ou usada no histórico de outro módulo
- **THEN** ela conserva os mesmos valores e não pode ser alterada por um consumidor
