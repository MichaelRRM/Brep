import { Component } from '@angular/core';
import { SiteSelectorComponent } from './components/site-selector.component';
import { SolarProductionComponent } from './components/solar-production.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SiteSelectorComponent, SolarProductionComponent],
  templateUrl: './app.html',
})
export class App {}
