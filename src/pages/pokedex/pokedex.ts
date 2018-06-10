import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { Pokemon } from "../../models/pokemon";
import { PokemonDetailsPage } from '../pokemon-details/pokemon-details';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-list',
  templateUrl: 'pokedex.html'
})
export class PokedexPage implements OnInit {

  // noinspection JSMismatchedCollectionQueryUpdate
  private pokemonList: Array<Pokemon> = [];
  private loadedPokemonAmount: number = 0;
  private loading: any;

  constructor(private apiService: ApiServiceProvider, private navController: NavController, private storage: Storage, private loadingCtrl: LoadingController) {
  }

  ngOnInit() {
    this.presentLoading();
    this.storage.get('allPokemon').then(items => {
      for (let i = this.loadedPokemonAmount; i < 30; i++) {
        this.pokemonList.push(items[i]);
        this.loadedPokemonAmount++;
      }
    });
    this.loading.dismiss();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.storage.get('allPokemon').then(items => {
        for (let i = this.loadedPokemonAmount; i < (this.loadedPokemonAmount + 30); i++) {
          this.pokemonList.push(items[i]);
        }
        this.loadedPokemonAmount += 30;
        infiniteScroll.complete();
      });
    }, 500);
  }

  showDetails(id: number) {
    this.navController.push(PokemonDetailsPage, {id: id});
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Loading Pokédex...',
      enableBackdropDismiss: true
    });

    this.loading.present();
  }
}
