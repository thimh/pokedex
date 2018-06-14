import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyPokemonPage } from './my-pokemon';

@NgModule({
  declarations: [
    MyPokemonPage,
  ],
  imports: [
    IonicPageModule.forChild(MyPokemonPage),
  ],
})
export class MyPokemonPageModule {}
