import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { google } from 'google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { map } from 'rxjs/operator/map';
import { CatchPokemonDetailsPage } from '../catch-pokemon-details/catch-pokemon-details';

declare let google: google;

@IonicPage()
@Component({
  selector: 'page-catch-pokemon',
  templateUrl: 'catch-pokemon.html',
})
export class CatchPokemonPage {

  private googleApiKey: string = 'AIzaSyCTNYFaQaLgBHiQ-xVhUDhLZPw7e4wUVBM';
  private currentPosition;
  private pokemonList: Array<any>;
  private loading: any;
  private alertPresented: boolean = false;

  @ViewChild('map_canvas') mapElement: ElementRef;
  public map: any;
  public script: any;
  public scriptActive: boolean   = false;
  public mapInitialized: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public device: Device, public geolocation: Geolocation, private storage: Storage, private loadingCtrl: LoadingController, private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    if (!this.scriptActive) {
      this.loadScript();
    }
    this.initMap();
    this.storage.get('allPokemon').then(pokemon => {
      this.pokemonList = pokemon;
    });
  }

  private initMap() {
    this.presentLoading();

    try {
      console.log('Initializing map');

      this.mapInitialized = true;
      let checkExist      = setInterval(() => {
        console.log('Inside setInterval');

        this.geolocation.getCurrentPosition().then(position => {
          this.currentPosition = position;
          const location       = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          let mapOptions       = {
            center: location,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          this.map             = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        }, error => {
          console.log('Google Maps error:', error);
        }).then(async () => {
          console.log('Inside onFulfilled');

          await this.addPokemonMarker();
          await this.addMyLocationMarker();
          this.watchMyLocation();

          this.loading.dismiss();
        });
        clearInterval(checkExist);
      }, 300);
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

  /**
   * Add 5 markers at random locations within a certain area of the user's current location
   */
  private async addPokemonMarker() {
    console.log('Adding Pokémon markers');

    const minLat            = this.currentPosition.coords.latitude - 0.004;
    const maxLat            = this.currentPosition.coords.latitude + 0.004;
    const minLng            = this.currentPosition.coords.longitude - 0.004;
    const maxLng            = this.currentPosition.coords.longitude + 0.004;
    const pokemonAndMarkers = [];

    for (let pokemonAmount = 5; pokemonAmount > 0; pokemonAmount--) {
      const randomLat = (Math.random() * (maxLat - minLat) + minLat);
      const randomLng = (Math.random() * (maxLng - minLng) + minLng);
      const location  = new google.maps.LatLng(randomLat, randomLng);
      const pokemon   = this.pokemonList[Math.floor(Math.random() * this.pokemonList.length)];

      const marker = new google.maps.Marker({
        position: location,
        map: this.map,
        icon: '../../assets/imgs/pokemon-marker.png',
        title: `A wild Pokémon is here! Number: ${pokemon.entry_number}, name: ${pokemon.pokemon_species.name}`,
        animation: google.maps.Animation.DROP,
      });

      const markerInfo = new google.maps.InfoWindow({
        content: marker.getTitle()
      });

      google.maps.event.addListener(marker, 'click', () => {
        markerInfo.open(this.map, marker);
      });

      pokemonAndMarkers.push({
        pokemon: {
          entry_number: pokemon.entry_number,
          name: pokemon.pokemon_species.name
        },
        markerPosition: {
          lat: marker.getPosition().lat(),
          lng: marker.getPosition().lng()
        }
      });
    }

    //<editor-fold desc="Testing/demo code"> TODO: Comment this, only for testing/demo purposes!
    const locationNearby = new google.maps.LatLng((this.currentPosition.coords.latitude + 0.0001), (this.currentPosition.coords.longitude + 0.0001));
    const pokemonNearby  = this.pokemonList[Math.floor(Math.random() * this.pokemonList.length)];

    const markerNearby = new google.maps.Marker({
      position: locationNearby,
      map: this.map,
      icon: '../../assets/imgs/pokemon-marker.png',
      title: `A wild Pokémon is here! Number: ${pokemonNearby.entry_number}, name: ${pokemonNearby.pokemon_species.name}`,
      animation: google.maps.Animation.DROP,
    });

    const markerInfo = new google.maps.InfoWindow({
      content: markerNearby.getTitle()
    });

    google.maps.event.addListener(markerNearby, 'click', () => {
      markerInfo.open(this.map, markerNearby);
    });

    pokemonAndMarkers.push({
      pokemon: {
        entry_number: pokemonNearby.entry_number,
        name: pokemonNearby.pokemon_species.name
      },
      markerPosition: {
        lat: markerNearby.getPosition().lat(),
        lng: markerNearby.getPosition().lng()
      }
    });

    console.log('After for-loop', pokemonNearby, markerNearby.getPosition().lat(), markerNearby.getPosition().lng());
    //</editor-fold>

    // Set the markers and the info of their Pokémon to the storage
    // Enables the ability to access them everywhere where needed
    this.storage.set('pokemonMarkers', pokemonAndMarkers);
  }

  /**
   * Watch my location to see if any Pokémon is close.
   */
  private watchMyLocation() {
    console.log('Watching My Location');

    let locationSubscribtion = this.geolocation.watchPosition({enableHighAccuracy: true}).subscribe(position => {
      console.log('My position:', position);
      this.storage.get('pokemonMarkers').then((markers: Array<any>) => {
        markers.forEach(marker => {
          if (((position.coords.latitude - marker.markerPosition.lat) >= -0.0001 || (position.coords.latitude - marker.markerPosition.lat) <= 0.0001)
            && ((position.coords.longitude - marker.markerPosition.lng) >= -0.0001 || (position.coords.longitude - marker.markerPosition.lng) <= 0.0001)) {
          // if (((position.coords.latitude - marker.markerPosition.lat) >= -0.0001 && (position.coords.latitude - marker.markerPosition.lat) <= 0.0001)
          //   && ((position.coords.longitude - marker.markerPosition.lng) >= -0.0001 && (position.coords.longitude - marker.markerPosition.lng) <= 0.0001)) {

            console.log('Difference lat: ' + (position.coords.latitude - marker.markerPosition.lat))
            console.log('Difference lng: ' + (position.coords.longitude - marker.markerPosition.lng))

            console.log('Lat difference >= -0.0001: ', (position.coords.latitude - marker.markerPosition.lat) >= -0.0001)
            console.log('Lat difference <= 0.0001: ', (position.coords.latitude - marker.markerPosition.lat) <= 0.0001)

            console.log('Lng difference >= -0.0001: ', (position.coords.longitude - marker.markerPosition.lng) >= -0.0001)
            console.log('Lng difference <= 0.0001: ', (position.coords.longitude - marker.markerPosition.lng) <= 0.0001)

            console.log(marker);

            this.catchPokemonConfirmation(marker.pokemon);
          }
        });
      });
    });
  }

  /**
   * Add a marker on the user's current location
   */
  private async addMyLocationMarker() {
    console.log('Adding My Location marker');

    const location = new google.maps.LatLng(this.currentPosition.coords.latitude, this.currentPosition.coords.longitude);
    const marker   = new google.maps.Marker({
      position: location,
      map: this.map,
      title: 'You are here',
      animation: google.maps.Animation.DROP,
    });

    const markerInfo = new google.maps.InfoWindow({
      content: marker.getTitle()
    });

    google.maps.event.addListener(marker, 'click', () => {
      markerInfo.open(this.map, marker);
    });
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Loading map...',
      enableBackdropDismiss: true
    });

    this.loading.present();
  }

  catchPokemonConfirmation(pokemon) {
    if (!this.alertPresented) {
      this.alertPresented = true;
      let alert           = this.alertCtrl.create({
        title: 'Wild Pokémon!',
        message: `A wild ${pokemon.name} appeared!\nThrow a Pokéball??`,
        buttons: [
          {
            text: 'Run',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Throw ball',
            handler: () => {
              this.alertPresented = false;
              this.navCtrl.push(CatchPokemonDetailsPage, {id: pokemon.entry_number});
            }
          }
        ]
      });
      alert.present();
    }
  }
}
