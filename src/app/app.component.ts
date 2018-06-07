import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { MyPokemonPage } from '../pages/my-pokemon/my-pokemon';
import { PokedexPage } from '../pages/pokedex/pokedex';
import { CatchPokemonPage } from '../pages/catch-pokemon/catch-pokemon';
import { Storage } from '@ionic/storage';
import { ApiServiceProvider } from '../providers/api-service/api-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private storage: Storage, private apiService: ApiServiceProvider) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'My Pokémon', component: MyPokemonPage },
      { title: 'Pokédex', component: PokedexPage },
      { title: 'Catch Pokémon', component: CatchPokemonPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.rootPage = MyPokemonPage;

      // Load all Pokémon to the storage
      this.loadPokemonToStorage();

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

  private loadPokemonToStorage() {
    
    this.storage.get('allPokemon').then(result => {
      if (result === null) {
        this.apiService.getAllPokemon().then(pokemon => {
          this.storage.set('allPokemon', pokemon);
        }).catch(err => {
          console.log('getAllPokemon error:', err);
        });
      }
    });
  }
}
