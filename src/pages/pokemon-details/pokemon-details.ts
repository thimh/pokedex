import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Pokemon } from '../../models/pokemon';
import { ApiServiceProvider } from '../../providers/api-service/api-service';

/**
 * Generated class for the PokemonDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pokemon-details',
  templateUrl: 'pokemon-details.html',
})
export class PokemonDetailsPage {

  public pokemon: Pokemon;

  constructor(public navCtrl: NavController, public navParams: NavParams, private apiService: ApiServiceProvider) {
  }

  ionViewDidLoad() {
    this.apiService.getPokemon(this.navParams.get('id')).then((pokemon: Pokemon) => {
      this.pokemon = pokemon;
      console.log(pokemon);
    }).catch(error => {
      console.log('getPokemon error:', error);
    });
  }

}
