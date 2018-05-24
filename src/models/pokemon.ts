export class Pokemon {
    forms: [{
        url: string,
        name: string
    }];
    abilities: [{
        slot: number,
        is_hidden: boolean,
        ability: {
            url: string,
            name:string
        }
    }];
    stats: [{
        stat: {
            url: string,
            name: string
        },
        effort: number,
        base_stat: number
    }];
    name: string;
    weight: number;
    moves: [{
        version_group_details: [{
            move_learn_method: {
                url: string,
                name: string
            },
            level_learned_at: number,
            version_group: {
                url: string,
                name: string
            }
        }];
        move: {
            url: string,
            name: string
        }
    }];
    sprites: {
        back_female: string|null,
        back_shiny_female: string|null,
        back_default: string|null,
        front_female: string|null,
        front_shiny_female: string|null,
        back_shiny: string|null,
        front_default: string|null,
        front_shiny: string|null
    };
    held_items: [{
        item: {
            url: string,
            name: string
        },
        version_details: [{
            version: {
                url: string,
                name: string
            },
            rarity: number
        }]
    }];
    location_area_encounters: string|null;
    height: number;
    is_default: boolean;
    species: {
        url: string,
        name: string
    };
    id: number;
    order: number;
    game_indices: [{
        version: {
            url: string,
            name: string
        },
        game_index: number
    }];
    base_experience: number;
    types: [{
        slot: number,
        type: {
            url: string,
            name: string
        }
    }];
}