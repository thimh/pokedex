import { Component } from '@angular/core';
import { IonicPage, Loading, NavParams } from 'ionic-angular';
import { Pokemon } from '../../models/pokemon';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { LoaderServiceProvider } from '../../providers/loader-service/loader-service';

@IonicPage()
@Component({
  selector: 'page-pokemon-details',
  templateUrl: 'pokemon-details.html',
})
export class PokemonDetailsPage {

  private loading: Loading;

  public pokemon: Pokemon;

  constructor(public navParams: NavParams, private apiService: ApiServiceProvider, private loaderService: LoaderServiceProvider) {
  }

  /**
   * ionViewDidLoad
   */
  ionViewDidLoad() {
    this.loading = this.loaderService.createLoader('Loading Pokémon details...');
    this.apiService.getPokemon(this.navParams.get('id')).then((pokemon: Pokemon) => {
      this.pokemon = pokemon;
      this.loading.dismiss();
    }).catch(error => {
      console.log('getPokemon error:', error);
    });
  }
}
