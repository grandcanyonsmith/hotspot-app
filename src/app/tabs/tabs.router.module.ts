import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '1',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: '../pages/home/home.module#HomePageModule'
          },
          {
            path: 'search',
            loadChildren: '../pages/search/search.module#SearchPageModule'
          },
          {
            path: 'search/places/:id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'search/places/:id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'search/places/:id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'search/places/:id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'categories',
            loadChildren: '../pages/category-list/category-list.module#CategoryListPageModule'
          },
          {
            path: 'categories/places',
            loadChildren: '../pages/place-list/place-list.module#PlaceListPageModule'
          },
          {
            path: 'categories/places/map',
            loadChildren: '../pages/map/map.module#MapPageModule'
          },
          {
            path: 'categories/places/map/:id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'categories/places/map/:id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'categories/places/map/:id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'categories/places/map/:id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'categories/places/:id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'categories/places/:id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places',
            loadChildren: '../pages/place-list/place-list.module#PlaceListPageModule'
          },
          {
            path: 'places/add',
            loadChildren: '../pages/place-add/place-add.module#PlaceAddPageModule'
          },
          {
            path: 'places/map',
            loadChildren: '../pages/map/map.module#MapPageModule'
          },
          {
            path: 'categories/places/:id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'categories/places/:id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'places/map/:id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places/map/:id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places/map/:id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'places/map/:id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'places/:id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places/:id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places/:id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'places/:id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
        ]
      },
      // {
      //   path: 'temporary-sites',
      //   children: [
      //     {
      //     path: 'temporary-sites',
      //     loadChildren: '../temporary-sites/temporary-sites.page.module#PlaceListPageModule'
      //     }
      //   ]
      // },
      {
        path: 'places',
        children: [
          {
            path: '',
            loadChildren: '../pages/place-list/place-list.module#PlaceListPageModule'
          },
          {
            path: 'add',
            loadChildren: '../pages/place-add/place-add.module#PlaceAddPageModule'
          },
          {
            path: 'map',
            loadChildren: '../pages/map/map.module#MapPageModule'
          },
      
          {
            path: 'map/:id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'map/:id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: ':id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: ':id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'map/:id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'map/:id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: ':id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: ':id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          // {
          //   path: 'temporary-sites',
          //   loadChildren: '../temporary-sites.module#TemporarySitesPageModule'
          // },
        ]
      },
      {
        path: 'posts',
        children: [
          {
            path: '',
            loadChildren: '../pages/post-list/post-list.module#PostListPageModule'
          },
          {
            path: 'places/:id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places/:id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places/:id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'places/:id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: ':id',
            loadChildren: '../pages/post-detail/post-detail.module#PostDetailPageModule'
          },
          {
            path: ':id/:slug',
            loadChildren: '../pages/post-detail/post-detail.module#PostDetailPageModule'
          },
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: '../pages/profile/profile.module#ProfilePageModule'
          },
          {
            path: 'places/:id/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places/:id/:slug/reviews',
            loadChildren: '../pages/review-list/review-list.module#ReviewListPageModule'
          },
          {
            path: 'places/:id',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          },
          {
            path: 'places/:id/:slug',
            loadChildren: '../pages/place-detail/place-detail.module#PlaceDetailPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/1/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/1/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
