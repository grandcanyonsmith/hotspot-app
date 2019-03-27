
/// <reference types="@types/googlemaps" />
import { Component, Injector, ElementRef, ViewChild } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Place } from '../../services/place-service';
import { MapStyle } from '../../services/map-style';
import { ParseFile } from '../../services/parse-file-service';
import { Category } from '../../services/categories';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { environment } from '../../../environments/environment';
import swal from 'sweetalert';

@Component({
  selector: 'page-place-add',
  templateUrl: 'place-add.html',
  styleUrls: ['place-add.scss'],
})
export class PlaceAddPage extends BasePage {

  @ViewChild('map') mapElement: ElementRef;

  protected location: { lat?: number, lng?: number } = {};

  protected map: google.maps.Map;
  protected geocoder: google.maps.Geocoder;
  protected marker: google.maps.Marker;
  protected mapInitialised: boolean = false;

  public form: FormGroup;
  public categories: Category[] = [];
  public slidesConfig = {};
  public mainUpload: ParseFile;
  public uploads: Array<{file: ParseFile}>;

  constructor(injector: Injector,
    private geolocation: Geolocation,
    private categoryService: Category) {
    super(injector);

    this.setupSlider()
  }

  enableMenuSwipe() {
    return true;
  }

  async ionViewDidEnter() {

    const title = await this.getTrans('ADD_PLACE');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  ngOnInit() {

    this.setupForm()

    if (typeof google == 'undefined' || typeof google.maps == 'undefined') {
      this.loadGoogleMaps()
    } else {
      this.initMap();
    }

    this.loadCategories();
  }

  setupSlider() {

    this.uploads = Array
      .from({ length: 9 })
      .map(i => { return { file: null } });
    
    this.slidesConfig = {
      grabCursor: true,
      spaceBetween: 10,
      slidesPerView: 2.5,
      zoom: false,
      breakpointsInverse: true,
      touchStartPreventDefault: false,
      breakpoints: {
        // when window width is >= 320px
        320: {
          spaceBetween: 10,
          slidesPerView: 2.5,
        },
        // when window width is >= 400px
        460: {
          spaceBetween: 10,
          slidesPerView: 3.5,
        },
        // when window width is >= 640px
        600: {
          spaceBetween: 10,
          slidesPerView: 4.5,
        },
        800: {
          spaceBetween: 10,
          slidesPerView: 5.5,
        }
      }
    }
  }

  setupForm() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      category: new FormControl(null, Validators.required),
      description: new FormControl('', Validators.required),
      address: new FormControl(''),
      phone: new FormControl(''),
      website: new FormControl('')
    });
  }

  onMainFileUploaded(file: ParseFile) {
    this.mainUpload = file;
  }

  onFileUploaded(file: ParseFile, upload: any) {
    upload.file = file;
  }

  async loadCategories() {
    try {
      this.categories = await this.categoryService.load();
    } catch (error) {
      console.warn(error.message);
    }
  }

  loadGoogleMaps() {

    window['mapInit'] = () => {
      this.initMap();
    }

    const apiKey = environment.googleMapsApiKey;

    let script = document.createElement('script');
    script.id = 'googleMaps';
    script.src = `https://maps.google.com/maps/api/js?key=${apiKey}&callback=mapInit`;
    document.body.appendChild(script);

  }

  async initMap() {

    this.geocoder = new google.maps.Geocoder();
    this.mapInitialised = true;

    let mapOptions: any = {
      styles: MapStyle.light(),
      zoom: 2,
      center: {lat: 0, lng: 0},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    try {

      const options: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000
      };
  
      let pos = await this.geolocation.getCurrentPosition(options);

      this.location.lat = pos.coords.latitude;
      this.location.lng = pos.coords.longitude;

      this.marker = new google.maps.Marker({
        icon: {
          url: './assets/img/pin.png',
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
        },
        position: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        },
        map: this.map,
      });

      this.map.setCenter({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      this.map.setZoom(15);

    } catch (err) {
      this.translate.get('ERROR_LOCATION_UNAVAILABLE').subscribe(str => this.showToast(str));
    }
  }

  onSearchAddress(event: any = {}) {

    if (!this.mapInitialised) return;

    const query = event.target.value;

    this.geocoder.geocode({ address: query }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {

      if (status === google.maps.GeocoderStatus.OK) {
        const target = results[0].geometry.location;
        this.map.panTo(target);
        this.map.setZoom(15);
        this.marker.setPosition(target);
        
        this.location.lat = target.lat();
        this.location.lng = target.lng();
      }

    });
  }

  preparePlaceData(): Place {
    
    let place = new Place;

    place.title = this.form.value.name;
    place.category = this.form.value.category;
    place.description = this.form.value.description;
    place.address = this.form.value.address;
    place.website = this.form.value.website;
    place.phone = this.form.value.phone;
    place.image = this.mainUpload;

    place.images = this.uploads
      .filter(item => item.file)
      .map(item => item.file);

    if (this.location) {
      
      let position = {
        lat: this.location.lat,
        lng: this.location.lng
      };

      place.location = position;
    }

    return place;
  }

  async onSubmit() {

    if (this.form.invalid) {
      const trans = await this.getTrans('INVALID_FORM');
      return this.showToast(trans);
    }

    if (!this.location) {
      const trans = await this.getTrans('INVALID_LOCATION');
      return this.showToast(trans);
    }

    if (!this.mainUpload) {
      const trans = await this.getTrans('INVALID_PHOTO');
      return this.showToast(trans);
    }

    try {
      
      await this.showLoadingView({ showOverlay: false });
      
      let place = this.preparePlaceData();
      await place.save();

      this.form.reset();

      const trans = await this.getTrans(['GOOD_JOB','PLACE_ADDED'])
      swal(trans.GOOD_JOB, trans.PLACE_ADDED, 'success');
      
      this.showContentView();

    } catch (err) {
      this.showContentView();
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
    }

  }

}
