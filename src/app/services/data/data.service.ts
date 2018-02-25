import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  getFile(name: string) {
    return this.http.get(name);
  }

}
