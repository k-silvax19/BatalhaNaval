export { aplicarAtaque } from './ataques';
export { COMPRIMENTOS_FROTA, criarCampo, posicionarNavio, validarCampoCompleto } from './campos';
export { prepararCenario } from './cenarios';
export { criarCoordenada, DIMENSAO_TABULEIRO, ehCoordenadaValida } from './coordenadas';
export type {
  Campo,
  CenarioPreparado,
  Coordenada,
  MotivoAtaqueRejeitado,
  Navio,
  RejeicaoPosicionamento,
  ResultadoAplicacaoAtaque,
  ResultadoAtaque,
  ResultadoCenario,
  ResultadoPosicionamento,
  ResultadoValidacaoCampo,
  TipoNavio,
} from './modelos';
