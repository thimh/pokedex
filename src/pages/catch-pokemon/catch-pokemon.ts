import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, IonicPage, Loading, NavController, Platform } from 'ionic-angular';
import { google } from 'google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { map } from 'rxjs/operator/map';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

import { CatchPokemonDetailsPage } from '../catch-pokemon-details/catch-pokemon-details';

import { LoaderServiceProvider } from '../../providers/loader-service/loader-service';
import { GoogleServiceProvider } from '../../providers/google-service/google-service';

import { Pokemon } from '../../models/pokemon';
import { Subscription } from 'rxjs/Subscription';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';

declare let google: google;

@IonicPage()
@Component({
  selector: 'page-catch-pokemon',
  templateUrl: 'catch-pokemon.html',
})
export class CatchPokemonPage {

  private loading: Loading;
  private alertPresented: boolean = false;

  private currentPosition: Geoposition;
  private locationSubscription: Subscription;

  private pokemonList: Array<Pokemon>;
  private markers: Array<google.maps.Marker> = [];
  private myLocationMarker: google.maps.Marker;
  private catchAreaIndicator: google.maps.Circle;

  private maxPokemonSpawnDistance: number = 0.004; // +/- 450 meters
  private maxPokemonCatchDistance: number = 0.0003; // +/- 40 meters
  private myLocationMarkerRefreshDistance: number = 0.00008; // +/- 10 meters

  @ViewChild('map_canvas') mapElement: ElementRef;
  public map: google.maps.Map;
  public script: any;
  public scriptActive: boolean = false;
  public mapInitialized: boolean = false;
  private connectionSubscription: Subscription;

  constructor(private navCtrl: NavController,
              private geoLocation: Geolocation,
              private storage: Storage,
              private loaderService: LoaderServiceProvider,
              private alertCtrl: AlertController,
              private navigator: LaunchNavigator,
              private platform: Platform,
              private googleService: GoogleServiceProvider,
              private connectivityService: ConnectivityServiceProvider) {
  }

  /**
   * ionViewWillEnter
   */
  ionViewWillEnter() {
    this.alertPresented = false;
  }

  /**
   * ionViewDidLoad
   */
  ionViewDidLoad() {
    this.connectionSubscription = this.connectivityService.checkConnection();

    this.loading = this.loaderService.createLoader('Loading map...');

    if (!this.scriptActive) {
      this.scriptActive = this.googleService.loadScript();
    }
    this.initMap();
    this.storage.get('allPokemon').then((pokemon: Array<Pokemon>) => {
      this.pokemonList = pokemon;
    });

    if (this.mapInitialized) {
      this.watchMyLocation();
    }
  }

  /**
   * ionViewWillLeave
   */
  ionViewWillLeave() {
    this.connectionSubscription.unsubscribe();
    this.locationSubscription.unsubscribe();
    this.myLocationMarker.setMap(null);
    this.myLocationMarker = null;
  }

  /**
   * initMap
   */
  public initMap() {
    let checkExist = setInterval(() => {
      this.geoLocation.getCurrentPosition().then(position => {
        this.currentPosition = position;
        this.map = this.googleService.initMap(position, this.mapElement);
      }, error => {
        console.log('Google Maps error:', error);
      }).then(() => {
        this.createMarkersAndListeners().then(() => {
          this.watchMyLocation();
          this.loading.dismiss();
        });
      });
      this.mapInitialized = true;
      clearInterval(checkExist);
    }, 300);
  }

  /**
   * Markers common section
   */

  /**
   * createMarkersAndListeners
   *
   * @returns {Promise<void>}
   */
  private async createMarkersAndListeners() {
    await this.googleService.addPokemonMarkers(
      this.currentPosition.coords.latitude - this.maxPokemonSpawnDistance,
      this.currentPosition.coords.latitude + this.maxPokemonSpawnDistance,
      this.currentPosition.coords.longitude - this.maxPokemonSpawnDistance,
      this.currentPosition.coords.longitude + this.maxPokemonSpawnDistance,
      this.pokemonList,
      this.map
    ).forEach(marker => {
      this.markers.push(marker);
    });

    // TODO: This is demo/testing code; creates a Pokémon marker near the current location.
    /*await this.googleService.addNearbyPokemonMarker(
      (this.currentPosition.coords.latitude + 0.00025),
      (this.currentPosition.coords.longitude + 0.00025),
      this.pokemonList,
      this.map
    ).then((nearbyPokemonMarker) => {
      this.markers.push(nearbyPokemonMarker);
    });*/

    await this.createMyLocationMarker();
    await this.addMarkerEventListeners();
  }

  /**
   * addMarkerEventListeners
   */
  private addMarkerEventListeners() {
    this.markers.forEach(marker => {
      google.maps.event.addListener(marker, 'click', () => {
        if (this.platform.is('ios') || this.platform.is('android')) {
          this.navigateToMessage(marker.getPosition().lat(), marker.getPosition().lng());
        } else {
          this.deviceNotSupportedMessage();
        }
      });
    });
  }

  /**
   * navigateTo
   *
   * @param {number} lat
   * @param {number} lng
   */
  private navigateTo(lat: number, lng: number) {
    this.navigator.isAppAvailable(this.navigator.APP.GOOGLE_MAPS).then(isAvailable => {
      let navApp;
      if (isAvailable) {
        navApp = this.navigator.APP.GOOGLE_MAPS;
      } else {
        navApp = this.navigator.APP.USER_SELECT;
      }
      this.navigator.navigate([lat, lng], {
        app: navApp,
      });
    });
  }

  /**
   * refreshMarkers
   */
  private refreshMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
    this.storage.remove('pokemonMarkers').then(() => {
      this.createMarkersAndListeners().then(() => {
        this.watchMyLocation();
      });
    });
  }

  /**
   * My location marker section
   */

  /**
   * createMyLocationMarker
   */
  private createMyLocationMarker() {
    let location = new google.maps.LatLng(this.currentPosition.coords.latitude, this.currentPosition.coords.longitude);
    this.myLocationMarker = this.googleService.addMyLocationMarker(location, this.map, 'You are here');

    if (!this.catchAreaIndicator) {
      this.catchAreaIndicator = this.googleService.createCatchAreaIndicator(this.map, this.myLocationMarker);
    }

    const markerInfo = this.googleService.createMarkerInfo(this.myLocationMarker.getTitle());
    google.maps.event.addListener(this.myLocationMarker, 'click', () => {
      markerInfo.open(this.map, this.myLocationMarker);
    });
  }

  /**
   * watchMyLocation
   */
  private watchMyLocation() {
    this.locationSubscription = this.geoLocation.watchPosition({enableHighAccuracy: true}).subscribe(position => {
      let previousPosition = new google.maps.LatLng(this.currentPosition.coords.latitude, this.currentPosition.coords.longitude);
      let newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      if (((newPosition.lat() - previousPosition.lat()) >= (-this.myLocationMarkerRefreshDistance)
            || (newPosition.lat() - previousPosition.lat()) <= this.myLocationMarkerRefreshDistance)
        || ((newPosition.lng() - previousPosition.lng()) >= (-this.myLocationMarkerRefreshDistance)
            || (newPosition.lng() - previousPosition.lng()) <= this.myLocationMarkerRefreshDistance)) {
        this.myLocationMarker.setPosition(newPosition);
        this.catchAreaIndicator.setCenter(newPosition);
      }

      this.storage.get('pokemonMarkers').then((markers: Array<any>) => {
        markers.forEach(marker => {
          if (((newPosition.lat() - marker.markerPosition.lat) >= (-this.maxPokemonCatchDistance)
                && (newPosition.lat() - marker.markerPosition.lat) <= this.maxPokemonCatchDistance)
            && ((newPosition.lng() - marker.markerPosition.lng) >= (-this.maxPokemonCatchDistance)
                && (newPosition.lng() - marker.markerPosition.lng) <= this.maxPokemonCatchDistance)) {
            this.catchPokemonConfirmationMessage(marker.pokemon);
          }
        });
      });
    });
  }

  /**
   * Message dialogs section
   */

  /**
   * catchPokemonConfirmationMessage
   *
   * @param pokemon
   */
  private catchPokemonConfirmationMessage(pokemon) {
    if (!this.alertPresented) {
      this.alertPresented = true;
      this.alertCtrl.create({
        title: 'Wild Pokémon!',
        message: `<p>A wild ${pokemon.name} appeared!</p>
                  <p>Throw a Pokéball?</p>`,
        buttons: [
          {
            text: 'Run',
            role: 'cancel',
            handler: () => {
              this.alertPresented = false;
              this.gotAwayMessage();
            }
          },
          {
            text: 'Throw ball',
            handler: () => {
              // this.alertPresented = false;
              this.refreshMarkers();
              this.navCtrl.push(CatchPokemonDetailsPage, {id: pokemon.entry_number});
            }
          }
        ]
      }).present();
    }
  }

  /**
   * gotAwayMessage
   */
  private gotAwayMessage() {
    if (!this.alertPresented) {
      this.alertPresented = true;
      this.alertCtrl.create({
        title: 'Ran away!',
        message: `Got away safely...!`,
        buttons: [
          {
            text: 'Ok',
            handler: () => {
              const catchPokemonTimeout = setTimeout(() => {
                this.alertPresented = false;
                clearTimeout(catchPokemonTimeout);
              }, 10000);
            }
          }
        ]
      }).present();
    }
  }

  /**
   * navigateToMessage
   *
   * @param {number} lat
   * @param {number} lng
   */
  private navigateToMessage(lat: number, lng: number) {
    if (!this.alertPresented) {
      this.alertPresented = true;
      this.alertCtrl.create({
        title: 'A wild Pokémon is here!',
        message: `Do you want to let Google Maps help you navigate to this Pokémon?`,
        buttons: [
          {
            text: 'I can do it',
            role: 'cancel',
            handler: () => {
              this.alertPresented = false;
            }
          },
          {
            text: 'Help me',
            handler: () => {
              // this.alertPresented = false;
              this.navigateTo(lat, lng);
            }
          }
        ]
      }).present();
    }
  }

  /**
   * deviceNotSupportedMessage
   */
  private deviceNotSupportedMessage() {
    if (!this.alertPresented) {
      this.alertPresented = true;
      this.alertCtrl.create({
        title: 'This device is not supported',
        message: `<p>The device you are playing on does not support our navigation helper.</p>
                <p>Sadly, you are on your own here...</p>`,
        buttons: [
          {
            text: 'Ok, I will manage',
            handler: () => {
              this.alertPresented = false;
            }
          }
        ]
      }).present();
    }
  }
}
