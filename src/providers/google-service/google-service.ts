import { ElementRef, Injectable } from '@angular/core';
import { google } from 'google-maps';
import { Storage } from '@ionic/storage';

declare let google: google;

@Injectable()
export class GoogleServiceProvider {
  private script: any;
  private googleApiKey: string = 'AIzaSyCTNYFaQaLgBHiQ-xVhUDhLZPw7e4wUVBM';

  private pokemonToSpawnAmount: number = 5;

  private catchAreaIndicatorColor: string = '#AAAAAA';

  constructor(private storage: Storage) {
  }

  /**
   * loadScript
   *
   * @returns {boolean}
   */
  public loadScript(): boolean {
    try {
      if (document.getElementById('googleMaps')) {
        return true;
      }
      this.script     = document.createElement('script');
      this.script.id  = 'googleMaps';
      this.script.src = 'https://maps.google.com/maps/api/js?v=3.exp&libraries=visualization&key=' + this.googleApiKey;

      document.body.appendChild(this.script);
      return true;
    } catch (error) {
      console.log('Load Script Error: ' + error);
      return false;
    }
  }

  /**
   * initMap
   *
   * @param {Position} position
   * @param {ElementRef} mapElement
   * @returns {google.maps.Map}
   */
  public initMap(position: Position,
                 mapElement: ElementRef
  ): google.maps.Map {
    const location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    let mapOptions = {
      center: location,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    return new google.maps.Map(mapElement.nativeElement, mapOptions);
  }

  /**
   * addPokemonMarkers
   *
   * @param {number} minLat
   * @param {number} maxLat
   * @param {number} minLng
   * @param {number} maxLng
   * @param {Array<Pokemon>} pokemonList
   * @param {google.maps.Map} map
   * @param {google.maps.Animation} animation
   * @returns {Array<google.maps.Marker>}
   */
  public addPokemonMarkers(minLat: number,
                           maxLat: number,
                           minLng: number,
                           maxLng: number,
                           pokemonList: Array<any>,
                           map: google.maps.Map,
                           animation: google.maps.Animation = google.maps.Animation.DROP
  ): Array<google.maps.Marker> {
    const markers           = [];
    const pokemonAndMarkers = [];

    for (let pokemonAmount = this.pokemonToSpawnAmount; pokemonAmount > 0; pokemonAmount--) {
      const randomLat = (Math.random() * (maxLat - minLat) + minLat);
      const randomLng = (Math.random() * (maxLng - minLng) + minLng);
      const location  = new google.maps.LatLng(randomLat, randomLng);
      const pokemon   = pokemonList[Math.floor(Math.random() * pokemonList.length)];

      const marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: './assets/imgs/pokemon-marker.png',
        animation: animation,
      });

      markers.push(marker);

      pokemonAndMarkers.push({
        pokemon: {
          entry_number: pokemon.entry_number,
          name: pokemon.pokemon_species.name
        },
        markerPosition: {
          lat: marker.getPosition().lat(),
          lng: marker.getPosition().lng()
        }
      });
    }

    // Set the marker positions and the info of their Pokémon to the storage
    // Enables the ability to access them everywhere where needed
    this.storage.set('pokemonMarkers', pokemonAndMarkers);

    return markers;
  }

  /**
   * My location area
   */

  /**
   * addMyLocationMarker
   *
   * @param {google.maps.LatLng} location
   * @param {google.maps.Map} map
   * @param {string} title
   * @param {google.maps.Animation} animation
   * @returns {google.maps.Marker}
   */
  public addMyLocationMarker(location: google.maps.LatLng,
                             map: google.maps.Map,
                             title: string,
                             animation: google.maps.Animation = google.maps.Animation.DROP
  ): google.maps.Marker {
    return new google.maps.Marker({
      position: location,
      map: map,
      title: title,
      animation: animation
    });
  }

  /**
   * createCatchAreaIndicator
   *
   * @param {google.maps.Map} map
   * @param {google.maps.Marker} marker
   */
  public createCatchAreaIndicator(map: google.maps.Map,
                                  marker: google.maps.Marker
  ): google.maps.Circle {
    const catchAreaIndicator = new google.maps.Circle({
      map: map,
      radius: 39.25,
      fillColor: this.catchAreaIndicatorColor,
      strokeColor: this.catchAreaIndicatorColor
    });
    catchAreaIndicator.bindTo('center', marker, 'position');
    return catchAreaIndicator;
  }

  /**
   * createMarkerInfo
   *
   * @param {string} content
   * @returns {google.maps.InfoWindow}
   */
  public createMarkerInfo(content: string): google.maps.InfoWindow {
    return new google.maps.InfoWindow({
      content: content
    });
  }

  /**
   * Development/demo section
   */

  /**
   * addNearbyPokemonMarker
   *
   * @param {number} lat
   * @param {number} lng
   * @param {Array<any>} pokemonList
   * @param {google.maps.Map} map
   * @returns {google.maps.Marker}
   */
  public async addNearbyPokemonMarker(lat: number,
                                      lng: number,
                                      pokemonList: Array<any>,
                                      map: google.maps.Map
  ): Promise<google.maps.Marker> {
    const locationNearby = new google.maps.LatLng(lat, lng);
    const pokemonNearby  = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    const markerNearby = new google.maps.Marker({
      position: locationNearby,
      map: map,
      icon: './assets/imgs/pokemon-marker.png',
      animation: google.maps.Animation.DROP,
    });

    await this.storage.get('pokemonMarkers').then(async (markers: Array<any>) => {
      markers.push({
        pokemon: {
          entry_number: pokemonNearby.entry_number,
          name: pokemonNearby.pokemon_species.name
        },
        markerPosition: {
          lat: markerNearby.getPosition().lat(),
          lng: markerNearby.getPosition().lng()
        }
      });
      await this.storage.set('pokemonMarkers', markers);
    });

    return new Promise<google.maps.Marker>(resolve => {
      resolve(markerNearby);
    });
  }
}
