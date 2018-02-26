import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  routes = [{
    path: '/home',
    name: 'Home'
  }];

  constructor() { }

}
