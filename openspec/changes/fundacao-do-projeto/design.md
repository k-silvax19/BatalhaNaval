# Design

## Context

Ver `proposal.md` para a motivação e `specs/pagina-inicial/spec.md` para o contrato de apresentação. A inspeção encontrou apenas orientações, configuração OpenSpec/OpenCode, um README com `.` e um `.gitignore` que já contempla artefatos Angular e Node. Não há código ou configuração de testes a migrar.

Este design é necessário pela introdução do framework, ferramentas de build e dependências visuais. As consultas à documentação via Context7 indicam suporte a execução Zoneless e Signals no Angular, integração Tailwind via PostCSS e ícones Standalone no pacote `@lucide/angular`; a compatibilidade exata das versões será verificada antes de instalar.

## Goals / Non-Goals

**Goals:**
- Estabelecer uma aplicação cliente mínima, com instalação reproduzível e comandos previsíveis.
- Manter uma estrutura pequena que possa receber domínio e estado da partida em changes futuras.
- Tornar a primeira página verificável em navegador, sem infraestrutura externa.

**Non-Goals:**
- Criar serviços de estado, modelos ou componentes de tabuleiro antes de existir comportamento que os utilize.
- Adicionar roteamento, SSR, backend, biblioteca global de estado ou sistema de design próprio nesta etapa.
- Fixar regras de Batalha Naval que ainda são propostas da exploração, não decisões confirmadas.

## Decisions

### 1. Aplicação na raiz, gerenciada com npm

Criar `package.json`, lockfile, configuração Angular/TypeScript, `src/` e arquivos públicos na raiz existente. Fixar Angular em 22.2.0 e utilizar ferramentas compatíveis. Documentar a versão de Node suportada pelo conjunto efetivamente instalado.

Preferir a estrutura padrão do CLI compatível, com preservação explícita dos arquivos existentes; não sobrescrever orientações ou configurações para acomodar o scaffold. Um subdiretório de frontend adicionaria navegação sem benefício para este repositório de aplicação única.

### 2. Standalone e Zoneless desde o bootstrap

Usar bootstrap Standalone e a configuração Zoneless suportada pela versão escolhida, sem instalar ou carregar `zone.js`. Signals serão o padrão para estado mutável da aplicação; `computed` será usado para dados derivados quando houver necessidade real. Conteúdo estático desta página pode permanecer estático, sem introduzir estado artificial.

NgModules, detecção baseada em Zone.js e uma biblioteca de store foram descartados por contrariarem a direção do projeto ou ampliarem o escopo desnecessariamente. Nomes de variáveis e métodos autorais serão em português, respeitando convenções TypeScript; APIs e identificadores exigidos pelas ferramentas conservam seus nomes.

### 3. Página inicial pequena e sem navegação simulada

O componente raiz pode compor uma página inicial Standalone em `src/app/`, sem camadas adicionais. Renderizar título, descrição do modo confirmado e mensagem de disponibilidade futura, sem botão habilitado de início. Usar `main`, um único `h1`, idioma `pt-BR` e título de documento apropriado.

Uma tela de preparação ou um botão com comportamento fictício anteciparia o fluxo de partida. A extração de componentes compartilhados ocorrerá quando surgirem usos concretos.

### 4. Tailwind e ícones selecionados

Usar Tailwind CSS com o plugin PostCSS compatível e estilos globais mínimos. Adotar layout de uma coluna, largura máxima de leitura, espaçamento responsivo e contraste adequado. Importar apenas os ícones Lucide necessários pelo pacote Angular compatível, preferencialmente `@lucide/angular`, e marcar os decorativos como ocultos para tecnologias assistivas.

CSS totalmente manual ou outra biblioteca visual não atende à base escolhida. Importar o catálogo completo de ícones acrescentaria peso sem benefício.

### 5. Verificações proporcionais à fundação

Disponibilizar `npm start`, `npm run build` e `npm test -- --watch=false`, com o executor de testes suportado pelo CLI selecionado. A instalação de referência será `npm ci`, usando o lockfile versionado. Não introduzir testes que apenas espelhem texto estático; validar a página no navegador e a configuração com os comandos reais. Se o executor exigir um teste para concluir com sucesso, manter somente uma verificação de bootstrap/renderização, sem criar uma suíte extensa.

Validar as larguras de 360 e 1440 pixels, sem rolagem horizontal, erros no console ou conteúdo cortado. Inspecionar idioma, semântica e ícones decorativos na árvore de acessibilidade. Registrar os resultados na conclusão da implementação.

## Risks / Trade-offs

- [Compatibilidade do Angular 22.2.0 com Node, TypeScript e bibliotecas visuais] → Conferir metadados publicados e requisitos oficiais antes da instalação. Se a versão exigida não estiver disponível ou houver incompatibilidade sem solução compatível, interromper a instalação e consultar o desenvolvedor; não substituir Angular silenciosamente nem forçar conflitos de dependências.
- [Scaffold em diretório existente] → Revisar arquivos gerados e incorporar somente os necessários, preservando o conteúdo anterior e ajustando o README de forma deliberada.
- [Página inicial ainda não jogável] → Comunicar claramente a disponibilidade futura; a implementação da partida pertence a outra change.
- [Estrutura mínima precisará evoluir] → Extrair domínio, estado e componentes nas respectivas fases, evitando abstrações sem uso nesta entrega.

## Migration Plan

1. Verificar compatibilidade das ferramentas e adicionar a base Angular preservando os arquivos existentes.
2. Integrar estilos, ícones e a página inicial.
3. Validar instalação, build, execução de testes e página no navegador.
4. Atualizar o README com comandos confirmados e encerrar esta change antes de iniciar as regras do jogo.

Não há dados ou aplicação anterior a migrar. Em caso de reversão, remover apenas os arquivos introduzidos pela implementação e restaurar as alterações pontuais desta change, preservando alterações externas. Publicação em hospedagem não faz parte desta fase.
