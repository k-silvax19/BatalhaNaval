# Tasks

## 1. Geração automática do campo

- [x] 1.1 Criar em `src/app/jogo/preparacao/` a API de geração com fonte de escolhas injetável e padrão, validando números finitos em `[0, 1)`; verificar com testes que uma fonte inválida falha sem resultado parcial e que fontes idênticas reiniciadas reproduzem a geração.
- [x] 1.2 Enumerar candidatos horizontais e verticais para os cinco tipos da frota usando dimensões e comprimentos públicos das regras; verificar em testes que os candidatos permanecem dentro do tabuleiro e que fontes distintas podem produzir disposições diferentes.
- [x] 1.3 Montar um campo a partir de `criarCampo` e `posicionarNavio`, com busca finita, recuo e reserva determinística validada; verificar com testes a conclusão sob fonte constante e sob escolhas adversas, sem tentativas ilimitadas.
- [x] 1.4 Validar e devolver um campo imutável com frota padrão completa e nenhum ataque registrado; verificar com `validarCampoCompleto` e testes que posições não se sobrepõem e alterações externas não modificam o retorno.

## 2. Cenário para o motor

- [x] 2.1 Gerar campos independentes para jogador e computador e consolidá-los via `prepararCenario`; verificar com testes que ambos são válidos e que atacar um campo não altera o outro, mesmo quando as disposições forem iguais.
- [x] 2.2 Validar por testes de integração que um cenário gerado automaticamente é aceito por `MotorDaPartida.iniciar` e `reiniciar` e que um cenário anterior não é reaproveitado como estado da nova partida.
- [x] 2.3 Atualizar o README para registrar a disponibilidade da API de preparação automática, seus limites e a sequência de integração visual futura; verificar que continua explícito que ainda não se pode iniciar uma partida pela interface.

## 3. Verificação integrada

- [x] 3.1 Executar `npm test -- --watch=false` e `npm run build` após a integração, confirmar a cobertura dos cenários da spec e revisar o diff para preservar alterações preexistentes de regras, motor e página inicial.
