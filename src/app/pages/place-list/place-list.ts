
import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Place } from '../../services/place-service';
import { Preference } from '../../services/preference';
import { Category } from 'src/app/services/categories';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { User } from 'src/app/services/user-service';
import { ModalController } from '@ionic/angular';
import { SignInPage } from '../sign-in/sign-in';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'place-list-page',
  templateUrl: 'place-list.html',
  styleUrls: ['place-list.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class PlaceListPage extends BasePage {

  public params: any = {};
  public category: Category;
  public skeletonArray: any;
  public places: Place[] = [];

  constructor(injector: Injector,
    private modalCtrl: ModalController,
    private geolocation: Geolocation,
    private placeService: Place,
    private preference: Preference) {
    super(injector);

    this.skeletonArray = Array(12);
    this.params = Object.assign({}, this.getQueryParams());
    this.params.unit = this.preference.unit;
    this.params.limit = 20;
    this.params.page = 0;
  }

  async ngOnInit() {
  }

  async ionViewDidEnter() {

    if (!this.places.length) {

      await this.showLoadingView({ showOverlay: false });

      if (this.params.category) {
        this.params.category = await this.loadCategory();
      }

      if (this.params.nearby) {
        const { coords } = await this.geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 60000
        });

        this.params.location = coords;
      }

      this.loadData();
    }

    const title = await this.getTrans('PLACES');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  enableMenuSwipe() {
    return false;
  }

  async onAddPlaceButtonTouched() {

    if (User.getCurrent()) {
      this.navigateTo(this.currentPath + '/add');
    } else {

      const modal = await this.modalCtrl.create({
        component: SignInPage,
      });

      modal.present();
    }
  }

  async loadCategory() {
    this.category = new Category;
    this.category.id = this.params.category;
    return await this.category.fetch();
  }

  async loadData() {

    try {

      const places = await this.placeService.load(this.params);

      for (let place of places) {
        this.places.push(place);
      }

      this.onRefreshComplete(places);

      if (this.places.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

    } catch (err) {

      this.showContentView();
      this.onRefreshComplete();

      let message = await this.getTrans('ERROR_NETWORK');
      this.showToast(message);
    }
  }

  onPlaceTouched(place: Place) {
    let page = this.currentPath + '/' + place.id;

    if (place.slug) {
      page += '/' + place.slug;
    }

    this.navigateTo(page);
  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.params.page++;
    this.loadData();
  }

  onReload(event: any = {}) {
    this.refresher = event.target;
    this.places = [];
    this.params.page = 0;
    this.loadData();
  }

}
