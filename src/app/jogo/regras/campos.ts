import { ehCoordenadaValida } from './coordenadas';
import { congelarProfundamente } from './imutabilidade';
import type {
  Campo,
  Coordenada,
  Navio,
  ResultadoPosicionamento,
  ResultadoValidacaoCampo,
  TipoNavio,
} from './modelos';

export const COMPRIMENTOS_FROTA: Readonly<Record<TipoNavio, number>> = Object.freeze({
  'porta-avioes': 5,
  encouracado: 4,
  cruzador: 3,
  submarino: 3,
  destroier: 2,
});

const TIPOS_NAVIO = Object.keys(COMPRIMENTOS_FROTA) as TipoNavio[];

export function criarCampo(): Campo {
  return congelarProfundamente({ navios: [], ataques: [] });
}

export function posicionarNavio(campo: Campo, navio: Navio): ResultadoPosicionamento {
  if (!TIPOS_NAVIO.includes(navio.tipo) || navio.posicoes.length !== COMPRIMENTOS_FROTA[navio.tipo]) {
    return congelarProfundamente({ aceito: false, motivo: 'comprimento-invalido' });
  }
  if (!navio.id.trim() || campo.navios.some((existente) => existente.id === navio.id)) {
    return congelarProfundamente({ aceito: false, motivo: 'id-duplicado' });
  }
  if (campo.navios.some((existente) => existente.tipo === navio.tipo)) {
    return congelarProfundamente({ aceito: false, motivo: 'tipo-duplicado' });
  }

  const validacao = validarPosicoes(navio.posicoes);
  if (validacao !== true) return congelarProfundamente({ aceito: false, motivo: validacao });

  const ocupadas = new Set(campo.navios.flatMap((existente) => existente.posicoes.map(chaveCoordenada)));
  if (navio.posicoes.some((posicao) => ocupadas.has(chaveCoordenada(posicao)))) {
    return congelarProfundamente({ aceito: false, motivo: 'sobreposicao' });
  }

  const novoNavio = congelarProfundamente({
    id: navio.id,
    tipo: navio.tipo,
    posicoes: navio.posicoes.map(({ linha, coluna }) => ({ linha, coluna })),
  });
  const novoCampo = congelarProfundamente({
    navios: [...campo.navios, novoNavio],
    ataques: [...campo.ataques],
  });
  return congelarProfundamente({ aceito: true, campo: novoCampo });
}

export function validarCampoCompleto(campo: Campo): ResultadoValidacaoCampo {
  const contagem = new Map<TipoNavio, number>();
  const ids = new Set<string>();
  const ocupadas = new Set<string>();

  for (const navio of campo.navios) {
    if (ids.has(navio.id) || contagem.has(navio.tipo)) {
      return Object.freeze({ valido: false, motivo: 'frota-duplicada' });
    }
    ids.add(navio.id);
    contagem.set(navio.tipo, 1);

    if (!TIPOS_NAVIO.includes(navio.tipo) || navio.posicoes.length !== COMPRIMENTOS_FROTA[navio.tipo]
      || validarPosicoes(navio.posicoes) !== true) {
      return Object.freeze({ valido: false, motivo: 'campo-invalido' });
    }
    for (const posicao of navio.posicoes) {
      const chave = chaveCoordenada(posicao);
      if (ocupadas.has(chave)) return Object.freeze({ valido: false, motivo: 'campo-invalido' });
      ocupadas.add(chave);
    }
  }

  if (TIPOS_NAVIO.some((tipo) => !contagem.has(tipo))) {
    return Object.freeze({ valido: false, motivo: 'frota-incompleta' });
  }
  return Object.freeze({ valido: true });
}

function validarPosicoes(posicoes: readonly Coordenada[]): true | 'coordenada-invalida' | 'fora-do-tabuleiro' | 'posicao-irregular' {
  if (posicoes.length === 0) return 'posicao-irregular';
  if (posicoes.some((posicao) => typeof posicao !== 'object' || posicao === null)) return 'coordenada-invalida';
  if (posicoes.some((posicao) => !ehCoordenadaValida(posicao))) return 'fora-do-tabuleiro';

  const chaves = posicoes.map(chaveCoordenada);
  if (new Set(chaves).size !== chaves.length) return 'posicao-irregular';

  const mesmaLinha = posicoes.every(({ linha }) => linha === posicoes[0].linha);
  const mesmaColuna = posicoes.every(({ coluna }) => coluna === posicoes[0].coluna);
  if (!mesmaLinha && !mesmaColuna) return 'posicao-irregular';

  const valores = posicoes.map(({ linha, coluna }) => mesmaLinha ? coluna : linha).sort((a, b) => a - b);
  return valores.every((valor, indice) => indice === 0 || valor === valores[indice - 1] + 1)
    ? true
    : 'posicao-irregular';
}

function chaveCoordenada({ linha, coluna }: Coordenada): string {
  return `${linha}:${coluna}`;
}
