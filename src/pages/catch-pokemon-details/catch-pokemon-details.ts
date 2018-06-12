import { Component } from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController, NavParams, Platform} from 'ionic-angular';
import { Pokemon } from '../../models/pokemon';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { Shake } from '@ionic-native/shake';
import { Vibration } from '@ionic-native/vibration';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-catch-pokemon-details',
  templateUrl: 'catch-pokemon-details.html',
})
export class CatchPokemonDetailsPage {

  private loading: any;
  private maxTime: number = 2;
  private shakeSubscription = null;

  public pokemon: Pokemon;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private apiService: ApiServiceProvider,
              private loadingCtrl: LoadingController,
              private shake: Shake,
              private vibration: Vibration,
              private storage: Storage,
              private alertCtrl: AlertController,
              private platform: Platform) {
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.apiService.getPokemon(this.navParams.get('id')).then((pokemon: Pokemon) => {
      this.pokemon = pokemon;
      this.loading.dismiss();
      if (this.platform.is('ios') || this.platform.is('android')) {
        this.catchPokemonEvent();
      }
      else {
        this.alertCtrl.create({
        title: 'This device is not supported',
        message: `The device you are playing on does not support catching Pokémon.`,
        buttons: [
          {
            text: 'Ok',
            handler: () => {
              this.pokemonCaught();
            }
          }
        ]
      }).present();
      }
    }).catch(error => {
      console.log('getPokemon error:', error);
    });
  }

  private presentLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Loading Pokémon details...',
      enableBackdropDismiss: true
    });

    this.loading.present();
  }

  private catchPokemonEvent() {
    this.vibration.vibrate(1000);
    this.startTimer();
  }

  private startTimer() {
    setTimeout(() => {
      this.maxTime--;
      if (this.maxTime > 0) {
        this.vibration.vibrate(2000);
        this.shakeSubscription = this.shake.startWatch(50).subscribe(() => {
          this.pokemonCaught();
        });
        this.startTimer();
      } else {
        this.shakeSubscription.unsubscribe();
        this.pokemonFledMessage();
      }
    }, 1000);
  }

  private async pokemonCaught() {
    let myPokemon: Pokemon[] = [];
    await this.storage.get('myPokemon').then(items => {
      if (items === null) {
        myPokemon.push(this.pokemon);
        this.storage.set('myPokemon', myPokemon);
      } else {
        myPokemon = items;
        myPokemon.push(this.pokemon);
        this.storage.set('myPokemon', myPokemon);
      }
    });

    this.returnToMap();
  }

  private returnToMap() {
    this.navCtrl.pop();
  }

  private pokemonFledMessage() {
    let alert = this.alertCtrl.create({
      title: 'Pokémon fled!',
      message: `<p>Wild ${this.pokemon.name} fled...!</p>`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.returnToMap()
          }
        }
      ]
    });
    alert.present();
  }
}
