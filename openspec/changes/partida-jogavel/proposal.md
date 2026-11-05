# Proposal

## Why

As regras, o motor e a preparação automática já conseguem compor e conduzir uma partida, mas a aplicação ainda apresenta apenas uma tela informativa. Esta mudança conecta esses módulos a uma interface acessível para que uma pessoa possa jogar contra o computador no navegador.

## What Changes

- Adicionar uma ação para iniciar uma partida com frotas geradas automaticamente.
- Exibir o campo do jogador e o campo adversário em tabuleiros interativos de 10 × 10.
- Permitir disparos do jogador apenas no seu turno e em coordenadas ainda não atacadas.
- Executar uma resposta automática do computador em uma coordenada ainda não atacada do jogador.
- Apresentar turnos, resultados de ataques, vitória ou derrota e uma ação para iniciar nova partida.
- Manter posicionamento manual, dificuldade configurável, persistência e multijogador fora desta mudança.

## Capabilities

### New Capabilities

- `partida-contra-computador`: interação no navegador para iniciar, jogar e reiniciar uma partida contra ataques aleatórios do computador.

### Modified Capabilities

Nenhuma. Não existe ainda spec durável para a página inicial ou para a interface da partida.

## Impact

- Atualização do componente raiz e seus templates para integrar a preparação automática e o motor.
- Novo estado de interface com Signals para refletir partida, turno, bloqueios e mensagens.
- Testes de componente/integração cobrindo início, ataques, resposta do computador, término e reinício.
- Atualização do README para documentar que a versão permite jogar contra o computador.
