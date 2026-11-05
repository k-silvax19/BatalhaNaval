import { Component } from '@angular/core';
import { LucideAnchor, LucideRadar, LucideWaves } from '@lucide/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LucideAnchor, LucideRadar, LucideWaves],
  templateUrl: './aplicacao.html',
})
export class Aplicacao {}
