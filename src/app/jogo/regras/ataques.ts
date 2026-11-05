import { ehCoordenadaValida } from './coordenadas';
import { congelarProfundamente } from './imutabilidade';
import type { Campo, Coordenada, ResultadoAplicacaoAtaque, ResultadoAtaque } from './modelos';

export function aplicarAtaque(campo: Campo, coordenada: Coordenada): ResultadoAplicacaoAtaque {
  if (!ehCoordenadaValida(coordenada)) {
    return congelarProfundamente({ aceito: false, motivo: 'coordenada-invalida' });
  }

  const chave = chaveCoordenada(coordenada);
  if (campo.ataques.some((ataque) => chaveCoordenada(ataque) === chave)) {
    return congelarProfundamente({ aceito: false, motivo: 'ataque-repetido' });
  }

  const navioAtingido = campo.navios.find((navio) =>
    navio.posicoes.some((posicao) => chaveCoordenada(posicao) === chave));
  const ataques = [...campo.ataques, { linha: coordenada.linha, coluna: coordenada.coluna }];
  let resultado: ResultadoAtaque;

  if (!navioAtingido) {
    resultado = { tipo: 'agua' };
  } else {
    const posicoesAtingidas = navioAtingido.posicoes.filter((posicao) =>
      ataques.some((ataque) => chaveCoordenada(ataque) === chaveCoordenada(posicao)));
    resultado = posicoesAtingidas.length === navioAtingido.posicoes.length
      ? { tipo: 'navio-afundado', navioId: navioAtingido.id, tipoNavio: navioAtingido.tipo }
      : { tipo: 'acerto', navioId: navioAtingido.id, tipoNavio: navioAtingido.tipo };
  }

  const frotaDerrotada = campo.navios.length > 0 && campo.navios.every((navio) =>
    navio.posicoes.every((posicao) => ataques.some((ataque) => chaveCoordenada(ataque) === chaveCoordenada(posicao))));
  const novoCampo = congelarProfundamente({
    navios: campo.navios.map((navio) => ({
      id: navio.id,
      tipo: navio.tipo,
      posicoes: navio.posicoes.map(({ linha, coluna }) => ({ linha, coluna })),
    })),
    ataques,
  });

  return congelarProfundamente({ aceito: true, campo: novoCampo, resultado, frotaDerrotada });
}

function chaveCoordenada({ linha, coluna }: Coordenada): string {
  return `${linha}:${coluna}`;
}
