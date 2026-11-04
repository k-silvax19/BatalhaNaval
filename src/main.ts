import { bootstrapApplication } from '@angular/platform-browser';
import { Aplicacao } from './app/aplicacao';
import { configuracaoAplicacao } from './app/aplicacao.config';

bootstrapApplication(Aplicacao, configuracaoAplicacao).catch((erro: unknown) =>
  console.error(erro),
);
