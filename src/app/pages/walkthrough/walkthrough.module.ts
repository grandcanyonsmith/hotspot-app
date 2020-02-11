import { NgModule } from '@angular/core';
import { WalkthroughPage } from './walkthrough';
import { SharedModule } from '../../shared.module';
 
@NgModule({
  declarations: [
    WalkthroughPage,
  ],
  imports: [
    SharedModule,
  ],
  entryComponents: [
    WalkthroughPage,
  ]
})
export class WalkthroughPageModule {}
