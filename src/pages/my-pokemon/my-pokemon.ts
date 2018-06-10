import { Component } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'my-pokemon.html'
})
export class MyPokemonPage {

  private loading: any;

  constructor(public navCtrl: NavController, private loadingCtrl: LoadingController) {

  }

  ionViewDidLoad() {
    this.presentLoading();

    this.loading.dismiss();
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Loading caught Pokémon...',
      enableBackdropDismiss: true
    });

    this.loading.present();
  }
}
