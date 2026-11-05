import {
  COMPRIMENTOS_FROTA,
  criarCampo,
  criarCoordenada,
  prepararCenario,
  posicionarNavio,
} from '../regras';
import type { Campo, Coordenada, TipoNavio } from '../regras';

export function criarCenarioCompleto() {
  const tipos: readonly TipoNavio[] = ['porta-avioes', 'encouracado', 'cruzador', 'submarino', 'destroier'];
  const criarFrota = (): Campo => {
    let campo = criarCampo();
    tipos.forEach((tipo, indice) => {
      const posicoes = Array.from({ length: COMPRIMENTOS_FROTA[tipo] }, (_, passo) => {
        const resultado = criarCoordenada(indice * 2, passo);
        if (!resultado.valida) throw new Error('Coordenada de teste inválida');
        return resultado.coordenada;
      });
      const resultado = posicionarNavio(campo, { id: tipo, tipo, posicoes });
      if (!resultado.aceito) throw new Error(`Falha ao posicionar ${tipo}`);
      campo = resultado.campo;
    });
    return campo;
  };

  const resultado = prepararCenario(criarFrota(), criarFrota());
  if (!resultado.aceito) throw new Error('Falha ao preparar cenário de teste');
  return resultado.cenario;
}

export function criarCoordenadasDeAgua(campo: Campo): Coordenada[] {
  const ocupadas = new Set(campo.navios.flatMap((navio) => navio.posicoes.map(({ linha, coluna }) => `${linha}:${coluna}`)));
  return Array.from({ length: 100 }, (_, indice) => ({
    linha: Math.floor(indice / 10),
    coluna: indice % 10,
  })).filter(({ linha, coluna }) => !ocupadas.has(`${linha}:${coluna}`));
}
