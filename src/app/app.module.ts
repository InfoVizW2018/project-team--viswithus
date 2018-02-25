import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NavComponent } from './components/nav/nav.component';
import { Routes, RouterModule } from '@angular/router';
import { GraphComponent } from './components/graph/graph.component';
import { ModalComponent } from './components/modal/modal.component';

const routes: Routes = [
  { path: 'home', component: GraphComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    GraphComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {
      enableTracing: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
