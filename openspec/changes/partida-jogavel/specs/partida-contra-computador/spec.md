# Spec Delta

## Purpose

Permitir que uma pessoa inicie e conclua no navegador uma partida de Batalha Naval contra ataques automáticos do computador, com estado e resultados apresentados em português.

## ADDED Requirements

### Requirement: Iniciar partida pela interface
A página inicial SHALL oferecer uma ação para iniciar uma partida com frotas válidas preparadas automaticamente e passar ao turno do jogador.

#### Scenario: Início de uma partida
- **GIVEN** nenhuma partida está ativa
- **WHEN** o jogador seleciona iniciar partida
- **THEN** os dois tabuleiros são apresentados com frotas válidas
- **AND** a interface indica que é o turno do jogador

### Requirement: Apresentação dos tabuleiros
A interface SHALL apresentar dois tabuleiros de 10 × 10 com coordenadas identificáveis, mostrar a frota e os ataques conhecidos do jogador e ocultar a frota adversária ainda não descoberta.

#### Scenario: Frotas visíveis e ocultas
- **GIVEN** uma partida ativa sem ataques
- **WHEN** os dois tabuleiros são exibidos
- **THEN** o jogador consegue consultar seus próprios navios
- **AND** as posições não atacadas do computador não revelam navios

### Requirement: Ataque do jogador
A interface SHALL aceitar disparo somente no turno do jogador e somente em uma coordenada adversária ainda não atacada.

#### Scenario: Disparo em coordenada disponível
- **GIVEN** é o turno do jogador
- **WHEN** o jogador seleciona uma coordenada ainda não atacada no tabuleiro adversário
- **THEN** a interface apresenta o resultado do disparo
- **AND** transfere o turno ao computador, salvo se o jogador venceu

#### Scenario: Coordenada repetida ou turno indisponível
- **GIVEN** a coordenada já recebeu um disparo ou o computador está jogando
- **WHEN** o jogador tenta disparar nessa coordenada
- **THEN** a ação não é aceita
- **AND** nenhum disparo adicional é registrado

### Requirement: Resposta automática do computador
A interface SHALL executar um ataque automático em uma coordenada ainda não atacada do jogador e não SHALL repetir disparos anteriores.

#### Scenario: Computador responde ao turno do jogador
- **GIVEN** o jogador realizou um disparo válido sem encerrar a partida
- **WHEN** o turno passa ao computador
- **THEN** o computador seleciona uma coordenada ainda não atacada e realiza um disparo
- **AND** a interface apresenta seu resultado e devolve o turno ao jogador, salvo se a partida terminou

### Requirement: Resultado da partida
A interface SHALL apresentar água, acerto, navio afundado e vitória ou derrota conforme os resultados do motor e das regras.

#### Scenario: Partida encerrada
- **GIVEN** um participante derrotou a frota adversária
- **WHEN** o motor encerra a partida
- **THEN** a interface anuncia o vencedor em português
- **AND** não permite novos disparos

### Requirement: Reiniciar partida
A interface SHALL permitir preparar uma nova partida após uma partida ativa ou encerrada, descartando o estado anterior.

#### Scenario: Nova partida após encerramento
- **GIVEN** uma partida terminou
- **WHEN** o jogador seleciona nova partida
- **THEN** duas novas frotas são preparadas automaticamente
- **AND** a interface volta ao primeiro turno do jogador com histórico de disparos vazio

### Requirement: Acessibilidade dos tabuleiros
As coordenadas interativas SHALL ter nomes acessíveis em português que identifiquem posição e estado conhecido, e a indicação do turno ou resultado SHALL ser comunicada em texto.

#### Scenario: Leitura de uma coordenada
- **GIVEN** o jogador navega por teclado ou tecnologia assistiva
- **WHEN** uma coordenada interativa recebe foco
- **THEN** seu nome acessível informa sua posição e se está disponível ou já foi atacada
- **AND** os resultados não dependem exclusivamente de cor
