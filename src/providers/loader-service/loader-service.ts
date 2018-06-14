import { Injectable } from '@angular/core';
import { Loading, LoadingController } from 'ionic-angular';

@Injectable()
export class LoaderServiceProvider {

  constructor(private loadingCtrl: LoadingController) {
  }

  /**
   * createLoader
   *
   * @param {string} content
   * @param {string} spinner
   * @param {boolean} enableBackdropDismiss
   * @returns {Loading}
   */
  public createLoader(content: string,
                      spinner: string                = 'circles',
                      enableBackdropDismiss: boolean = false
  ): Loading {
    let loader = this.loadingCtrl.create({
      spinner: spinner,
      content: content,
      enableBackdropDismiss: enableBackdropDismiss
    });

    loader.present();
    return loader;
  }

}
