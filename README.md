# Batalha Naval

Jogo de estratégia naval em desenvolvimento, com foco em partidas de um jogador contra o computador, diretamente no navegador.

## Pré-requisitos

- Node.js `^22.22.3`, `^24.15.0` ou `>=26.0.0`, conforme os requisitos do Angular 22.2.0.
- npm (ambiente verificado com Node.js **24.21.0** e npm **11.19.0**).

## Instalação e execução

Na raiz do repositório:

```sh
npm ci
npm start
```

Acesse **http://localhost:4200/**. O servidor atualiza a página ao alterar os arquivos da aplicação. Para encerrá-lo, pressione `Ctrl+C` no terminal.

## Build e testes

```sh
# Build de produção
npm run build

# Testes em execução única
npm test -- --watch=false

# Testes durante o desenvolvimento
npm test
```

O build gera os arquivos estáticos em `dist/batalha-naval/browser/`. Os testes usam Vitest com jsdom pelo builder do Angular e incluem uma verificação mínima da renderização com a configuração Zoneless.

## Base técnica

- Angular **22.2.0**, componentes Standalone e execução Zoneless, sem `zone.js`.
- TypeScript **6.0**, com verificações estritas.
- Tailwind CSS **4** via PostCSS para estilos responsivos.
- Lucide Angular com importação individual de ícones.
- Signals como convenção para estado reativo e `computed` para valores derivados quando necessário. A página estática inicial não precisa de estado mutável.
- Nomes de métodos e variáveis autorais e textos de interface em português.

## Estrutura

```text
src/
  app/             Componente raiz e configuração da aplicação
  main.ts          Bootstrap Standalone
  index.html       Documento em português do Brasil
  styles.css       Estilos globais
public/            Arquivos estáticos
openspec/          Planejamento e especificações por change
```

## Escopo atual

Esta versão entrega somente a fundação técnica e uma página inicial responsiva que apresenta o modo jogador contra computador. **Ainda não é possível iniciar ou jogar uma partida.**

Não fazem parte desta etapa:

- tabuleiros e coordenadas;
- posicionamento de navios;
- ataques, turnos e condições de vitória;
- estratégia do adversário automático;
- persistência de partidas.

## Próximas fases

1. Modelar e testar as regras do jogo.
2. Entregar uma partida completa contra o computador com posicionamento automático.
3. Adicionar posicionamento manual da frota.
4. Refinar acessibilidade, responsividade e experiência da partida.

Regras citadas durante a exploração inicial, como tabuleiro 10 x 10, composição da frota, permissão de navios adjacentes e comportamento dos turnos, continuam sendo propostas. Elas deverão ser confirmadas e especificadas antes da implementação do jogo.
