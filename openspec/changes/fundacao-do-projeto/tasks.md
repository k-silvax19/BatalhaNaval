# Tasks

## 1. Base Angular e ferramentas

- [x] 1.1 Verificar disponibilidade do Angular 22.2.0 e compatibilidade de CLI, Node, TypeScript, Tailwind/PostCSS e Lucide Angular; confirmar pelas versões e requisitos publicados um conjunto instalável sem forçar conflitos e consultar o desenvolvedor se houver bloqueio.
- [x] 1.2 Criar a aplicação Angular na raiz, com bootstrap Standalone, Zoneless e convenção de Signals para estado mutável; verificar compilação inicial e ausência de `zone.js` nas dependências e polyfills, preservando orientações e configurações existentes.
- [x] 1.3 Configurar npm e lockfile, scripts de desenvolvimento/build/testes e executor suportado pelo CLI; verificar `npm ci`, `npm run build` e `npm test -- --watch=false`, mantendo somente verificação mínima de bootstrap se necessária ao executor.
- [x] 1.4 Substituir o README inicial pela apresentação do projeto, pré-requisitos e instruções de instalação e execução; verificar que os comandos documentados correspondem aos scripts disponíveis e às versões efetivamente adotadas.

## 2. Estilos e página inicial

- [x] 2.1 Integrar Tailwind via PostCSS e ícones Lucide selecionados; verificar no navegador um estilo utilitário aplicado e um ícone renderizado, sem importar o catálogo completo.
- [x] 2.2 Implementar a apresentação em português com título, descrição do modo contra o computador e disponibilidade futura, sem ação habilitada para iniciar partida; verificar os cenários de apresentação e disponibilidade de `specs/pagina-inicial/spec.md` na URL raiz.
- [x] 2.3 Aplicar layout responsivo e semântica acessível com idioma pt-BR, título de documento, `main`, `h1` e ícones decorativos ocultos; verificar os cenários de responsividade em 360 e 1440 pixels e a leitura na árvore de acessibilidade.
- [x] 2.4 Documentar no README o escopo entregue e a sequência das próximas fases, identificando regras ainda propostas como não confirmadas; verificar que a documentação informa explicitamente que esta versão ainda não permite jogar.

## 3. Verificação integrada da entrega

- [x] 3.1 Executar `npm run build` e `npm test -- --watch=false` após a integração visual; confirmar sucesso e revisar manifesto/lockfile para assegurar Angular 22.2.0 e dependências compatíveis.
- [x] 3.2 Iniciar a aplicação com `npm start` e validar a página completa no navegador, sem erros de console, cortes ou rolagem horizontal nas larguras previstas; registrar na conclusão os comandos e cenários verificados.
- [x] 3.3 Revisar o diff final e confirmar que somente arquivos necessários à fundação foram alterados, que artefatos gerados estão ignorados e que orientações e configurações existentes foram preservadas.
