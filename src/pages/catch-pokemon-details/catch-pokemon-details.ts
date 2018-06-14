import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  Loading,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';
import { Pokemon } from '../../models/pokemon';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { Shake } from '@ionic-native/shake';
import { Vibration } from '@ionic-native/vibration';
import { Storage } from '@ionic/storage';
import { LoaderServiceProvider } from '../../providers/loader-service/loader-service';

@IonicPage()
@Component({
  selector: 'page-catch-pokemon-details',
  templateUrl: 'catch-pokemon-details.html',
})
export class CatchPokemonDetailsPage {

  private loading: Loading;
  private maxTime: number   = 2;
  private shakeSubscription = null;

  public pokemon: Pokemon;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private apiService: ApiServiceProvider,
              private shake: Shake,
              private vibration: Vibration,
              private storage: Storage,
              private alertCtrl: AlertController,
              private platform: Platform,
              private loaderService: LoaderServiceProvider) {
  }

  /**
   * ionViewDidLoad
   */
  ionViewDidLoad() {
    this.loading = this.loaderService.createLoader('Loading Pokémon details...');
    this.apiService.getPokemon(this.navParams.get('id')).then((pokemon: Pokemon) => {
      this.pokemon = pokemon;
      this.loading.dismiss();
      if (this.platform.is('ios') || this.platform.is('android')) {
        this.catchPokemonEvent();
      }
      else {
        this.deviceNotSupportedMessage();
      }
    }).catch(error => {
      console.log('getPokemon error:', error);
    });
  }

  /**
   * catchPokemonEvent
   */
  private catchPokemonEvent() {
    this.vibration.vibrate(1000);
    this.startTimer();
  }

  /**
   * startTimer
   */
  private startTimer() {
    let isCaught = false;
    const catchPokemonTimeout = setTimeout(() => {
      this.maxTime--;
      if (this.maxTime > 0) {
        this.vibration.vibrate(2000);
        this.shakeSubscription = this.shake.startWatch(60).subscribe(() => {
          isCaught = true;
          clearTimeout(catchPokemonTimeout);
          this.pokemonCaught();
        });
        this.startTimer();
      } else if (!isCaught) {
        this.shakeSubscription.unsubscribe();
        clearTimeout(catchPokemonTimeout);
        this.pokemonFledMessage();
      }
    }, 1000);
  }

  /**
   * pokemonCaught
   *
   * @returns {Promise<void>}
   */
  private async pokemonCaught() {
    let myPokemon: Pokemon[] = [];
    if (this.shakeSubscription) {
      this.shakeSubscription.unsubscribe();
    }
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

    this.pokemonCaughtMessage();
  }

  /**
   * returnToMap
   */
  private returnToMap() {
    this.navCtrl.pop();
  }

  /**
   * Message dialogs section
   */

  /**
   * deviceNotSupportedMessage
   */
  private deviceNotSupportedMessage() {
    let alert = this.alertCtrl.create({
      title: 'This device is not supported',
      message: `<p>The device you are playing on does not support our catching method.</p>
                <p>The Pokémon has been caught for you by a passing stranger.</p>`,
      buttons: [
        {
          text: 'Thanks!',
          handler: () => {
            this.pokemonCaught();
          }
        }
      ]
    });
    alert.present();
  }

  /**
   * pokemonFledMessage
   */
  private pokemonFledMessage() {
    let alert = this.alertCtrl.create({
      title: 'Pokémon fled!',
      message: `<p>Wild ${this.pokemon.name} fled...!</p>`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.returnToMap();
          }
        }
      ]
    });
    alert.present();
  }

  /**
   * pokemonCaughtMessage
   */
  private pokemonCaughtMessage() {
    let alert = this.alertCtrl.create({
      title: 'Pokémon caught!',
      message: `<p>You have caught a ${this.pokemon.name}!</p>`,
      buttons: [
        {
          text: 'Awesome!',
          handler: () => {
            this.returnToMap();
          }
        }
      ]
    });
    alert.present();
  }
}
