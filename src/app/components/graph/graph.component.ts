import { Component, ViewChild } from '@angular/core';
import { SuiModalService, ModalTemplate, TemplateModalConfig } from 'ng2-semantic-ui';

export interface ModalContext {
  message: string;
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  providers: []
})
export class GraphComponent {

  @ViewChild('modalTemplate')
  public modalTemplate: ModalTemplate<ModalContext, string, string>;

  constructor(public modalService: SuiModalService) {}

  showModal() {
    const config = new TemplateModalConfig<ModalContext, string, string>(this.modalTemplate);
    config.closeResult = 'closed!';
    config.context = { message: 'This is the content area!' };
    config.isFullScreen = true;
    this.modalService
      .open(config)
      .onApprove(result => console.log(`Approved: ${result}`))
      .onDeny(result => console.log(`Denied: ${result}`));
  }
}
