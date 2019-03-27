import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Post } from '../../services/post';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import { Place } from 'src/app/services/place-service';

@Component({
  selector: 'post-list-page',
  templateUrl: 'post-list.html',
  styleUrls: ['post-list.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class PostListPage extends BasePage {

  protected params: any = {};

  public skeletonArray: any;
  public posts: Post[] = [];

  constructor(injector: Injector,
    private postService: Post) {
    super(injector);

    this.skeletonArray = Array(12);
    this.params.limit = 20;
    this.params.page = 0;
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  async ionViewDidEnter() {
    if (!this.posts.length) {
      await this.showLoadingView({ showOverlay: false });
      this.loadData();
    }
    const title = await this.getTrans('POSTS');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  onPostTouched(post: Post) {

    let page = this.currentPath + '/' + post.id;

    if (post.slug) {
      page += '/' + post.slug;
    }

    this.navigateTo(page);
  }

  onPlaceTouched(place: Place) {

    let page = this.currentPath + '/places/' + place.id;

    if (place.slug) {
      page += '/' + place.slug;
    }

    this.navigateTo(page);
  }

  async loadData() {

    try {

      const posts = await this.postService.load(this.params);

      for (let post of posts) {
        this.posts.push(post)
      }

      if (this.posts.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onRefreshComplete(posts);

    } catch (err) {
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      this.showContentView();
      this.onRefreshComplete();
    }
  }

  onReload(event: any = {}) {
    this.refresher = event.target;
    this.posts = [];
    this.params.page = 0;
    this.loadData();
  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.params.page++;
    this.loadData();
  }

}
