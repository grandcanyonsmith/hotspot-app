
import { Component, Injector } from '@angular/core';
import { Events, ModalController, Platform } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { User } from '../../services/user-service';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { SignUpPage } from '../sign-up/sign-up';

@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html',
  styleUrls: ['sign-in.scss']
})
export class SignInPage extends BasePage {

  public form: FormGroup;
  public isLoadingByUsername: boolean = false;
  public isLoadingByFacebook: boolean = false;

  constructor(injector: Injector,
    private platform: Platform,
    private modalCtrl: ModalController,
    private events: Events,
    private userService: User,
    private fb: Facebook) {
    super(injector);
  }

  ngOnInit() {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.events.subscribe('user:login', () => {
      this.onDismiss();
    });
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  onDismiss() {
    return this.modalCtrl.dismiss();
  }

  onFacebookButtonTouched() {

    if (this.platform.is('hybrid')) {
      this.fb.login(['public_profile'])
      .then((res: FacebookLoginResponse) => this.loggedIntoFacebook(res))
      .catch(e => console.log('Error logging into Facebook', e));
    } else if (this.platform.is('pwa')) {
      this.translate.get('ERROR_FACEBOOK_PWA').subscribe(str => this.showAlert(str));
    } else {
      this.userService.loginViaFacebook()
      .then((user: User) => this.loggedViaFacebook(user))
      .catch(e => console.log('Error logging into Facebook', e));
    }
    
  }

  async loggedIntoFacebook(res: FacebookLoginResponse) {

    let expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + res.authResponse.expiresIn);
    
    let expirationDateFormatted = expirationDate.toISOString();
 
    var facebookAuthData = {
      id: res.authResponse.userID,
      access_token: res.authResponse.accessToken,
      expiration_date: expirationDateFormatted
    };

    try {

      await this.showLoadingView({ showOverlay: false });
      this.isLoadingByFacebook = true;
      
      const user = await this.userService.linkWith('facebook', {
        authData: facebookAuthData
      });

      this.loggedViaFacebook(user);
      this.isLoadingByFacebook = false;
      
    } catch (error) {
      this.loginViaFacebookFailure(error);
      this.isLoadingByFacebook = false;
    }
    
  }

  loginViaFacebookFailure(error: any = {}) {
    console.log('Error logging into Facebook', error);
    this.translate.get('ERROR_UNKNOWN').subscribe(str => this.showToast(str));
    this.showContentView();
  }

  loggedViaFacebook(user: User) {
    this.showContentView();

    const transParams = { username: user.attributes.name };
    
    this.translate.get('LOGGED_IN_AS', transParams)
      .subscribe(str => this.showToast(str));

    this.events.publish('user:login', user);

    this.onDismiss();
  }

  async onSubmit() {

    try {

      if (this.form.invalid) {
        const message = await this.getTrans('INVALID_FORM');
        return this.showToast(message);
      }

      await this.showLoadingView({ showOverlay: false });
      this.isLoadingByUsername = true;

      let user = await this.userService.signIn(this.form.value);

      this.showContentView();
      this.isLoadingByUsername = false;

      const transParams = { username: user.name };
      this.translate.get('LOGGED_IN_AS', transParams)
        .subscribe(str => this.showToast(str));

      this.events.publish('user:login', user);

      this.onDismiss();

    } catch (err) {

      if (err.code === 101) {
        this.translate.get('INVALID_CREDENTIALS')
        .subscribe(str => this.showToast(str));
      } else {
        this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));
      }

      this.showContentView();
      this.isLoadingByUsername = false;
    }
  }

  async onPresentForgotPasswordModal() {
    const modal = await this.modalCtrl.create({
      component: ForgotPasswordPage
    });

    return await modal.present();
  }

  async onPresentSignUpModal() {
    const modal = await this.modalCtrl.create({
      component: SignUpPage
    });

    return await modal.present();
  }

}
