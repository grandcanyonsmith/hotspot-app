
/// <reference types="@types/googlemaps" />
import { Component, Injector, ViewChild, ElementRef, ComponentFactoryResolver, NgZone } from '@angular/core';
import { Place } from '../../services/place-service';
import { MapStyle } from '../../services/map-style';
import { BasePage } from '../base-page/base-page';
import { LocalStorage } from '../../services/local-storage';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { InfoWindowComponent } from '../../components/info-window/info-window';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'map-page',
  templateUrl: 'map.html',
  styleUrls: ['map.scss']
})
export class MapPage extends BasePage {

  @ViewChild('map') mapElement: ElementRef;

  protected snazzyInfoWindow: any;

  protected params: any = {};

  protected map: google.maps.Map;
  protected geocoder: google.maps.Geocoder;
  protected markers: google.maps.Marker[] = [];
  protected myLocationMarker: google.maps.Marker;
  protected mapInitialised: boolean = false;
  protected location: any;
  protected zoomMyLocation: boolean = true;

  constructor(private injector: Injector,
    private ngZone: NgZone,
    private resolver: ComponentFactoryResolver,
    private storage: LocalStorage,
    private placeService: Place,
    private geolocation: Geolocation) {
    super(injector);
  }

  enableMenuSwipe() {
    return false;
  }

  async ngOnInit() {

    if (typeof google == 'undefined' || typeof google.maps == 'undefined') {
      this.loadGoogleMaps()
    } else {
      this.initMap();
    }
  }

  async ionViewDidEnter() {
    const title = await this.getTrans('MAP');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async loadGoogleMaps() {

    await this.showLoadingView({ showOverlay: false });

    window['mapInit'] = () => {
      this.showContentView();
      this.initMap();
    }

    const apiKey = environment.googleMapsApiKey;

    let script = document.createElement('script');
    script.id = 'googleMaps';
    script.src = `https://maps.google.com/maps/api/js?key=${apiKey}&callback=mapInit`;
    document.body.appendChild(script);

  }

  async initMap() {

    this.snazzyInfoWindow = require('snazzy-info-window');

    this.geocoder = new google.maps.Geocoder();

    this.mapInitialised = true;

    let mapOptions: any = {
      styles: MapStyle.light(),
      zoom: 2,
      center: { lat: 0, lng: 0 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    const text = await this.getTrans('SEARCH_THIS_AREA');

    const component = document.createElement('ion-button');
    component.innerText = text;
    component.shape = 'round';
    component.size = 'small';
    component.onclick = () => this.onSearchButtonTapped();

    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(component);

    try {

      const options: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000
      };
  
      let pos = await this.geolocation.getCurrentPosition(options);

      this.myLocationMarker = new google.maps.Marker({
        icon: {
          url: './assets/img/dot.png',
          scaledSize: new google.maps.Size(24, 24),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
        },
        position: new google.maps.LatLng(
          pos.coords.latitude,
          pos.coords.longitude
        ),
        map: this.map,
      });

      this.params.location = pos.coords;
      this.location = pos.coords;
      this.params.unit = await this.storage.getUnit();
      this.loadData();

    } catch (err) {
      this.translate.get('ERROR_LOCATION_UNAVAILABLE').subscribe(str => this.showToast(str));
    }
  }

  setMapOnAll(map: any) {
    this.markers.forEach(marker => {
      marker.setMap(map);
    });
  }

  onSearchAddress(event: any = {}) {

    if (!this.mapInitialised) return;

    let query = event.target.value;

    this.geocoder.geocode({ address: query }, (
      results: google.maps.GeocoderResult[],
      status: google.maps.GeocoderStatus) => {

      if (results.length) {

        const target = results[0].geometry.location;

        this.map.panTo(target);

        this.params.location = {
          latitude: target.lat(),
          longitude: target.lng()
        };

        this.params.bounds = null;

        this.zoomMyLocation = false;

        this.showLoadingView({ showOverlay: false });
        this.onReload();

      }
    });
  }

  async loadData() {

    try {
      let places = await this.placeService.load(this.params)
      this.onPlacesLoaded(places);
      this.showContentView();
  
      if (!places.length) {
        this.translate.get('EMPTY_PLACES').subscribe(str => this.showToast(str));
      }

    } catch (err) {
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      this.showContentView();
    }
  }

  onPlacesLoaded(places) {

    let bounds = new google.maps.LatLngBounds();
    let points = [];

    for (let place of places) {

      let position = new google.maps.LatLng(place.location.latitude, place.location.longitude);
      
      bounds.extend(position);

      const marker = new google.maps.Marker({
        icon: {
          url: place.category.icon ? place.category.icon.url() : './assets/img/pin.png',
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
        },
        position: position,
        map: this.map,
      });

      this.markers.push(marker);

      const factory = this.resolver.resolveComponentFactory(InfoWindowComponent);
      const component = factory.create(this.injector);
      component.instance.place = place;
      component.instance.location = this.location;
      component.instance.unit = this.params.unit;
      component.changeDetectorRef.detectChanges();

      component.instance.onButtonTouched.subscribe((place: Place) => {
        this.ngZone.run(() => this.onPlaceTouched(place));
      })

      new this.snazzyInfoWindow({
        marker: marker,
        content: component.location.nativeElement,
        padding: '0 0 6px',
        wrapperClass: 'info-window-wrapper',
        showCloseButton: false,
        panOnOpen: true,
        closeWhenOthersOpen: true,
        offset: {
          top: '-4px',
          left: '16px'
        }
      });

      points.push(position);
    }

    if (this.zoomMyLocation) {
      bounds.extend(this.myLocationMarker.getPosition());
    }

    if (points.length || this.zoomMyLocation) {
      this.map.fitBounds(bounds);
    }

    if (!points.length && this.zoomMyLocation) {
      this.map.setZoom(this.map.getZoom() - 8);
    }

  }

  onReload() {
    this.setMapOnAll(null);
    this.markers = [];
    this.loadData();
  }

  onPlaceTouched(place: Place) {
    let page = this.currentPath + '/' + place.id;

    if (place.slug) {
      page += '/' + place.slug;
    }

    this.navigateTo(page);
  }

  async onSearchButtonTapped() {

    if (!this.mapInitialised) return;

    let bounds = this.map.getBounds();

    this.params.bounds = [{
      latitude: bounds.getSouthWest().lat(),
      longitude: bounds.getSouthWest().lng(),
    }, {
      latitude: bounds.getNorthEast().lat(),
      longitude: bounds.getNorthEast().lng()
    }];

    this.zoomMyLocation = false;

    await this.showLoadingView({ showOverlay: false });
    this.onReload();
  }

}
