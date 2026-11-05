import {
  COMPRIMENTOS_FROTA,
  DIMENSAO_TABULEIRO,
  criarCampo,
  posicionarNavio,
  prepararCenario,
  validarCampoCompleto,
} from '../regras';
import type { Campo, CenarioPreparado, Coordenada, Navio, TipoNavio } from '../regras';

export type FonteEscolhas = () => number;

const TIPOS_POR_COMPRIMENTO = (Object.keys(COMPRIMENTOS_FROTA) as TipoNavio[])
  .sort((tipoA, tipoB) => COMPRIMENTOS_FROTA[tipoB] - COMPRIMENTOS_FROTA[tipoA]);
const LIMITE_BUSCA = 25_000;

const POSICOES_RESERVA: Readonly<Record<TipoNavio, readonly Coordenada[]>> = Object.freeze({
  'porta-avioes': Object.freeze(Array.from({ length: 5 }, (_, coluna) => Object.freeze({ linha: 0, coluna }))),
  encouracado: Object.freeze(Array.from({ length: 4 }, (_, coluna) => Object.freeze({ linha: 2, coluna }))),
  cruzador: Object.freeze(Array.from({ length: 3 }, (_, coluna) => Object.freeze({ linha: 4, coluna }))),
  submarino: Object.freeze(Array.from({ length: 3 }, (_, coluna) => Object.freeze({ linha: 6, coluna }))),
  destroier: Object.freeze(Array.from({ length: 2 }, (_, coluna) => Object.freeze({ linha: 8, coluna }))),
});

/** Gera uma frota completa; a fonte opcional torna a disposição reproduzível nos testes. */
export function gerarCampoAleatorio(fonteEscolhas: FonteEscolhas = Math.random): Campo {
  const candidatos = new Map<TipoNavio, readonly Navio[]>();
  for (const tipo of TIPOS_POR_COMPRIMENTO) {
    candidatos.set(tipo, embaralhar(enumerarNavios(tipo), fonteEscolhas));
  }

  let tentativas = 0;
  const campoGerado = buscarPosicionamentos(criarCampo(), 0, candidatos, fonteEscolhas, () => {
    tentativas += 1;
    return tentativas <= LIMITE_BUSCA;
  });
  const campo = campoGerado ?? criarCampoDeReserva();
  const validacao = validarCampoCompleto(campo);
  if (!validacao.valido) {
    throw new Error(`A preparação automática produziu um campo inválido: ${validacao.motivo}`);
  }
  return campo;
}

/** Gera campos distintos para os participantes e um cenário aceito pelas regras do jogo. */
export function prepararPartidaAutomatica(fonteEscolhas: FonteEscolhas = Math.random): CenarioPreparado {
  const campoJogador = gerarCampoAleatorio(fonteEscolhas);
  const campoComputador = gerarCampoAleatorio(fonteEscolhas);
  const resultado = prepararCenario(campoJogador, campoComputador);
  if (!resultado.aceito) {
    throw new Error(`Não foi possível preparar o cenário automático: ${resultado.motivo}`);
  }
  return resultado.cenario;
}

function enumerarNavios(tipo: TipoNavio): Navio[] {
  const candidatos: Navio[] = [];
  const comprimento = COMPRIMENTOS_FROTA[tipo];
  const maximoInicial = DIMENSAO_TABULEIRO - comprimento;

  for (let linha = 0; linha < DIMENSAO_TABULEIRO; linha += 1) {
    for (let inicio = 0; inicio <= maximoInicial; inicio += 1) {
      candidatos.push({
        id: tipo,
        tipo,
        posicoes: Array.from({ length: comprimento }, (_, deslocamento) => ({ linha, coluna: inicio + deslocamento })),
      });
    }
  }

  for (let coluna = 0; coluna < DIMENSAO_TABULEIRO; coluna += 1) {
    for (let inicio = 0; inicio <= maximoInicial; inicio += 1) {
      candidatos.push({
        id: tipo,
        tipo,
        posicoes: Array.from({ length: comprimento }, (_, deslocamento) => ({ linha: inicio + deslocamento, coluna })),
      });
    }
  }

  return candidatos;
}

function embaralhar<T>(valores: readonly T[], fonteEscolhas: FonteEscolhas): T[] {
  const resultado = [...valores];
  for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
    const valor = fonteEscolhas();
    if (!Number.isFinite(valor) || valor < 0 || valor >= 1) {
      throw new RangeError('A fonte de escolhas deve retornar um número finito no intervalo [0, 1).');
    }
    const indiceAleatorio = Math.floor(valor * (indice + 1));
    [resultado[indice], resultado[indiceAleatorio]] = [resultado[indiceAleatorio], resultado[indice]];
  }
  return resultado;
}

function buscarPosicionamentos(
  campo: Campo,
  indiceTipo: number,
  candidatos: ReadonlyMap<TipoNavio, readonly Navio[]>,
  fonteEscolhas: FonteEscolhas,
  permitirTentativa: () => boolean,
): Campo | undefined {
  if (indiceTipo === TIPOS_POR_COMPRIMENTO.length) return campo;
  const tipo = TIPOS_POR_COMPRIMENTO[indiceTipo];
  const opcoes = candidatos.get(tipo);
  if (!opcoes) throw new Error(`Não existem posições candidatas para o navio ${tipo}.`);

  // Rotacionar também depende da fonte injetada: com uma fonte constante a geração ainda termina.
  const escolha = fonteEscolhas();
  if (!Number.isFinite(escolha) || escolha < 0 || escolha >= 1) {
    throw new RangeError('A fonte de escolhas deve retornar um número finito no intervalo [0, 1).');
  }
  const inicio = Math.floor(escolha * opcoes.length);

  for (let deslocamento = 0; deslocamento < opcoes.length; deslocamento += 1) {
    if (!permitirTentativa()) return undefined;
    const navio = opcoes[(inicio + deslocamento) % opcoes.length];
    const posicionamento = posicionarNavio(campo, navio);
    if (!posicionamento.aceito) continue;

    const resultado = buscarPosicionamentos(
      posicionamento.campo,
      indiceTipo + 1,
      candidatos,
      fonteEscolhas,
      permitirTentativa,
    );
    if (resultado) return resultado;
  }
  return undefined;
}

function criarCampoDeReserva(): Campo {
  let campo = criarCampo();
  for (const tipo of TIPOS_POR_COMPRIMENTO) {
    const resultado = posicionarNavio(campo, {
      id: tipo,
      tipo,
      posicoes: POSICOES_RESERVA[tipo],
    });
    if (!resultado.aceito) {
      throw new Error(`A disposição de reserva do navio ${tipo} é inválida: ${resultado.motivo}`);
    }
    campo = resultado.campo;
  }
  return campo;
}
