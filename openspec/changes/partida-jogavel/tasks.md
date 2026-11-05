# Tasks

## 1. Integrar início e estado da partida

- [x] 1.1 Conectar a ação de iniciar à preparação automática e ao motor; verificar com teste de componente que dois tabuleiros aparecem e o turno começa pelo jogador.
- [x] 1.2 Substituir a página informativa após o início por dois tabuleiros acessíveis, exibindo navios próprios e ocultando posições adversárias; verificar no teste que ataques não efetuados não revelam a frota inimiga.

## 2. Implementar fluxo de turnos jogável

- [x] 2.1 Ligar células adversárias aos ataques do motor, desabilitando posições já atacadas e todos os ataques fora do turno do jogador; verificar acerto/água e bloqueio de ataques repetidos no teste de componente.
- [x] 2.2 Implementar a resposta aleatória do computador apenas entre coordenadas ainda não atacadas, com atraso visual cancelável em reinício/destruição; verificar com fake timers que ocorre exatamente um ataque e que não há repetição.
- [x] 2.3 Apresentar resultado do último disparo, turno, vitória ou derrota e ação para nova partida; verificar fluxo de encerramento e reinício com histórico vazio nos testes.

## 3. Entrega e verificação

- [x] 3.1 Atualizar o README para informar que a aplicação permite jogar contra o computador, descrever controles e limitações (frotas automáticas, sem dificuldade/persistência); conferir que as instruções correspondem à interface entregue.
- [x] 3.2 Executar `npm test -- --watch=false` e `npm run build`; validar no navegador uma partida completa e reinício em 360 e 1440 px, sem erros de console, sem rolagem horizontal e sem revelar a frota não atacada.
