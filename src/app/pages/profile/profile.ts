
import { Component, Injector } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { User } from '../../services/user-service';
import { BasePage } from '../base-page/base-page';
import { Review } from '../../services/review-service';
import { Place } from '../../services/place-service';
import { ProfileEditPage } from '../profile-edit/profile-edit';
import { ChangePasswordPage } from '../change-password/change-password';
import { SignInPage } from '../sign-in/sign-in';
import { SettingsPage } from '../settings/settings';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  styleUrls: ['profile.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class ProfilePage extends BasePage {

  public likedPlaces: Place[] = [];
  public places: Place[] = [];
  public reviews: Review[] = [];
  public skeletonItems: Array<any>;
  public user: User;
  public segment: string = 'likes';

  constructor(injector: Injector,
    private events: Events,
    private placeService: Place,
    private reviewService: Review,
    private modalCtrl: ModalController) {
    super(injector);
    this.skeletonItems = Array(10);
  }

  enableMenuSwipe() {
    return true;
  }

  ngOnInit() {

    this.user = User.getCurrent();

    this.events.subscribe('user:login', () => {
      this.user = User.getCurrent();

      this.loadLikedPlaces();
      this.loadReviews();
      this.loadMyPlaces();
    });

    this.events.subscribe('user:loggedOut', () => {
      this.user = null;

      this.likedPlaces = [];
      this.reviews = [];
      this.places = [];
    });
  }

  async ionViewDidEnter() {

    this.user = User.getCurrent();

    const title = await this.getTrans('PROFILE');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });

    if (User.getCurrent()) {

      if (!this.likedPlaces.length) this.loadLikedPlaces();
      if (!this.reviews.length) this.loadReviews();
      if (!this.places.length) this.loadMyPlaces();
    }
  }

  async loadLikedPlaces() {
    try {
      this.likedPlaces = await this.placeService.loadFavorites()
    } catch (err) {
      console.warn(err.message);
    }
  }

  async loadMyPlaces() {
    try {
      this.places = await this.placeService.load({
        user: this.user,
        status: ['Pending', 'Approved', 'Rejected']
      })
    } catch (err) {
      console.warn(err.message);
    }
  }

  async loadReviews() {
    try {
      this.reviews = await this.reviewService.load({ user: this.user })
    } catch (err) {
      console.warn(err.message);
    }
  }

  onSegmentChanged(event: CustomEvent) {
    this.segment = event.detail.value;
  }

  async onPresentEditModal() {
    
    const modal = await this.modalCtrl.create({
      component: ProfileEditPage
    });

    return await modal.present();
  }

  async onPresentChangePasswordModal() {
    
    const modal = await this.modalCtrl.create({
      component: ChangePasswordPage
    });

    return await modal.present();
  }

  async onPresentSettingsModal() {
    
    const modal = await this.modalCtrl.create({
      component: SettingsPage,
    });

    return await modal.present();
  }

  async openSignInModal() {
    const modal = await this.modalCtrl.create({
      component: SignInPage
    })
    return await modal.present();
  }

  getStatusColor(status: string) {
    if (status === 'Pending') {
      return 'warning';
    } else if (status === 'Approved') {
      return 'success';
    } else if (status === 'Rejected') {
      return 'danger';
    } else  {
      console.log('no match found');
    }
  }

  onPlaceTouched(place: Place) {

    if (place.status === 'Approved') {
      
      let page = this.currentPath + '/places/' + place.id;

      if (place.slug) {
        page += '/' + place.slug;
      }
  
      this.navigateTo(page);
    }
    
  }

  onLogout() {
    this.events.publish('user:logout')
  }

}
