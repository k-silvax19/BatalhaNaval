# Tasks

## 1. Pré-requisito de regras

- [ ] 1.1 Confirmar que a change `regras-do-jogo` foi implementada e arquivada e que seus contratos fornecem coordenada, campo, cenário preparado e aplicação de ataque conforme `design.md`; verificar a spec e os tipos reais e interromper o apply para atualizar estes artefatos se houver divergência material, sem criar modelos provisórios no motor.

## 2. Estados e inicialização do motor

- [ ] 2.1 Criar os tipos profundamente somente de leitura para participante, fases discriminadas, histórico e resultados aceito/rejeitado do comando; verificar pela compilação TypeScript que turno e vencedor só existem nas fases correspondentes.
- [ ] 2.2 Implementar a criação na fase de preparação e a inicialização com cenário válido, copiando os campos para posse do motor; verificar com testes Vitest o estado vazio inicial e a primeira transição para o turno do jogador.
- [ ] 2.3 Implementar o reinício a partir das fases ativa e encerrada; verificar com testes que campos, histórico e vencedor anteriores são integralmente descartados e que o jogador recebe o primeiro turno.

## 3. Ataques e progressão da partida

- [ ] 3.1 Implementar as validações de fase e participante antes de consultar as regras; verificar com testes que ataques antes da inicialização, fora do turno e depois do encerramento retornam motivos identificáveis sem alterar o estado completo.
- [ ] 3.2 Integrar a operação de ataque de `regras-do-jogo` e propagar suas rejeições; verificar com testes que ataque repetido ou recusado conserva campo, turno, histórico e vencedor e que exceções inesperadas não são ocultadas.
- [ ] 3.3 Implementar ataques aceitos e alternância obrigatória após água, acerto ou navio afundado; verificar com testes parametrizados os dois participantes e os três resultados sem vitória.
- [ ] 3.4 Registrar somente ataques aceitos com sequência, participante, coordenada e resultado; verificar com testes que a numeração começa em 1, mantém ordem crescente e ignora comandos rejeitados.
- [ ] 3.5 Implementar o encerramento quando as regras indicarem frota derrotada; verificar separadamente vitória do jogador e do computador, inclusão do ataque final e rejeição de ataques posteriores.

## 4. Proteção e integração

- [ ] 4.1 Implementar snapshots defensivos compatíveis com os valores de `regras-do-jogo`; verificar em teste de execução que tentativas de alterar fase, campos e histórico consultados não modificam uma consulta posterior.
- [ ] 4.2 Manter o módulo do motor livre de imports Angular, DOM, Signals, temporizadores e estratégia de ataque; verificar por inspeção dos imports e pela execução dos testes sem TestBed ou ambiente de navegador.
- [ ] 4.3 Atualizar o README com a fronteira entre regras, motor e futura integração Angular, preservando a indicação de que ainda não é possível jogar; verificar que a documentação não anuncia interface, computador ou persistência como entregues.
- [ ] 4.4 Executar `npm test -- --watch=false` e `npm run build`, confirmar todos os cenários de `specs/motor-da-partida/spec.md` cobertos e revisar o diff para garantir que a página inicial permaneceu inalterada.

## Workflow follow-up

- Integrar o motor a Signals, estratégia do computador e componentes somente em uma change posterior de partida jogável.
