import { Component, ViewChild } from '@angular/core';
import { SuiModalService, ModalTemplate, TemplateModalConfig } from 'ng2-semantic-ui';
import { DataService } from '../../services/data/data.service';
import { Person, PerformanceTotal, Play, PlaySales, PlayTotal } from '../../types';

export interface ModalContext {
  statistics: {
    label: string;
    value: string | number;
  }[];
}

interface DataPromises {
  loaded: boolean;
  people: Promise<Person[]>;
  performanceTotals: Promise<PerformanceTotal[]>;
  plays: Promise<Play[]>;
  sales: Promise<PlaySales[]>;
  playTotals: Promise<PlayTotal[]>;
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  providers: [DataService]
})
export class GraphComponent {

  @ViewChild('modalTemplate')
  public modalTemplate: ModalTemplate<ModalContext, string, string>;

  private promises: DataPromises;

  private people: Person[];
  private performanceTotals: PerformanceTotal[];
  private plays: Play[];
  private sales: PlaySales[];
  private playTotals: PlayTotal[];

  constructor(public modalService: SuiModalService, private dataService: DataService) {
    this.promises = {
      loaded           : false,
      people           : this.dataService.getPeople(),
      performanceTotals: this.dataService.getPerformanceTotals(),
      plays            : this.dataService.getPlays(),
      playTotals       : this.dataService.getPlayTotals(),
      sales            : this.dataService.getPlaySales()
    };
  }

  async showModal() {
    const err = await this.loadData();
    if (err) return console.log(err);
    const config = new TemplateModalConfig<ModalContext, string, string>(this.modalTemplate);
    config.context = { statistics: [
      { label: 'People', value: this.people.length },
      { label: 'Plays', value: this.plays.length },
      { label: 'Sales Records', value: this.sales.length },
      { label: 'Performances with Totals', value: this.performanceTotals.length },
      { label: 'Plays with Totals', value: this.playTotals.length }
    ]};
    config.isFullScreen = true;
    config.isBasic = true;
    config.isClosable = false;
    this.modalService
      .open(config)
      .onApprove(result => console.log(`Approved: ${result}`))
      .onDeny(result => console.log(`Denied: ${result}`));
  }

  private async loadData() {
    if (this.promises.loaded) return;
    try {
      this.people            = await this.promises.people;
      this.performanceTotals = await this.promises.performanceTotals;
      this.plays             = await this.promises.plays;
      this.sales             = await this.promises.sales;
      this.playTotals        = await this.promises.playTotals;
      this.promises.loaded   = true;
    } catch (e) {
      return e;
    }
  }
}
