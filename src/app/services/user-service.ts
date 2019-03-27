import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class User extends Parse.User {

  constructor() {
    super('_User');
  }

  static getInstance() {
    return this;
  }

  static getCurrent() {
    return <User>Parse.User.current();
  }

  isLoggedInViaFacebook() {
    return this.authData;
  }

  create(data: any = {}): Promise<User> {
    return new Promise((resolve, reject) => {
      let user = new User();
      user.signUp(data).then((user: User) => resolve(user), error => reject(error));
    });
  }

  signIn(data: any = {}): Promise<User> {
    return new Promise((resolve, reject) => {
      let user = new User;
      user.username = data.username;
      user.password = data.password;
      user.logIn().then((user: User) => resolve(user), error => reject(error));
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      Parse.User.logOut().then(res => resolve(res), err => reject(err));
    });
  }

  recoverPassword(email: string) {
    return new Promise((resolve, reject) => {
      Parse.User.requestPasswordReset(email).then(res => resolve(res), err => reject(err));
    });
  }

  loginViaFacebook(): Promise<User> {
    return new Promise((resolve, reject) => {
      (Parse.FacebookUtils.logIn(null) as any)
      .then((user: User) => resolve(user), (err: any) => reject(err));
    });
  }

  linkWith(provider: string, authData: any = {}): Promise<User> {
    return new Promise((resolve, reject) => {
      const user: any = new User;
      user._linkWith(provider, authData).then((user: User) => resolve(user), err => reject(err));
    });
  }

  isFacebookLinked(): boolean {
    return Parse.FacebookUtils.isLinked(Parse.User.current());
  }

  linkFacebook(authData: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      Parse.FacebookUtils.link(Parse.User.current(), authData, {
        success: (res) => resolve(res), error: (err) => reject(err) });
    });
  }

  unlinkFacebook(): Promise<any> {
    return new Promise((resolve, reject) => {
      Parse.FacebookUtils.unlink(Parse.User.current(), {
        success: (res) => resolve(res), error: (err) => reject(err) });
    });
  }

  get name(): string {
    return this.get('name');
  }

  set name(val) {
    this.set('name', val);
  }

  get email(): string {
    return this.get('email');
  }

  set email(val) {
    this.set('email', val);
  }

  get username(): string {
    return this.get('username');
  }

  set username(val) {
    this.set('username', val);
  }

  get password(): string {
    return this.get('password');
  }

  set password(val) {
    this.set('password', val);
  }

  get photo(): any {
    return this.get('photo');
  }

  set photo(val) {
    this.set('photo', val);
  }

  get authData(): any {
    return this.get('authData');
  }

  set authData(val) {
    this.set('authData', val);
  }
}

Parse.Object.registerSubclass('_User', User);
