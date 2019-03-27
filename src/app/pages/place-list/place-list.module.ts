import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlaceListPage } from './place-list';
import { SharedModule } from '../../shared.module'; 
import { SignInPageModule } from '../sign-in/sign-in.module';
@NgModule({
  declarations: [
    PlaceListPage,
  ],
  imports: [
    SharedModule,
    SignInPageModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlaceListPage
      }
    ])
  ]
})
export class PlaceListPageModule {}
