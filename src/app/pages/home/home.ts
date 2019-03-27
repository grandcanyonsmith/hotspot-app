import { Component, Injector, ViewChild } from '@angular/core';
import { Events, IonContent, IonSlides } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import * as Parse from 'parse';
import { Slide } from '../../services/slide';
import { Category } from '../../services/categories';
import { Place } from '../../services/place-service';
import { GeolocationOptions, Geolocation } from '@ionic-native/geolocation/ngx';
import { Subject, Observable, merge } from 'rxjs';

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  styleUrls: ['home.scss']
})
export class HomePage extends BasePage {

  @ViewChild(IonContent) container: IonContent;

  protected slides: Slide[] = [];

  protected featuredPlaces: Place[] = [];
  protected newPlaces: Place[] = [];
  protected randomPlaces: Place[] = [];
  protected nearbyPlaces: Place[] = [];

  protected categories: Category[] = [];

  protected randomParams: any = {};

  protected slideOpts = {};
  protected slideCategoryConfig = {};
  protected slidePlaceConfig = {};

  protected skeletonArray: any;

  protected location: any;

  protected slidesTopEvent: Subject<any>;
  protected slidesTopObservable: Observable<any>;

  protected slidesCategoryEvent: Subject<any>;
  protected slidesCategoryObservable: Observable<any>;

  protected slidesFeaturedEvent: Subject<any>;
  protected slidesFeaturedObservable: Observable<any>;

  protected slidesLastAddedEvent: Subject<any>;
  protected slidesLastAddedObservable: Observable<any>;

  protected slidesNearbyEvent: Subject<any>;
  protected slidesNearbyObservable: Observable<any>;

  constructor(injector: Injector,
    private events: Events,
    private geolocation: Geolocation,
    private placeService: Place) {
    super(injector);

    this.skeletonArray = Array(6);

    this.slidesTopEvent = new Subject();
    this.slidesCategoryEvent = new Subject();
    this.slidesFeaturedEvent = new Subject();
    this.slidesLastAddedEvent = new Subject();
    this.slidesNearbyEvent = new Subject();
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  async ionViewDidEnter() {
    const title = await this.getTrans('APP_NAME');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async ngOnInit() {
    this.setupObservables();
    this.setupSliders();
    
    await this.showLoadingView({ showOverlay: false });
    this.loadData();
    this.loadNearbyPlaces();
  }

  onReload(event: any = {}) {
    this.refresher = event.target;
    this.loadData();
    this.loadNearbyPlaces();
  }

  onSlidesTopDidLoad() {
   this.slidesTopEvent.next();
  }

  onSlidesTopWillChange() {
    this.slidesTopEvent.next();
  }

  onSlidesCategoryDidLoad() {
    this.slidesCategoryEvent.next();
  }

  onSlidesCategoryDrag() {
    this.slidesCategoryEvent.next();
  }

  onSlidesFeaturedDidLoad() {
    this.slidesFeaturedEvent.next();
  }

  onSlidesFeaturedDrag() {
    this.slidesFeaturedEvent.next();
  }

  onSlidesLastAddedDidLoad() {
    this.slidesLastAddedEvent.next();
  }

  onSlidesLastAddedDrag() {
    this.slidesLastAddedEvent.next();
  }

  onSlidesNearbyDidLoad() {
    this.slidesNearbyEvent.next();
  }

  onSlidesNearbyDrag() {
    this.slidesNearbyEvent.next();
  }

  setupObservables() {
    
    this.slidesTopObservable = merge(
      this.container.ionScroll,
      this.slidesTopEvent
    );
    
    this.slidesCategoryObservable = merge(
      this.container.ionScroll,
      this.slidesCategoryEvent
    );

    this.slidesFeaturedObservable = merge(
      this.container.ionScroll,
      this.slidesFeaturedEvent
    );

    this.slidesLastAddedObservable = merge(
      this.container.ionScroll,
      this.slidesLastAddedEvent
    );

    this.slidesNearbyObservable = merge(
      this.container.ionScroll,
      this.slidesNearbyEvent
    );
  }

  setupSliders() {
    
    this.slideOpts = {
      autoplay: {
        delay: 7000
      },
      zoom: false,
      touchStartPreventDefault: false
    };

    this.slideCategoryConfig = {
      grabCursor: true,
      slidesPerView: 3.5,
      zoom: false,
      breakpointsInverse: true,
      touchStartPreventDefault: false,
      preloadImages: true,
      updateOnImagesReady: true,
      breakpoints: {
        // when window width is >= 320px
        320: {
          slidesPerView: 2.5,
          spaceBetween: 0
        },
        // when window width is >= 400px
        400: {
          slidesPerView: 3.5,
          spaceBetween: 0,
        },
        // when window width is >= 640px
        600: {
          slidesPerView: 4.5,
          spaceBetween: 0
        },
        800: {
          slidesPerView: 6.5,
          spaceBetween: 0
        }
      }
    }

    this.slidePlaceConfig = {
      grabCursor: true,
      slidesPerView: 2.5,
      breakpointsInverse: true,
      zoom: false,
      touchStartPreventDefault: false,
      breakpoints: {
        // when window width is >= 320px
        320: {
          slidesPerView: 1.8,
          spaceBetween: 16
        },
        340: {
          slidesPerView: 2.2,
          spaceBetween: 8
        },
        // when window width is >= 400px
        400: {
          slidesPerView: 2.4,
          spaceBetween: 8
        },
        // when window width is >= 640px
        600: {
          slidesPerView: 3.5,
          spaceBetween: 16
        },
        800: {
          slidesPerView: 4.5,
          spaceBetween: 0
        }
      }
    };
  }

  async loadData() {

    try {

      const data: any = await Parse.Cloud.run('getHomePageData');

      this.randomPlaces = data.randomPlaces;
      this.newPlaces = data.newPlaces;
      this.featuredPlaces = data.featuredPlaces;
      this.categories = data.categories;
      this.slides = data.slides;

      setTimeout(() => {
        this.onRefreshComplete();
        this.showContentView();
      }, 2000)
      

    } catch (error) {

      this.showErrorView();
      this.onRefreshComplete();

      this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));

      if (error.code === 209) {
        this.events.publish('user:logout');
      }

    }

  }

  loadMoreRandomPlaces() {

    Parse.Cloud.run('getRandomPlaces').then((places: Place[]) => {

      for (const place of places) {
        this.randomPlaces.push(place);
      }

      this.onRefreshComplete();

    }, () => {
      this.onRefreshComplete();
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
    });

  }

  async loadNearbyPlaces() {

    try {

      const options: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000
      };

      const pos = await this.geolocation.getCurrentPosition(options);
      this.location = pos.coords;

      this.nearbyPlaces = await this.placeService.load({
        location: this.location,
        limit: 10
      });

    } catch (err) {
      console.warn(err);
    }

  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.randomParams.page++;
    this.loadMoreRandomPlaces();
  }

  onPlaceTouched(place: Place) {
    let page = this.currentPath + '/places/' + place.id;

    if (place.slug) {
      page += '/' + place.slug;
    }

    this.navigateTo(page);
  }

  onSlideTouched(slide: Slide) {

    if (slide.url && slide.type === 'url') {
      this.openUrl(slide.url);
    } else if (slide.place && slide.type === 'place') {
      this.onPlaceTouched(slide.place);
    } else {
      // no match...
    }
  }

}
