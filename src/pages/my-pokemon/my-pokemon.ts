import { Component } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Pokemon } from '../../models/pokemon';
import { PokemonDetailsPage } from '../pokemon-details/pokemon-details';
import { CatchPokemonPage } from '../catch-pokemon/catch-pokemon';

@Component({
  selector: 'my-pokemon',
  templateUrl: 'my-pokemon.html'
})
export class MyPokemonPage {

  private loading: any;
  private loadedPokemonAmount: number = 0;
  private pokemonAmountBeforeLoad: number = 0;

  public pokemonList: Array<Pokemon> = [];

  constructor(public navCtrl: NavController, private loadingCtrl: LoadingController, private storage: Storage) {
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.storage.get('myPokemon').then(items => {
      if (items === null) {

        this.loading.dismiss();
      } else {
        if (items.length < 30) {
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

  public doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.storage.get('myPokemon').then(items => {
        for (let i = this.loadedPokemonAmount; i < (this.loadedPokemonAmount + 30); i++) {
          if (items[i]) {
            this.pokemonList.push(items[i]);
          }
        }
        this.loadedPokemonAmount += 30;
        infiniteScroll.complete();
      });
    }, 500);
  }

  public showDetails(id: number) {
    this.navCtrl.push(PokemonDetailsPage, {id: id});
  }

  public catchPokemon() {
    this.navCtrl.push(CatchPokemonPage);
  }

  private presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Loading caught Pokémon...',
      enableBackdropDismiss: true
    });

    this.loading.present();
  }
}
