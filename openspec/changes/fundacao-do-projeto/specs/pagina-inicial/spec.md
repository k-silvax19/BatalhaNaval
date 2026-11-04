# Spec Delta

## Purpose

Apresentar o jogo Batalha Naval ao visitante, comunicando o modo de jogo previsto e sua disponibilidade em uma página acessível e adaptada a diferentes telas.

## ADDED Requirements

### Requirement: Apresentação do jogo
A página inicial SHALL apresentar o título "Batalha Naval" e uma descrição em português que identifique o modo jogador contra computador.

#### Scenario: Acesso à página inicial
- **WHEN** o visitante acessa a URL raiz da aplicação
- **THEN** a página exibe "Batalha Naval" como título principal
- **AND** apresenta uma descrição do modo contra o computador em português

### Requirement: Comunicação de disponibilidade
A página inicial SHALL informar em português que as partidas ainda estão em desenvolvimento, sem oferecer uma ação habilitada que prometa iniciar um jogo nesta versão.

#### Scenario: Consulta da disponibilidade do jogo
- **WHEN** o visitante consulta a página inicial
- **THEN** encontra uma mensagem explícita de que jogar estará disponível em uma próxima etapa
- **AND** não encontra uma ação habilitada para iniciar uma partida

### Requirement: Adaptação a telas pequenas e grandes
A página inicial SHALL manter seus textos legíveis e seu conteúdo acessível sem rolagem horizontal em viewports de 360 a 1440 pixels de largura.

#### Scenario: Visualização em celular
- **WHEN** o visitante abre a página em uma viewport de 360 pixels de largura
- **THEN** o conteúdo se ajusta à largura disponível, sem cortes ou rolagem horizontal

#### Scenario: Visualização em computador
- **WHEN** o visitante abre a página em uma viewport de 1440 pixels de largura
- **THEN** o conteúdo permanece organizado e legível, sem sobreposição dos elementos

### Requirement: Leitura acessível da apresentação
A página inicial SHALL declarar seu idioma como português do Brasil, identificar semanticamente o conteúdo principal e fornecer a informação essencial em texto, sem depender de ícones ou cores.

#### Scenario: Leitura com tecnologia assistiva
- **WHEN** o visitante percorre a página com tecnologia assistiva
- **THEN** o documento identifica o idioma pt-BR e oferece um título principal e uma região de conteúdo principal
- **AND** o nome do jogo, modo previsto e disponibilidade podem ser compreendidos pelo texto
- **AND** ícones decorativos não adicionam anúncios redundantes
