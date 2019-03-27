
import { Component, Injector } from '@angular/core';
import { LocalStorage } from '../../services/local-storage';
import { BasePage } from '../base-page/base-page';
import { Preference } from '../../services/preference';
import { ModalController } from '@ionic/angular';
import { WalkthroughPage } from '../walkthrough/walkthrough';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  styleUrls: ['settings.scss']
})
export class SettingsPage extends BasePage {

  constructor(injector: Injector,
    private modalCtrl: ModalController,
    private storage: LocalStorage, 
    public preference: Preference) {

    super(injector);
  }

  enableMenuSwipe() {
    return true;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
  }

  onChangeUnit(event: CustomEvent) {

    if (!event) return;

    const unit = event.detail.value;

    this.storage.setUnit(unit);
    this.preference.unit = unit;
  }

  onChangeLang(event: CustomEvent) {

    if (!event) return;

    const lang = event.detail.value;

    if (lang === 'ar') {
      document.dir = 'rtl';
    } else {
      document.dir = 'ltr';
    }

    this.storage.setLang(lang);
    this.translate.use(lang);
    this.preference.lang = lang;
  }

  async presentWalkthroughModal() {
    const modal = await this.modalCtrl.create({
      component: WalkthroughPage
    })
    return await modal.present();
  }

}
