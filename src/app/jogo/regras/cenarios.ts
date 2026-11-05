import { congelarProfundamente } from './imutabilidade';
import { validarCampoCompleto } from './campos';
import type { Campo, ResultadoCenario } from './modelos';

export function prepararCenario(campoJogador: Campo, campoComputador: Campo): ResultadoCenario {
  if (!validarCampoCompleto(campoJogador).valido) {
    return congelarProfundamente({ aceito: false, motivo: 'campo-jogador-invalido' });
  }
  if (!validarCampoCompleto(campoComputador).valido) {
    return congelarProfundamente({ aceito: false, motivo: 'campo-computador-invalido' });
  }

  const cenario = congelarProfundamente({
    campoJogador: copiarCampo(campoJogador),
    campoComputador: copiarCampo(campoComputador),
  });
  return congelarProfundamente({ aceito: true, cenario });
}

function copiarCampo(campo: Campo): Campo {
  return {
    navios: campo.navios.map((navio) => ({
      id: navio.id,
      tipo: navio.tipo,
      posicoes: navio.posicoes.map(({ linha, coluna }) => ({ linha, coluna })),
    })),
    ataques: campo.ataques.map(({ linha, coluna }) => ({ linha, coluna })),
  };
}
