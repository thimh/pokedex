import { Component } from '@angular/core';
import { IonicPage, Loading, NavController } from 'ionic-angular';
import { Pokemon } from "../../models/pokemon";
import { PokemonDetailsPage } from '../pokemon-details/pokemon-details';
import { Storage } from '@ionic/storage';
import { LoaderServiceProvider } from '../../providers/loader-service/loader-service';

@IonicPage()
@Component({
  selector: 'page-list',
  templateUrl: 'pokedex.html'
})
export class PokedexPage {

  private loadedPokemonAmount: number = 0;
  private pokemonPerLoad: number = 30;
  private loading: Loading;

  public pokemonList: Array<Pokemon> = [];

  constructor(private navController: NavController, private storage: Storage, private loaderService: LoaderServiceProvider) {
  }

  /**
   * ionViewDidLoad
   */
  ionViewDidLoad() {
    this.loading = this.loaderService.createLoader('Loading Pokédex...');
    this.storage.get('allPokemon').then(items => {
      for (let i = this.loadedPokemonAmount; i < this.pokemonPerLoad; i++) {
        this.pokemonList.push(items[i]);
        this.loadedPokemonAmount++;
      }
    });
    this.loading.dismiss();
  }

  /**
   * showDetails
   *
   * @param {number} id
   */
  public showDetails(id: number) {
    this.navController.push(PokemonDetailsPage, {id: id});
  }

  /**
   * doInfinite
   *
   * @param infiniteScroll
   */
  public doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.storage.get('allPokemon').then(items => {
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
