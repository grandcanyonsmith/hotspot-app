import { Injector } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LoadingController, ToastController,
  AlertController, IonInfiniteScroll, IonRefresher } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { environment } from 'src/environments/environment';

export abstract class BasePage {

  public isErrorViewVisible: boolean;
  public isEmptyViewVisible: boolean;
  public isContentViewVisible: boolean;
  public isLoadingViewVisible: boolean;

  protected refresher: IonRefresher;
  protected infiniteScroll: IonInfiniteScroll;
  protected navParams: ActivatedRoute;
  protected translate: TranslateService;
  protected router: Router;

  private loader: any;
  private toastCtrl: ToastController;
  private loadingCtrl: LoadingController;
  private alertCtrl: AlertController;

  private activatedRoute: ActivatedRoute;
  private meta: Meta;
  private title: Title;

  private inAppBrowser: InAppBrowser;
  private browserTab: BrowserTab;

  private mCurrentPath: string;

  constructor(injector: Injector) {
    
    this.loadingCtrl = injector.get(LoadingController);
    this.toastCtrl = injector.get(ToastController);
    this.alertCtrl = injector.get(AlertController);
    this.navParams = injector.get(ActivatedRoute);
    this.translate = injector.get(TranslateService);

    this.router = injector.get(Router);
    this.activatedRoute = injector.get(ActivatedRoute);
    this.meta = injector.get(Meta);
    this.title = injector.get(Title);

    this.inAppBrowser = injector.get(InAppBrowser);
    this.browserTab = injector.get(BrowserTab);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mCurrentPath = this.router.url.split('?')[0];
      }
    })
 
  }

  abstract enableMenuSwipe(): boolean;

  public get currentPath(): string {
    return this.mCurrentPath;
  }

  public get appUrl(): string {
    return environment.appUrl;
  }

  public get appImageUrl(): string {
    return environment.appImageUrl;
  }

  public setPageTitle(title: string): void {
    this.title.setTitle(title);
  }

  public async setMetaTags(config1: {
    title?: string,
    description?: string,
    image?: string,
    slug?: string }) {

    const str = await this.getTrans(['APP_NAME', 'APP_DESCRIPTION']);

    const config = {
      title : str.APP_NAME,
      description: str.APP_DESCRIPTION,
      image: this.appImageUrl,
      ...config1
    };

    let url = null;

    if (config.slug) {
      url = this.appUrl + '/' + config.slug
    } else {
      url = this.appUrl + this.currentPath;
    }

    this.meta.updateTag({
      property: 'og:title',
      content: config.title
    });
    this.meta.updateTag({
      property: 'og:description',
      content: config.description
    });
    
    this.meta.updateTag({
      property: 'og:image',
      content: config.image
    });

    this.meta.updateTag({
      property: 'og:image:alt',
      content: config.title
    });

    this.meta.updateTag({
      property: 'og:url',
      content: url
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image'
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: config.title
    });

    this.meta.updateTag({
      name: 'twitter:text:title',
      content: config.title
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: config.image
    });

    this.meta.updateTag({
      name: 'twitter:image:alt',
      content: config.title
    });
  }

  public getShareUrl(slug: string) {
    return this.appUrl + '/' + slug;
  }

  async showLoadingView(params: { showOverlay: boolean }) {

    this.isErrorViewVisible = false;
    this.isEmptyViewVisible = false;
    this.isContentViewVisible = false;
    this.isLoadingViewVisible = true;

    if (params.showOverlay) {
      const loadingText = await this.getTrans('LOADING');

      this.loader = await this.loadingCtrl.create({
        message: loadingText
      });
  
      return await this.loader.present();
    }

    return true;

  }

  async dismissLoadingView() {

    if (!this.loader) return;

    try {
      await this.loader.dismiss()
    } catch (error) {
      console.log('ERROR: LoadingController dismiss', error);
    }
  }

  showContentView() {

    this.isErrorViewVisible = false;
    this.isEmptyViewVisible = false;
    this.isLoadingViewVisible = false;
    this.isContentViewVisible = true;

    this.dismissLoadingView();
  }

  showEmptyView() {

    this.isErrorViewVisible = false;
    this.isLoadingViewVisible = false;
    this.isContentViewVisible = false;
    this.isEmptyViewVisible = true;

    this.dismissLoadingView();
  }

  showErrorView() {

    this.isLoadingViewVisible = false;
    this.isContentViewVisible = false;
    this.isEmptyViewVisible = false;
    this.isErrorViewVisible = true;

    this.dismissLoadingView();
  }

  onRefreshComplete(data = null) {

    if (this.refresher) {
      this.refresher.complete()
    }

    if (this.infiniteScroll) {
      this.infiniteScroll.complete();

      if (data && data.length === 0) {
        this.infiniteScroll.disabled = true;
      } else {
        this.infiniteScroll.disabled = false;
      }
    }
  }

  async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      color: 'primary',
      position: 'bottom',
      duration: 3000
    });

    return await toast.present();
  }

  async showAlert(message: string) {

    const okText = await this.getTrans('OK');

    const alert = await this.alertCtrl.create({
      header: '',
      message: message,
      buttons: [{
        text: okText,
        role: ''
      }]
    });

    return await alert.present();
  }

  async showConfirm(message: string) {

    const trans = await this.getTrans(['OK', 'CANCEL']);

    const confirm = await this.alertCtrl.create({
      header: '',
      message: message,
      buttons: [{
        text: trans.CANCEL,
        role: 'cancel',
      }, {
        text: trans.OK,
        role: ''
      }]
    });

    return await confirm.present();
  }

  async openUrl(url: string) {

    if (!url) return;

    try {
  
      const isAvailable = await this.browserTab.isAvailable();
      
      if (isAvailable) {
        this.browserTab.openUrl(url);
      } else {
        this.inAppBrowser.create(url, '_system');
      }
    } catch (error) {
      this.inAppBrowser.create(url, '_system');
    }
  }

  navigateTo(page: any, queryParams: any = {}) {
    this.router.navigate([page], { queryParams: queryParams });
  }

  getParams() {
    return this.activatedRoute.snapshot.params;
  }

  getQueryParams() {
    return this.activatedRoute.snapshot.queryParams;
  }

  getTrans(key: string | string[]) {
    return this.translate.get(key).toPromise();
  }

}
