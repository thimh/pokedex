import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PokedexPage } from './pokedex';

@NgModule({
  declarations: [
    PokedexPage,
  ],
  imports: [
    IonicPageModule.forChild(PokedexPage),
  ],
})
export class PokedexPageModule {}
