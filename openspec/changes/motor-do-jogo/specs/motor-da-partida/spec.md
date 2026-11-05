# Spec Delta

## Purpose

Coordenar de forma determinística o ciclo de uma partida de Batalha Naval, preservando turnos, histórico e encerramento sem depender da interface ou da estratégia dos participantes.

## ADDED Requirements

### Requirement: Estado de preparação
O motor SHALL permanecer na fase de preparação enquanto ainda não recebeu um cenário válido, sem expor turno, campos ou vencedor.

#### Scenario: Motor criado sem cenário
- **WHEN** um novo motor é criado
- **THEN** a fase atual é preparação
- **AND** não existem turno, campos, histórico de ataques ou vencedor

### Requirement: Inicialização da partida
O motor SHALL iniciar uma nova partida a partir de um cenário preparado e válido, com histórico vazio, sem vencedor e com o primeiro turno atribuído ao jogador.

#### Scenario: Início com cenário válido
- **GIVEN** um cenário com os campos do jogador e do computador preparados pelas regras do jogo
- **WHEN** uma nova partida é iniciada
- **THEN** a fase passa para o turno do jogador
- **AND** o histórico está vazio e não existe vencedor

### Requirement: Execução de um ataque válido
O motor SHALL aceitar um ataque somente quando o participante informado possui o turno e as regras do jogo reconhecem a coordenada como um novo ataque válido.

#### Scenario: Ataque válido do jogador sem vitória
- **GIVEN** uma partida no turno do jogador e sem vencedor
- **WHEN** o jogador ataca uma coordenada válida que não derrota a frota do computador
- **THEN** o resultado fornecido pelas regras do jogo é incorporado ao estado
- **AND** o turno passa para o computador

#### Scenario: Ataque válido do computador sem vitória
- **GIVEN** uma partida no turno do computador e sem vencedor
- **WHEN** o computador ataca uma coordenada válida que não derrota a frota do jogador
- **THEN** o resultado fornecido pelas regras do jogo é incorporado ao estado
- **AND** o turno passa para o jogador

### Requirement: Um ataque válido por turno
O motor SHALL encerrar o turno após qualquer ataque válido, independentemente de o resultado ser água, acerto ou navio afundado.

#### Scenario: Acerto encerra o turno
- **GIVEN** uma partida no turno do jogador
- **WHEN** o jogador realiza um ataque válido que acerta um navio sem encerrar a partida
- **THEN** o próximo turno pertence ao computador

#### Scenario: Navio afundado encerra o turno
- **GIVEN** uma partida no turno do computador
- **WHEN** o computador realiza um ataque válido que afunda um navio sem encerrar a partida
- **THEN** o próximo turno pertence ao jogador

### Requirement: Rejeição de comando inválido
O motor SHALL rejeitar ataques fora do turno, repetidos ou recusados pelas regras do jogo sem modificar campos, turno, histórico ou vencedor.

#### Scenario: Ataque fora do turno
- **GIVEN** uma partida no turno do computador
- **WHEN** o jogador tenta realizar um ataque
- **THEN** o comando é rejeitado com motivo identificável
- **AND** o estado da partida permanece inalterado

#### Scenario: Ataque repetido
- **GIVEN** uma partida ativa e uma coordenada já atacada pelo participante do turno
- **WHEN** o participante tenta atacar novamente essa coordenada
- **THEN** o comando é rejeitado com motivo identificável
- **AND** o participante conserva o turno e o histórico permanece inalterado

### Requirement: Histórico ordenado de ataques
O motor SHALL registrar cada ataque aceito em ordem crescente, incluindo sequência, participante, coordenada e resultado, sem registrar comandos rejeitados.

#### Scenario: Registro de ataques aceitos
- **GIVEN** uma partida ativa com dois ataques aceitos anteriormente
- **WHEN** o participante do turno realiza o terceiro ataque válido
- **THEN** o histórico contém três registros ordenados
- **AND** o último registro possui sequência 3 e os dados do ataque realizado

#### Scenario: Comando rejeitado não gera histórico
- **GIVEN** uma partida ativa com um histórico conhecido
- **WHEN** um ataque é rejeitado
- **THEN** o histórico permanece idêntico ao estado anterior

### Requirement: Encerramento da partida
O motor SHALL encerrar imediatamente a partida quando as regras informarem que o ataque válido derrotou a frota adversária, preservando como vencedor o participante atacante.

#### Scenario: Vitória do jogador
- **GIVEN** uma partida no turno do jogador
- **WHEN** um ataque válido do jogador derrota a frota do computador
- **THEN** a fase passa para partida encerrada e o jogador é registrado como vencedor
- **AND** o ataque final está presente no histórico

#### Scenario: Vitória do computador
- **GIVEN** uma partida no turno do computador
- **WHEN** um ataque válido do computador derrota a frota do jogador
- **THEN** a fase passa para partida encerrada e o computador é registrado como vencedor
- **AND** o ataque final está presente no histórico

### Requirement: Imutabilidade após encerramento
O motor SHALL rejeitar novos ataques após o encerramento sem modificar o estado final da partida.

#### Scenario: Ataque após vitória
- **GIVEN** uma partida encerrada com vencedor definido
- **WHEN** qualquer participante tenta realizar outro ataque
- **THEN** o comando é rejeitado como partida encerrada
- **AND** o vencedor, os campos e o histórico permanecem inalterados

### Requirement: Reinício da partida
O motor SHALL substituir integralmente a partida atual por um novo cenário preparado, restaurando o primeiro turno do jogador e removendo histórico e vencedor anteriores.

#### Scenario: Reinício de partida encerrada
- **GIVEN** uma partida encerrada com histórico e vencedor
- **WHEN** a partida é reiniciada com um novo cenário válido
- **THEN** a fase passa para o turno do jogador com histórico vazio e sem vencedor
- **AND** os dois campos correspondem somente ao novo cenário

#### Scenario: Reinício de partida ativa
- **GIVEN** uma partida ativa com ataques registrados
- **WHEN** a partida é reiniciada com um novo cenário válido
- **THEN** os ataques e campos anteriores deixam de fazer parte do estado atual

### Requirement: Consulta protegida do estado
O motor SHALL disponibilizar o estado atual sem permitir que consumidores alterem campos, turno, histórico ou vencedor fora dos comandos suportados.

#### Scenario: Consulta do estado
- **GIVEN** uma partida ativa em um estado conhecido
- **WHEN** um consumidor consulta o estado atual
- **THEN** recebe uma representação somente de leitura equivalente ao estado interno
- **AND** alterações externas nessa representação não modificam a partida
