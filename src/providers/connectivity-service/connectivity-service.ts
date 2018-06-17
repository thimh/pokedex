import { Injectable } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class ConnectivityServiceProvider {

  constructor(private network: Network, private alertCtrl: AlertController, private platform: Platform, private nativeSettings: OpenNativeSettings) {
  }

  public checkConnection(): Subscription {
    return this.network.onchange().subscribe(() => {
      if (this.network.type === 'unknown' || this.network.type === 'none') {
        this.noNetworkMessage();
      } else if (this.network.type !== null) {
        this.reconnectedMessage();
      }
    });
  }

  /**
   * noNetworkMessage
   */
  private noNetworkMessage() {
    this.alertCtrl.create({
      title: 'No network',
      message: `<p>You are not connected to a network!</p>
              <p>You require an internet connection to play with Pokémon...</p>`,
      buttons: [
        {
          text: 'Ok, I shall connect',
          handler: () => {
            if (this.platform.is('ios') || this.platform.is('android')) {
              this.nativeSettings.open('wifi');
            }
          }
        }
      ]
    }).present();
  }

  /**
   * reconnectedMessage
   */
  private reconnectedMessage() {
    this.alertCtrl.create({
      title: 'Reconnected',
      message: `<p>You have reconnected to a network!</p>`,
      buttons: [
        {
          text: `Let's play Pokémon!`,
          handler: () => {
          }
        }
      ]
    }).present();
  }
}
