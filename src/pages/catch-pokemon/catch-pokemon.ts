import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { google } from 'google-maps';
import { Geolocation } from '@ionic-native/geolocation';

declare let google: google;

@IonicPage()
@Component({
  selector: 'page-catch-pokemon',
  templateUrl: 'catch-pokemon.html',
})
export class CatchPokemonPage {
  private googleApiKey: string = 'AIzaSyCTNYFaQaLgBHiQ-xVhUDhLZPw7e4wUVBM';
  private currentPosition;

  @ViewChild('map_canvas') mapElement: ElementRef;
  public map: any;
  public script: any;
  public scriptActive: boolean   = false;
  public mapInitialized: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public device: Device, public geolocation: Geolocation) {
  }

  ionViewDidLoad() {
    if (!this.scriptActive) {
      this.loadScript();
    }
    this.initMap();
  }

  private initMap() {
    try {
      this.mapInitialized = true;
      let checkExist = setInterval(() => {
        this.geolocation.getCurrentPosition().then(position => {
          this.currentPosition = position;
          const location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          let mapOptions = {
            center: location,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        }, error => {
          console.log('Google Maps error:', error);
        }).then(() => {
          this.addPokemonMarker();
          this.addMyLocationMarker();
        });
        clearInterval(checkExist);
      }, 100);
    } catch (error) {
      alert('Init Map Error: ' + error);
    }
  }

  private loadScript() {
    try {
      if (document.getElementById('googleMaps')) {
        return;
      }
      this.scriptActive = true;
      this.script       = document.createElement('script');
      this.script.id    = 'googleMaps';
      this.script.src   = 'https://maps.google.com/maps/api/js?v=3.exp&libraries=visualization&key=' + this.googleApiKey;

      document.body.appendChild(this.script);
    } catch (error) {
      alert('Load Script Error: ' + error);
    }
  }

  // private setupMapEvents() {
  //   google.maps.event.addListener(this.map, 'click', event => {
  //     console.log('lat: ' + event.latLng.lat());
  //     console.log('lng: ' + event.latLng.lng());
  //   });
  // }

  private addPokemonMarker() {
    try {
      const maxLat = this.currentPosition.coords.latitude + 0.004;
      const minLat = this.currentPosition.coords.latitude - 0.004;

      const maxLng = this.currentPosition.coords.longitude + 0.004;
      const minLng = this.currentPosition.coords.longitude - 0.004;

      for (let pokemonAmount = 5; pokemonAmount > 0; pokemonAmount--) {
        const randomLat = (Math.random() * (maxLat - minLat) + minLat);
        const randomLng = (Math.random() * (maxLng - minLng) + minLng);
        const location  = new google.maps.LatLng(randomLat, randomLng);

        const marker = new google.maps.Marker({
          position: location,
          map: this.map,
          title: 'A wild Pokémon is here!'
        });

        const markerInfo = new google.maps.InfoWindow({
          content: marker.getTitle()
        });

        google.maps.event.addListener(marker, 'click', () => {
          markerInfo.open(this.map, marker);
        });
      }
    } catch(error) {
      alert('Pokémon Marker Error: ' + error);
    }
  }

  private addMyLocationMarker() {
    try {
      const location = new google.maps.LatLng(this.currentPosition.coords.latitude, this.currentPosition.coords.longitude);
      const marker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'You are here'
      });

      const markerInfo = new google.maps.InfoWindow({
        content: marker.getTitle()
      });

      google.maps.event.addListener(marker, 'click', () => {
        markerInfo.open(this.map, marker);
      });
    } catch (error) {
      alert('My Location Error: ' + error);
    }
  }
}
