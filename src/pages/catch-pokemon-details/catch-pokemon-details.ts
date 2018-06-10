import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Pokemon } from '../../models/pokemon';
import { ApiServiceProvider } from '../../providers/api-service/api-service';

/**
 * Generated class for the CatchPokemonDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-catch-pokemon-details',
  templateUrl: 'catch-pokemon-details.html',
})
export class CatchPokemonDetailsPage {

  private loading: any;

  public pokemon: Pokemon;

  constructor(public navCtrl: NavController, public navParams: NavParams, private apiService: ApiServiceProvider, private loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.apiService.getPokemon(this.navParams.get('id')).then((pokemon: Pokemon) => {
      this.pokemon = pokemon;
      this.loading.dismiss();
    }).catch(error => {
      console.log('getPokemon error:', error);
    });
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Loading Pokémon details...',
      enableBackdropDismiss: true
    });

    this.loading.present();
  }

}
