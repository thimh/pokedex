import { Component } from '@angular/core';
import { IonicPage, Loading, ModalController, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Pokemon } from '../../models/pokemon';
import { PokemonDetailsPage } from '../pokemon-details/pokemon-details';
import { CatchPokemonPage } from '../catch-pokemon/catch-pokemon';
import { LoaderServiceProvider } from '../../providers/loader-service/loader-service';
import { SettingsComponent } from '../../components/settings/settings';

@IonicPage()
@Component({
  selector: 'my-pokemon',
  templateUrl: 'my-pokemon.html'
})
export class MyPokemonPage {

  private loading: Loading;
  private loadedPokemonAmount: number = 0;
  private pokemonAmountBeforeLoad: number = 0;
  private pokemonPerLoad: number = 30;

  public pokemonList: Array<Pokemon> = [];

  constructor(public navCtrl: NavController, private loaderService: LoaderServiceProvider, private storage: Storage, private modalCtrl: ModalController) {
  }

  /**
   * ionViewWillEnter
   */
  ionViewWillEnter() {
    this.pokemonList = [];
    this.getMyPokemon();
  }

  /**
   * ionViewDidLoad
   */
  // ionViewDidLoad() {
  //   this.getMyPokemon();
  // }

  /**
   * getMyPokemon
   */
  private getMyPokemon() {
    this.loading = this.loaderService.createLoader('Loading caught Pokémon...');
    this.storage.get('myPokemon').then(items => {
      if (items === null) {
        this.loading.dismiss();
      } else {
        if (items.length < this.pokemonPerLoad) {
          this.pokemonAmountBeforeLoad = items.length;
        }
        for (let i = this.loadedPokemonAmount; i < this.pokemonAmountBeforeLoad; i++) {
          this.pokemonList.push(items[i]);
          this.loadedPokemonAmount++;
        }
        this.loading.dismiss();
      }
    });
  }

  /**
   * showDetails
   *
   * @param {number} id
   */
  public showDetails(id: number) {
    this.navCtrl.push(PokemonDetailsPage, {id: id});
  }

  /**
   * catchPokemon
   */
  public catchPokemon() {
    this.navCtrl.push(CatchPokemonPage);
  }

  /**
   * presentSettingsModal
   */
  public presentSettingsModal() {
    let settingsModal = this.modalCtrl.create(SettingsComponent);
    settingsModal.onDidDismiss(() => {
      this.pokemonList = [];
      this.getMyPokemon();
    });
    settingsModal.present();
  }

  /**
   * doInfinite
   *
   * @param infiniteScroll
   */
  public doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.storage.get('myPokemon').then(items => {
        for (let i = this.loadedPokemonAmount; i < (this.loadedPokemonAmount + this.pokemonPerLoad); i++) {
          if (items[i]) {
            this.pokemonList.push(items[i]);
          }
        }
        this.loadedPokemonAmount += this.pokemonPerLoad;
        infiniteScroll.complete();
      });
    }, 500);
  }
}
