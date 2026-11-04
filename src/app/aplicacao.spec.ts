import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Aplicacao } from './aplicacao';
import { configuracaoAplicacao } from './aplicacao.config';

describe('Inicialização da aplicação', () => {
  it('renderiza o conteúdo principal com a configuração Zoneless de produção', async () => {
    await TestBed.configureTestingModule({
      imports: [Aplicacao],
      providers: configuracaoAplicacao.providers,
    }).compileComponents();

    const componente = TestBed.createComponent(Aplicacao);
    await componente.whenStable();

    const elemento = componente.nativeElement as HTMLElement;
    expect(elemento.querySelector('main')).not.toBeNull();
    expect(elemento.querySelector('h1')?.textContent?.trim()).toBeTruthy();
  });
});
