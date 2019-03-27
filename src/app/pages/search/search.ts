import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Place } from '../../services/place-service';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
  styleUrls: ['search.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class SearchPage extends BasePage {

  protected params: any = {
    limit: 100
  };
  public skeletonArray: any;

  public places: Place[] = [];

  constructor(injector: Injector,
    private placeService: Place) {
    super(injector);
    this.skeletonArray = Array(12);
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  async ionViewDidEnter() {
    const title = await this.getTrans('SEARCH');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async loadData(event: any = {}) {

    this.refresher = event.target;

    try {

      this.places = await this.placeService.load(this.params);
  
      if (this.places.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onRefreshComplete(this.places);

    } catch (err) {
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      this.showContentView();
      this.onRefreshComplete();
    }
  }

  async onSearch(e: any = {}) {

    this.params.canonical = e.target.value;

    if (this.params.canonical && this.params.canonical.trim() !== '') {
      this.params.canonical = this.params.canonical.toLowerCase();
      await this.showLoadingView({ showOverlay: false });
      this.loadData();
    }
  }

  onPlaceTouched(place: Place) {
    let page = this.currentPath + '/places/' + place.id;

    if (place.slug) {
      page += '/' + place.slug;
    }

    this.navigateTo(page);
  }

}
