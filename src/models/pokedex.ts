export class Pokedex {
    name: string;
    region: string|null;
    version_groups: [{
        url: string,
        name: string
    }];
    is_main_series: boolean;
    descriptions: [{
        description: string,
        language: {
            url: string,
            name: string
        }
    }];
    pokemon_entries: [{
        entry_number: number,
        pokemon_species: {
            url: string,
            name: string
        }
    }];
    id: number;
    names: [{
        name: string,
        language: {
            url: string,
            name: string
        }
    }]
}