# Proposal

## Why

O repositório ainda não possui aplicação executável, dependências ou documentação de uso. Uma fundação pequena e verificável permitirá desenvolver o jogo Batalha Naval contra o computador em changes incrementais.

## What Changes

- Inicializar a aplicação Angular 22.2.0 na raiz do repositório, com componentes Standalone, execução Zoneless e Signals para estado reativo quando necessário.
- Integrar Tailwind CSS e Lucide Icons em uma página inicial simples e responsiva, em português.
- Apresentar o nome do jogo, o modo contra o computador e a indicação de que as partidas estarão disponíveis em uma próxima etapa.
- Configurar instalação reproduzível, servidor de desenvolvimento, build de produção e execução não interativa de testes.
- Documentar pré-requisitos, comandos e escopo atual no README.
- Manter regras de combate, tabuleiros, posicionamento de navios e adversário automático para changes posteriores.

## Capabilities

### New Capabilities

- `pagina-inicial`: apresentação acessível e responsiva do jogo e da disponibilidade do modo contra o computador.

### Modified Capabilities

Nenhuma. Não existem specs anteriores.

## Impact

- Novos arquivos de aplicação e configuração Angular/TypeScript, estilos globais, manifesto npm e lockfile na raiz.
- Novas dependências Angular, Tailwind CSS, integração PostCSS e pacote Angular do Lucide compatível com a versão adotada.
- Atualização do README e ajustes pontuais no `.gitignore`, somente se necessários para os artefatos gerados.
- Preservação dos arquivos de orientação e configuração OpenSpec/OpenCode existentes.
- Aplicação cliente, sem backend, autenticação, persistência, SSR ou serviços externos nesta entrega.
