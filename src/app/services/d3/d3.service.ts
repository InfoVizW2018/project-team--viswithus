import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as d3 from 'd3';
import { Person } from '../../types';

@Injectable()
export class D3Service {

  constructor(private http: HttpClient) {
  }

  getPeople() {
    return this.http.get<Person[]>('assets/data/people.json');
  }
  
}
