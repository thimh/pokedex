import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CatchPokemonDetailsPage } from './catch-pokemon-details';

@NgModule({
  declarations: [
    CatchPokemonDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(CatchPokemonDetailsPage),
  ],
})
export class CatchPokemonDetailsPageModule {}
