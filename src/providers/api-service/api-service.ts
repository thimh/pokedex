import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pokedex } from "../../models/pokedex";

@Injectable()
export class ApiServiceProvider {
    private baseUrl;
    private pokemonEntries;

    constructor(public http: HttpClient) {
        this.baseUrl = 'https://pokeapi.co/api/v2/';
    }

    getAllPokemon(): Promise<any> {
        return new Promise<any>((resolve, reject) => this.http.get(this.baseUrl + 'pokedex/national/').subscribe((items: Pokedex) => {
            this.pokemonEntries = items.pokemon_entries;
            resolve(this.pokemonEntries);
        }, error => {
            reject(error);
        }));
    }

}
