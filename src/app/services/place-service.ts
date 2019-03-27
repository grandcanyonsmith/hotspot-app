import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class Place extends Parse.Object {

  constructor() {
    super('Place');
  }

  static getInstance() {
    return this;
  }

  getSlug(): string {
    let slug =  '1/places/' + this.id;

    if (this.slug) {
      slug += '/' + this.slug;
    }

    return slug;
  }

  distance(location: Parse.GeoPoint, unit: string = 'km') {

    if (!location) return null;

    var geoPoint = new Parse.GeoPoint({
      latitude: location.latitude,
      longitude: location.longitude
    });

    if (unit === 'km') {
      return this.location.kilometersTo(geoPoint).toFixed(2) + ' ' + unit;
    } else {
      return this.location.milesTo(geoPoint).toFixed(2) + ' ' + unit;
    }
  }

  like(place: Place) {

    return new Promise((resolve, reject) => {
      Parse.Cloud.run('likePlace', { placeId: place.id }).then(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
     });
  }

  isLiked(place: Place): Promise <boolean> {

    return new Promise((resolve, reject) => {
      Parse.Cloud.run('isPlaceLiked', { placeId: place.id }).then((data: boolean) => {
        resolve(data);
      }, error => {
        reject(error);
      });
     });
  }

  isStarred(place: Place): Promise <boolean> {

    return new Promise((resolve, reject) => {
      Parse.Cloud.run('isPlaceStarred', { placeId: place.id }).then((data: boolean) => {
        resolve(data);
      }, error => {
        reject(error);
      });
     });
  }

  loadOne(id: string): Promise<Place> {
    return new Promise((resolve, reject) => {
      let query = new Parse.Query(Place);
      query.equalTo('status', 'Approved');
      query.include('category');
      query.get(id).then((data: Place) => resolve(data), error => reject(error));
    });
  }

  load(params: any = {}): Promise<Place[]> {

    return new Promise((resolve, reject) => {

      let page = params.page || 0;
      let limit = params.limit || 100;
      let distance = params.distance || 100;
      let status = params.status || 'Approved';

      let query = new Parse.Query(Place);

      if (Array.isArray(status)) {
        query.containedIn('status', status);
      } else {
        query.equalTo('status', status);
      }

      if (params.category) {
        query.equalTo('category', params.category);
      }

      if (params.featured) {
        query.equalTo('isFeatured', true);
      }

      if (params.user) {
        query.equalTo('user', params.user);
      }

      if (params.canonical && params.canonical !== '') {
        query.contains('canonical', params.canonical);
      }

      if (params.bounds) {
        
        const southwest = new Parse.GeoPoint(
          params.bounds[0].latitude,
          params.bounds[0].longitude
        );

        const northeast = new Parse.GeoPoint(
          params.bounds[1].latitude,
          params.bounds[1].longitude
        );

        query.withinGeoBox('location', southwest, northeast);

      } else if (params.location) {

        const point = new Parse.GeoPoint({
          latitude: params.location.latitude,
          longitude: params.location.longitude
        });

        if (params.unit && params.unit === 'km') {
          query.withinKilometers('location', point, distance);
        } else {
          query.withinMiles('location', point, distance);
        }

      } else {
        query.descending('createdAt');
      }

      query.skip(page * limit);
      query.limit(limit);

      query.include('category');
      query.doesNotExist('deletedAt');

      query.find().then((data: Place[]) => resolve(data), error => reject(error));
    });
  }

  loadFavorites(params: any = {}): Promise<Place[]> {

    return new Promise((resolve, reject) => {

      let page = params.page || 0;
      let limit = params.limit || 100;

      let query = new Parse.Query(Place);
      query.equalTo('status', 'Approved');
      query.equalTo('likes', Parse.User.current());

      query.skip(page * limit);
      query.limit(limit);
      query.include('category');
      query.doesNotExist('deletedAt');

      query.find().then((data: Place[]) => resolve(data), error => reject(error));
    });
  }

  get title(): string {
    return this.get('title');
  }

  set title(val) {
    this.set('title', val);
  }

  get description(): string {
    return this.get('description');
  }

  set description(val) {
    this.set('description', val);
  }

  get phone(): string {
    return this.get('phone');
  }

  set phone(val) {
    this.set('phone', val);
  }

  get website(): string {
    return this.get('website');
  }

  set website(val) {
    this.set('website', val);
  }

  get address(): string {
    return this.get('address');
  }

  set address(val) {
    this.set('address', val);
  }

  get category() {
    return this.get('category');
  }

  set category(val) {
    this.set('category', val);
  }

  get image() {
    return this.get('image');
  }

  set image(val) {
    this.set('image', val);
  }

  get images() {
    return this.get('images');
  }

  set images(val) {
    this.set('images', val);
  }

  get location() {
    return this.get('location');
  }

  set location(val) {
    var geoPoint = new Parse.GeoPoint({
      latitude: val.lat,
      longitude: val.lng
    });
    this.set('location', geoPoint);
  }

  get imageTwo() {
    return this.get('imageTwo');
  }

  get imageThree() {
    return this.get('imageThree');
  }

  get imageFour() {
    return this.get('imageFour');
  }

  get imageThumb() {
    return this.get('imageThumb');
  }

  get ratingCount() {
    return this.get('ratingCount');
  }

  get ratingTotal() {
    return this.get('ratingTotal');
  }

  get status() {
    return this.get('status');
  }

  get facebook() {
    return this.get('facebook');
  }

  get youtube() {
    return this.get('youtube');
  }

  get instagram() {
    return this.get('instagram');
  }

  get longDescription() {
    return this.get('longDescription');
  }

  get slug() {
    return this.get('slug');
  }

  get rating() {
    if (!this.ratingCount && !this.ratingTotal) return 0;
    return Math.round(this.ratingTotal / this.ratingCount);
  }

}

Parse.Object.registerSubclass('Place', Place);
