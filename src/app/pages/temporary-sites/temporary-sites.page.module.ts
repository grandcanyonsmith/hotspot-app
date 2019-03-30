import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TemporarySitesPage } from './temporary-sites.page';

const routes: Routes = [
  {
    path: '',
    component: TemporarySitesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TemporarySitesPage]
})
export class TemporarySitesPageModule {}
