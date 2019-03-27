
import { Component, Injector } from '@angular/core';
import { LocalStorage } from '../../services/local-storage';
import { BasePage } from '../base-page/base-page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'page-walkthrough',
  templateUrl: 'walkthrough.html',
  styleUrls: ['walkthrough.scss']
})
export class WalkthroughPage extends BasePage {

  public slidesOptions = {
    grabCursor: true,
    touchStartPreventDefault: false,
    zoom: false,
  };

  constructor(injector: Injector,
    private modalCtrl: ModalController,
    private storage: LocalStorage) {
    super(injector);
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  async skip() {
    await this.storage.setSkipIntroPage(true);
    this.modalCtrl.dismiss();
  }

}
