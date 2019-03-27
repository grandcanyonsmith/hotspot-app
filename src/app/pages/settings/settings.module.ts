import { NgModule } from '@angular/core';
import { SettingsPage } from './settings';
import { SharedModule } from '../../shared.module';
import { WalkthroughPageModule } from '../walkthrough/walkthrough.module';
 
@NgModule({
  declarations: [
    SettingsPage,
  ],
  imports: [
    SharedModule,
    WalkthroughPageModule,
  ],
  entryComponents: [
    SettingsPage
  ]
})
export class SettingsPageModule {}
