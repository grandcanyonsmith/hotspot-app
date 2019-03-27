import { Component, Injector, ViewChild } from '@angular/core';
import { ModalController, IonContent, Platform } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import { ReviewAddPage } from '../review-add/review-add';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Place } from '../../services/place-service';
import { Preference } from '../../services/preference';
import { User } from '../../services/user-service';
import { Review } from '../../services/review-service';
import { SignInPage } from '../sign-in/sign-in';
import { Subject, Observable, merge } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { SharePage } from '../share/share.page';

@Component({
  selector: 'page-place-detail',
  templateUrl: 'place-detail.html',
  styleUrls: ['place-detail.scss']
})
export class PlaceDetailPage extends BasePage {

  @ViewChild(IonContent) container: IonContent;

  public apiKey: string = environment.googleMapsApiKey;

  public images = [];
  public place: Place;
  public description: any;
  public rating: number = 0;
  public isLiked: boolean = false;
  public isStarred: boolean = false;
  public location: any;
  public reviews: Review[] = [];
  public slidesConfig: any = {};

  public contentLoaded: Subject<any>;
  public loadAndScroll: Observable<any>;

  public skeletonImages: Array<any>;
  public skeletonReviews: Array<any>;

  public webSocialShare: { show: boolean, share: any, onClosed: any } = {
    show: false,
    share: {
      config: [{
        facebook: {
          socialShareUrl: '',
        },
      }, {
        twitter: {
          socialShareUrl: '',
        }
      }, {
        whatsapp: {
          socialShareText: '',
          socialShareUrl: '',
        }
      }]
    },
    onClosed: () => {
      this.webSocialShare.show = false;
    }
  };

  constructor(injector: Injector,
    private platform: Platform,
    private placeService: Place,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private preference: Preference,
    private callNumber: CallNumber,
    private geolocation: Geolocation,
    private reviewService: Review,
    private launchNavigator: LaunchNavigator,
    private socialSharing: SocialSharing) {
    super(injector);

    this.contentLoaded = new Subject();

    this.skeletonImages = Array(6);
    this.skeletonReviews = Array(5);
  }

  ngOnInit() {
    this.setupObservable();
  }

  async ionViewDidEnter() {
    if (!this.place) {
      this.setupSlider();
      await this.showLoadingView({ showOverlay: false });
      this.loadPlace();
      this.loadLocation();
    } else {
      this.setPageTitle(this.place.title);

      this.setMetaTags({
        title: this.place.title,
        description: this.place.description,
        image: this.place.image.url(),
        slug: this.place.getSlug()
      });
    }
  }

  enableMenuSwipe() {
    return false;
  }

  onSlidesDidLoad() {
    this.contentLoaded.next();
  }

  onSlidesDrag() {
    this.contentLoaded.next();
  }

  setupObservable() {
    this.loadAndScroll = merge(
      this.container.ionScroll,
      this.contentLoaded
    );
  }
  
  onContentLoaded() {
    setTimeout(() => {
      this.contentLoaded.next();
    }, 400);
  }

  async loadPlace() {

    try {

      this.place = await this.placeService.loadOne(this.getParams().id);

      if (this.place.longDescription) {
        this.description = this.sanitizer
        .bypassSecurityTrustHtml(this.place.longDescription);
      }
      
      this.setPageTitle(this.place.title);
      
      this.setMetaTags({
        title: this.place.title,
        description: this.place.description,
        image: this.place.image.url(),
        slug: this.place.getSlug()
      });

      this.webSocialShare.share.config.forEach((item: any) => {
        if (item.whatsapp) {
          item.whatsapp.socialShareUrl = this.getShareUrl(this.place.getSlug());
        } else if (item.facebook) {
          item.facebook.socialShareUrl = this.getShareUrl(this.place.getSlug());
        } else if (item.twitter) {
          item.twitter.socialShareUrl = this.getShareUrl(this.place.getSlug());
        }
      });

      this.rating = this.place.rating;

      if (User.getCurrent()) {
        this.checkIfIsLiked();
        this.checkIfIsStarred();
      }
        
      this.loadReviews();

      if (this.place.image) {
        this.images.push(this.place.image);
      }

      if (this.place.imageTwo) {
        this.images.push(this.place.imageTwo);
      }

      if (this.place.imageThree) {
        this.images.push(this.place.imageThree);
      }

      if (this.place.imageFour) {
        this.images.push(this.place.imageFour);
      }

      this.images.push(...this.place.images);

      this.showContentView();
      this.onContentLoaded();
      this.onRefreshComplete(this.place);

    } catch (err) {

      this.showErrorView();
      this.onRefreshComplete();
    }
  }

  setupSlider() {
    this.slidesConfig = {
      grabCursor: true,
      slidesPerView: 2.5,
      breakpointsInverse: true,
      zoom: false,
      touchStartPreventDefault: false,
      breakpoints: {
        // when window width is >= 320px
        320: {
          slidesPerView: 2,
          spaceBetween: 5
        },
        // when window width is >= 400px
        400: {
          slidesPerView: 2.5,
          spaceBetween: 5
        },
        // when window width is >= 640px
        600: {
          slidesPerView: 3.5,
          spaceBetween: 10
        },
        800: {
          slidesPerView: 4.5,
          spaceBetween: 10
        }
      }
    };
  }

  async checkIfIsLiked() {
    try {
      const isLiked = await this.placeService.isLiked(this.place)
      this.isLiked = isLiked;
    } catch (err) {
      console.warn(err.message);
    }
  }

  async checkIfIsStarred() {
    try {
      const isStarred = await this.placeService.isStarred(this.place)
      this.isStarred = isStarred;
    } catch (err) {
      console.warn(err.message);
    }
  }

  async loadLocation() {
    try {

      const options: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000
      };

      let pos = await this.geolocation.getCurrentPosition(options);
      this.location = pos.coords;

    } catch (err) {
      console.warn(err);
    }
  }

  async loadReviews() {
    try {
      this.reviews = await this.reviewService.load({
        place: this.place, limit: 5
      });
    } catch (err) {
      console.warn(err.message);
    }
  }

  async openSignInModal() {
    const modal = await this.modalCtrl.create({
      component: SignInPage
    })
    return await modal.present();
  }

  async openAddReviewModal() {
    
    const modal = await this.modalCtrl.create({
      component: ReviewAddPage,
      componentProps: {
        place: this.place
      }
    });
    
    modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data) {
      this.reviews.unshift(data);
    }
  }

  async openShareModal() {
    const modal = await this.modalCtrl.create({
      component: SharePage,
    })
    return await modal.present();
  }

  onLike () {

    if (User.getCurrent()) {
      this.isLiked = !this.isLiked;
      this.placeService.like(this.place);
    } else {
      this.openSignInModal();
    }
  }

  onRate () {
    if (User.getCurrent()) {
      this.openAddReviewModal();
    } else {
      this.openSignInModal();
    }
  }

  onContentTouched(ev: any = {}) {
    const href = ev.target.getAttribute('href');
    if (href) {
      ev.preventDefault();
      this.openUrl(href);
    }
  }

  async onShare () {

    if (this.platform.is('hybrid')) {

      try {
        const url = this.getShareUrl(this.place.getSlug());
        await this.socialSharing.share(null, null, null, url);
      } catch (err) {
        console.warn(err)
      }
      
    } else if (this.platform.is('pwa') || this.platform.is('mobile')) {
      this.webSocialShare.show = true;
    } else {
      this.openShareModal();
    }
   
  }

  async onCall () {

    if (!this.place.phone) return;

    try {
      await this.callNumber.callNumber(this.place.phone, true)
    } catch (err) {
      this.openUrl('tel:' + this.place.phone);
    }
  }

  async onDirectionsButtonTouched() {

    try {

      const googleMaps = this.launchNavigator.APP.GOOGLE_MAPS;
      const appleMaps = this.launchNavigator.APP.APPLE_MAPS;

      const isGoogleMapsAvailable = await this.launchNavigator.isAppAvailable(googleMaps);
      const isAppleMapsAvailable = await this.launchNavigator.isAppAvailable(appleMaps);

      let app = null;

      if (isGoogleMapsAvailable) {
        app = this.launchNavigator.APP.GOOGLE_MAPS;
      } else if (isAppleMapsAvailable) {
        app = this.launchNavigator.APP.APPLE_MAPS;
      } else {
        app = this.launchNavigator.APP.USER_SELECT;
      }

      const options: LaunchNavigatorOptions = {
        app: app
      };
      
      const destination = [
        this.place.location.latitude,
        this.place.location.longitude
      ];

      await this.launchNavigator.navigate(destination, options);

    } catch (err) {
      this.openUrl(`https://www.google.com/maps/dir/Current+Location/${this.place.location.latitude},${this.place.location.longitude}`)
    }

  }

}
