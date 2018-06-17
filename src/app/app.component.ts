import { Component, ViewChild } from '@angular/core';
import { AlertController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { MyPokemonPage } from '../pages/my-pokemon/my-pokemon';
import { PokedexPage } from '../pages/pokedex/pokedex';
import { CatchPokemonPage } from '../pages/catch-pokemon/catch-pokemon';

import { ApiServiceProvider } from '../providers/api-service/api-service';

import { Pokemon } from '../models/pokemon';
import { Network } from '@ionic-native/network';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) private nav: Nav;

  public rootPage: any;
  public pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private storage: Storage, private apiService: ApiServiceProvider, private net: Network, private alertCtrl: AlertController, private nativeSettings: OpenNativeSettings) {
    this.initializeApp();

    this.pages = [
      { title: 'My Pokémon', component: MyPokemonPage },
      { title: 'Pokédex', component: PokedexPage },
      { title: 'Catch Pokémon', component: CatchPokemonPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (!this.platform.is('ios') && !this.platform.is('android')) {
        this.noDeviceMessage();
      } else if (this.net.type === 'unknown' || this.net.type === 'none') {
        // this.platform.exitApp();
        this.noNetworkMessage();
      }

      this.rootPage = MyPokemonPage;

      // Setup the storage to correctly initialize the app
      this.setupStorage();

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  /**
   * setupStorage
   */
  private setupStorage() {
    this.loadPokemonToStorage();
    this.removeMarkersFromStorage();
  }

  /**
   * loadPokemonToStorage
   */
  private loadPokemonToStorage() {
    this.storage.get('allPokemon').then(result => {
      if (result === null) {
        this.apiService.getAllPokemon().then((pokemon: Array<Pokemon>) => {
          this.storage.set('allPokemon', pokemon);
        }).catch(err => {
          console.log('getAllPokemon error:', err);
        });
      }
    });
  }

  /**
   * removeMarkersFromStorage
   */
  private removeMarkersFromStorage() {
    this.storage.get('pokemonMarkers').then(result => {
      if (result !== null) {
        this.storage.remove('pokemonMarkers');
      }
    });
  }

  /**
   * noDeviceMessage
   */
  private noDeviceMessage() {
    this.alertCtrl.create({
      title: 'Not on device',
      message: `<p>You are not playing on a device.</p>
                <p>We cannot check your internet connection, which may result in unexpected behaviour...</p>`,
      buttons: [
        {
          text: `I'll take the risk`,
          handler: () => {
          }
        }
      ]
    }).present();
  }

  /**
   * noNetworkMessage
   */
  private noNetworkMessage() {
    this.alertCtrl.create({
      title: 'No network',
      message: `<p>You are not connected to a network!</p>
              <p>You require an internet connection to play with Pokémon...</p>`,
      buttons: [
        {
          text: 'Ok, I shall connect',
          handler: () => {
            if (this.platform.is('ios') || this.platform.is('android')) {
              this.nativeSettings.open('network');
            }
          }
        }
      ]
    }).present();
  }
}
