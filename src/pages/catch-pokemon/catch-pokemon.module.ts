import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CatchPokemonPage } from './catch-pokemon';

@NgModule({
  declarations: [
    CatchPokemonPage,
  ],
  imports: [
    IonicPageModule.forChild(CatchPokemonPage),
  ],
})
export class CatchPokemonPageModule {}
