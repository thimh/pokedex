import { Component } from '@angular/core';
import { AlertController, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the SettingsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})
export class SettingsComponent {

  constructor(private viewCtrl: ViewController, private alertCtrl: AlertController, private storage: Storage) {
  }

  /**
   * dismiss
   */
  public dismiss() {
    this.viewCtrl.dismiss();
  }

  /**
   * releasePokemon
   */
  public releasePokemon() {
    this.releasePokemonMessage();
  }

  /**
   * setThemFree
   */
  private setThemFree() {
    this.storage.remove('myPokemon');
    this.pokemonReleasedMessage();
  }

  /**
   * releasePokemonMessage
   */
  private releasePokemonMessage() {
    let alert = this.alertCtrl.create({
      title: 'Release all Pokémon?',
      message: `Are you sure you want to set all your Pokémon free?`,
      buttons: [
        {
          text: 'I would regret',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Set free',
          handler: () => {
            this.setThemFree();
          }
        }
      ]
    });
    alert.present();
  }

  private pokemonReleasedMessage() {
    let alert = this.alertCtrl.create({
      title: 'All Pokémon set free',
      message: `All your Pokémon have been released back into the wild...`,
      buttons: [
        {
          text: 'Bye, dear Pokémon!',
          handler: () => {
          }
        }
      ]
    });
    alert.present();
  }
}
