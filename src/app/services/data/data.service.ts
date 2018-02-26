import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Person, PerformanceTotal, PlaySales, PlayTotal, Play } from '../../types';

const ROOT = 'assets/data';

const PATHS = {
  people                 : `${ROOT}/people.json`,
  performance_with_totals: `${ROOT}/performance_with_totals.json`,
  play_ticket_sales      : `${ROOT}/play_ticket_sales.json`,
  plays_with_totals      : `${ROOT}/plays_with_totals.json`,
  plays                  : `${ROOT}/plays.json`
};

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  getPeople() {
    return this.getFile<Person[]>(PATHS.people);
  }

  getPerformanceTotals() {
    return this.getFile<PerformanceTotal[]>(PATHS.performance_with_totals);
  }

  getPlaySales() {
    return this.getFile<PlaySales[]>(PATHS.play_ticket_sales);
  }

  getPlayTotals() {
    return this.getFile<PlayTotal[]>(PATHS.plays_with_totals);
  }

  getPlays() {
    return this.getFile<Play[]>(PATHS.plays);
  }

  private getFile<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => this.http.get<T>(path).subscribe(resolve, reject));
  }

}
