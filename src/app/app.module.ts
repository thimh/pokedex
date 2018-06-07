import { MyPokemonPage } from '../pages/my-pokemon/my-pokemon';
import { PokedexPage } from '../pages/pokedex/pokedex';
import { PokemonDetailsPage } from '../pages/pokemon-details/pokemon-details';
import { CatchPokemonPage } from '../pages/catch-pokemon/catch-pokemon';

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ApiServiceProvider } from '../providers/api-service/api-service';
import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from '@angular/http';
import { Device } from '@ionic-native/device';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    MyPokemonPage,
    PokedexPage,
    PokemonDetailsPage,
    CatchPokemonPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MyPokemonPage,
    PokedexPage,
    PokemonDetailsPage,
    CatchPokemonPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiServiceProvider,
    Device,
    Geolocation,
  ]
})
export class AppModule {
}
