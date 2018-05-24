import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { Pokemon } from "../../models/pokemon";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage implements OnInit {
  // selectedItem: any;
  // icons: string[];
  // items: Array<{title: string, note: string, icon: string}>;
  //
  // constructor(public navCtrl: NavController, public navParams: NavParams) {
  //   // If we navigated to this page, we will have an item available as a nav param
  //   this.selectedItem = navParams.get('item');
  //
  //   // Let's populate this page with some filler content for funzies
  //   this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
  //   'american-football', 'boat', 'bluetooth', 'build'];
  //
  //   this.items = [];
  //   for (let i = 1; i < 11; i++) {
  //     this.items.push({
  //       title: 'Item ' + i,
  //       note: 'This is item #' + i,
  //       icon: this.icons[Math.floor(Math.random() * this.icons.length)]
  //     });
  //   }
  // }
  //
  // itemTapped(event, item) {
  //   // That's right, we're pushing to ourselves!
  //   this.navCtrl.push(ListPage, {
  //     item: item
  //   });
  // }

  private apiService;
  private pokemonList: Array<Pokemon>;

  constructor(apiService: ApiServiceProvider) {
    this.apiService = apiService;
  }

  ngOnInit() {
    this.apiService.getAllPokemon().then(pokemon => {
      this.pokemonList = pokemon;
    }).catch(err => {
      console.log('getAllPokemon error:', err);
    });
  }

  doInfinite(event): Promise<any> {
    console.log('before return', event);
    return new Promise<any>(resolve => {
      // console.log('Begin async');
      //
      // setTimeout(() => {
      //     for (var i = 0; i < 30; i++) {
      //         this.pokemonList.push(this.pokemonList.length)
      //     }
      //
      //     console.log('Ended');
      //     resolve();
      // }, 500);
    });
  }
}
