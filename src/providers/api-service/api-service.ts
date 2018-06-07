import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pokedex } from "../../models/pokedex";
import { Pokemon } from '../../models/pokemon';

@Injectable()
export class ApiServiceProvider {
    private baseUrl;

    constructor(public http: HttpClient) {
        this.baseUrl = 'https://pokeapi.co/api/v2/';
    }

    getAllPokemon(): Promise<any> {
        return new Promise<any>((resolve, reject) => this.http.get(this.baseUrl + 'pokedex/national/').subscribe((items: Pokedex) => {
            resolve(items.pokemon_entries);
        }, error => {
            reject(error);
        }));
    }

    getPokemon(id: number): Promise<Pokemon> {
      return new Promise<any>((resolve, reject) => this.http.get(this.baseUrl + `pokemon/${id}`).subscribe((pokemon: Pokemon) => {
        resolve(pokemon);
      }, error => {
        reject(error);
      }));
    }

}
