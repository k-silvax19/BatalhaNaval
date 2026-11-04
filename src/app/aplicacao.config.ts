import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

export const configuracaoAplicacao: ApplicationConfig = {
  providers: [provideZonelessChangeDetection()],
};
