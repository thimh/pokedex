import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
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
  private locationSubscription = null;
  private markers: Array<any> = [];

  @ViewChild('map_canvas') mapElement: ElementRef;
  public map: any;
  public script: any;
  public scriptActive: boolean   = false;
  public mapInitialized: boolean = false;

  constructor(private navCtrl: NavController, private navParams: NavParams, private geolocation: Geolocation, private storage: Storage, private loadingCtrl: LoadingController, private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    if (!this.scriptActive) {
      this.loadScript();
    }
    this.initMap();
    this.storage.get('allPokemon').then(pokemon => {
      this.pokemonList = pokemon;
    });

    if (this.mapInitialized) {
      this.watchMyLocation();
    }
  }

  private initMap() {
    this.presentLoading();

    try {
      let checkExist      = setInterval(() => {
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
          await this.addPokemonMarker();
          await this.addMyLocationMarker();
          this.watchMyLocation();
          this.loading.dismiss();
        });
        this.mapInitialized = true;
        clearInterval(checkExist);
      }, 300);
    } catch (error) {
      console.log('Init Map Error: ' + error);
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
      console.log('Load Script Error: ' + error);
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
        icon: './assets/imgs/pokemon-marker.png',
        title: `A wild Pokémon is here!`,
        animation: google.maps.Animation.DROP,
      });

      this.markers.push(marker);

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
    const locationNearby = new google.maps.LatLng((this.currentPosition.coords.latitude + 0.00025), (this.currentPosition.coords.longitude + 0.00025));
    const pokemonNearby  = this.pokemonList[Math.floor(Math.random() * this.pokemonList.length)];

    const markerNearby = new google.maps.Marker({
      position: locationNearby,
      map: this.map,
      icon: './assets/imgs/pokemon-marker.png',
      title: `A wild Pokémon is here!`,
      animation: google.maps.Animation.DROP,
    });

    this.markers.push(markerNearby);

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
    //</editor-fold>

    // Set the markers and the info of their Pokémon to the storage
    // Enables the ability to access them everywhere where needed
    this.storage.set('pokemonMarkers', pokemonAndMarkers);
  }

  /**
   * Watch my location to see if any Pokémon is close.
   */
  private watchMyLocation() {
    this.locationSubscription = this.geolocation.watchPosition({enableHighAccuracy: true}).subscribe(position => {
      this.storage.get('pokemonMarkers').then((markers: Array<any>) => {
        markers.forEach(marker => {
          if (((position.coords.latitude - marker.markerPosition.lat) >= -0.0003 && (position.coords.latitude - marker.markerPosition.lat) <= 0.0003)
            && ((position.coords.longitude - marker.markerPosition.lng) >= -0.0003 && (position.coords.longitude - marker.markerPosition.lng) <= 0.0003)) {
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
    const location = new google.maps.LatLng(this.currentPosition.coords.latitude, this.currentPosition.coords.longitude);
    const marker   = new google.maps.Marker({
      position: location,
      map: this.map,
      title: 'You are here',
      animation: google.maps.Animation.DROP,
    });

    const circle = new google.maps.Circle({
      map: this.map,
      radius: 39.25,
      fillColor: '#AAAAAA',
      strokeColor: '#AAAAAA'
    });
    circle.bindTo('center', marker, 'position');

    const markerInfo = new google.maps.InfoWindow({
      content: marker.getTitle()
    });

    google.maps.event.addListener(marker, 'click', () => {
      markerInfo.open(this.map, marker);
    });
  }

  private presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Loading map...',
      enableBackdropDismiss: true
    });

    this.loading.present();
  }

  private catchPokemonConfirmation(pokemon) {
    if (!this.alertPresented) {
      this.alertPresented = true;
      let alert           = this.alertCtrl.create({
        title: 'Wild Pokémon!',
        message: `<p>A wild ${pokemon.name} appeared!</p>
                  <p>Throw a Pokéball?</p>`,
        buttons: [
          {
            text: 'Run',
            role: 'cancel',
            handler: () => {
              this.gotAwayMessage();
            }
          },
          {
            text: 'Throw ball',
            handler: () => {
              this.locationSubscription.unsubscribe();
              this.alertPresented = false;
              this.markers.forEach(marker => {
                marker.setMap(null);
              });
              this.storage.remove('pokemonMarkers');
              this.addPokemonMarker();
              this.addMyLocationMarker();
              this.navCtrl.push(CatchPokemonDetailsPage, {id: pokemon.entry_number});
            }
          }
        ]
      });
      alert.present();
    }
  }

  private gotAwayMessage() {
    let alert = this.alertCtrl.create({
      title: 'Ran away!',
      message: `Got away safely...!`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
          }
        }
      ]
    });
    alert.present();
  }
}
