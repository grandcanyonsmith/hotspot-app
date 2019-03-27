import { Component } from '@angular/core';
import { Platform, Events, AlertController, ToastController, LoadingController, ModalController, Config } from '@ionic/angular';
import { HeaderColor } from '@ionic-native/header-color/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import * as Parse from 'parse';
import { LocalStorage } from './services/local-storage';
import { User } from './services/user-service';
import { Installation } from './services/installation';
import { WindowRef } from './services/window-ref';
import { Router, NavigationEnd } from '@angular/router';
import { Preference } from './services/preference';
import { Category } from './services/categories';
import { Slide } from './services/slide';
import { Place } from './services/place-service';
import { Review } from './services/review-service';
import { Post } from './services/post';
import { WalkthroughPage } from './pages/walkthrough/walkthrough';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  private user: User;
  private objWindow: any;
  private loader: any;
  private currentUrl: string;
  
  constructor(private platform: Platform,
    private router: Router,
    private storage: LocalStorage,
    private preference: Preference,
    private events: Events,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private userService: User,
    private windowRef: WindowRef,
    private installationService: Installation,
    private headerColor: HeaderColor,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService) {

    this.initializeApp();
  }

  async initializeApp() {

    if (this.platform.is('desktop')) {
      const config = new Config;
      config.set('rippleEffect', false);
      config.set('animated', false);
    }

    this.subscribeToRouterChanges();

    this.objWindow = this.windowRef.nativeWindow;

    this.setupParse();
    this.setupDefaults();
    this.setupEvents();

    await this.platform.ready();
    this.setupPush();
    this.setupAndroidHeaderColor();
    this.setupStatusBar();
    this.splashScreen.hide();
  }

  async setupDefaults() {

    this.translate.setDefaultLang(environment.defaultLang);

    try {
      let lang = await this.storage.getLang() || environment.defaultLang;

      if (lang === 'ar') {
        document.dir = 'rtl';
      } else {
        document.dir = 'ltr';
      }

      await this.storage.setLang(lang);
      this.translate.use(lang);
      this.preference.lang = lang; 
    } catch (error) {
      console.log(error);
    }

    try {
      const unit = await this.storage.getUnit() || environment.defaultUnit;
      await this.storage.setUnit(unit);
      this.preference.unit = unit;
    } catch (error) {
      console.log(error);
    }

  }

  subscribeToRouterChanges() {
    
    this.router.events.subscribe(async (event) => {
      
      if (event instanceof NavigationEnd) {

        // Show the Walkthrought Modal only if the user is in homepage
        // and no previous page exists.
        
        if (this.router.url === '/1/home' && !this.currentUrl) {
          
          try {
      
            const skipIntro = await this.storage.getSkipIntroPage();
      
            if (!skipIntro) {
              this.presentWalkthroughModal();
            }
      
          } catch (error) {
            console.log(error);
          }
        }

        this.currentUrl = this.router.url;
      }
    })

  }

  setupEvents() {
    
    this.events.subscribe('user:login', (user) => {
      this.user = user;
      this.loadCurrentUser();
      this.updateInstallation();
    });

    this.events.subscribe('user:logout', () => {
      this.onLogOut();
    });
  }

  loadCurrentUser() {
    this.user = User.getCurrent();
    if (this.user) this.user.fetch();
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  setupParse() {
    Slide.getInstance();
    Post.getInstance();
    Review.getInstance();
    Place.getInstance();
    Category.getInstance();
    User.getInstance();

    Parse.initialize(environment.appId);
    (Parse as any).serverURL = environment.serverUrl;

    if (!this.platform.is('hybrid')) {
      // Load the Facebook API asynchronous when the window starts loading

      this.objWindow.fbAsyncInit = function() {
        Parse.FacebookUtils.init({
          appId: environment.fbId,
          cookie: true,
          xfbml: true, 
          version: 'v1.0'
        });
      };

      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }

    this.loadCurrentUser();
  }

  setupStatusBar() {
    if (this.platform.is('ios')) {
      this.statusBar.overlaysWebView(true);
      this.statusBar.styleDefault();
    } else {
      this.statusBar.backgroundColorByHexString(environment.androidHeaderColor);
    }
  }

  setupAndroidHeaderColor() {
    if (environment.androidHeaderColor && this.platform.is('android')) {
      this.headerColor.tint(environment.androidHeaderColor);
    }
  }

  setupPush() {

    this.objWindow = this.windowRef.nativeWindow;

    if (this.objWindow.ParsePushPlugin) {

      this.objWindow.ParsePushPlugin.resetBadge();

      this.platform.resume.subscribe(() => {      
        this.objWindow.ParsePushPlugin.resetBadge();
      });

      this.objWindow.ParsePushPlugin.on('receivePN', (pn) => {
        console.log('[receivePn] Push notification:' + JSON.stringify(pn));
        this.showNotification(pn);
        this.objWindow.ParsePushPlugin.resetBadge();
      });

      this.objWindow.ParsePushPlugin.on('openPN', (pn) => {
        console.log('Notification:' + JSON.stringify(pn));
        this.objWindow.ParsePushPlugin.resetBadge();
      });

      this.updateInstallation();
    }
  }

  async updateInstallation() {

    try {

      if (this.objWindow.ParsePushPlugin) {

        const user = this.user ? this.user.toPointer() : null;
  
        const id = this.objWindow.ParsePushPlugin.getInstallationObjectId();
        const res = await this.installationService.save(id, { user: user })
        console.log('Installation updated', res);
      }
      
    } catch (error) {
      console.log(error);
    }
    
  }

  async presentWalkthroughModal() {
    const modal = await this.modalCtrl.create({
      component: WalkthroughPage
    })
    return await modal.present();
  }

  async showNotification(notification: any) {
    const trans = await this.translate.get(['NOTIFICATION', 'OK']).toPromise();
    this.showAlert(trans.NOTIFICATION, notification.alert, trans.OK);
  }

  async showAlert(title: string = '', message: string = '', okText: string = 'OK') {
    let alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [okText],
    });
    return await alert.present();
  }

  async showToast(message: string = '') {
    
    let alert = await this.toastCtrl.create({
      message: message,
      duration: 3000
    });

    return await alert.present();
  }

  async showLoadingView() {

    const loadingText = await this.translate.get('LOADING').toPromise();

    this.loader = await this.loadingCtrl.create({
      message: loadingText
    });

    return await this.loader.present();
  }

  async dismissLoadingView() {

    if (!this.loader) return;

    try {
      await this.loader.dismiss()
    } catch (error) {
      console.log('ERROR: LoadingController dismiss', error);
    }
  }

  async onLogOut () {

    try {
      await this.showLoadingView();
      await this.userService.logout();
      this.events.publish('user:loggedOut');
      this.user = null;
      this.goTo('/');
      this.translate.get('LOGGED_OUT').subscribe(str => this.showToast(str));
      this.dismissLoadingView();
      this.updateInstallation();
    } catch (err) {
      console.log(err.message);
      this.dismissLoadingView();
    }

  }

}
