import { Component } from '@angular/core';
import { IonicPage, Loading, NavParams } from 'ionic-angular';
import { Pokemon } from '../../models/pokemon';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { LoaderServiceProvider } from '../../providers/loader-service/loader-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-pokemon-details',
  templateUrl: 'pokemon-details.html',
})
export class PokemonDetailsPage {

  private loading: Loading;
  private connectionSubscription: Subscription;

  public pokemon: Pokemon;

  constructor(public navParams: NavParams,
              private apiService: ApiServiceProvider,
              private loaderService: LoaderServiceProvider,
              private connectivityService: ConnectivityServiceProvider) {
  }

  /**
   * ionViewDidLoad
   */
  ionViewDidLoad() {
    this.connectionSubscription = this.connectivityService.checkConnection();

    this.loading = this.loaderService.createLoader('Loading Pokémon details...');
    this.apiService.getPokemon(this.navParams.get('id')).then((pokemon: Pokemon) => {
      this.pokemon = pokemon;
      this.loading.dismiss();
    }).catch(error => {
      console.log('getPokemon error:', error);
    });
  }

  /**
   * ionViewWillLeave
   */
  ionViewWillLeave() {
    this.connectionSubscription.unsubscribe();
  }
}
