import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { InfoWindowComponent } from './info-window/info-window';
import { TranslateModule } from '@ngx-translate/core';
import { StarRatingModule } from 'angular-star-rating';
import { UploadBoxComponent } from './upload-box/upload-box.component';

@NgModule({
	declarations: [
		InfoWindowComponent,
		UploadBoxComponent
	],
	entryComponents: [
		InfoWindowComponent
	],
	imports: [
		CommonModule,
		IonicModule,
		RouterModule,
		TranslateModule,
		StarRatingModule
	],
	exports: [
		InfoWindowComponent,
		UploadBoxComponent
	]
})
export class ComponentsModule {}
