import { Component } from '@angular/core';
import { D3Service } from './services/d3/d3.service';
import { Person } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: []
})
export class AppComponent {
  
  showButton = true;
  people: Person[];

  constructor(private _d3: D3Service) { }

  handleClick() {
    this._d3.getPeople().subscribe(data => this.people = data);
    this.showButton = false;
  }
}
