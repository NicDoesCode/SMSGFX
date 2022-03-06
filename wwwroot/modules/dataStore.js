import Palette from "./palette.js";
import TileSet from "./tileSet.js";
import PaletteList from "./paletteList.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappUi';
const LOCAL_STORAGE_PALETTES = 'smsgfxpalettes';
const LOCAL_STORAGE_TILES = 'smsgfxtiles';

/** @type {appUi} */
let appUi = {
    lastPaletteInput: '',
    lastPaletteInputSystem: 'gg',
    lastTileInput: '',
    lastSelectedPalette: 0
};

export default class DataStore {

    /** @type {PaletteList} */
    #palettes;
    /** @type {Array<TileSet>} */
    #tileSets = [];

    constructor() {
        // Load UI from local storage
        const loaded = localStorage.getItem(LOCAL_STORAGE_APPUI);
        if (loaded) {
            if (loaded.lastPaletteInput) appUi.lastPaletteInput = loaded.lastPaletteInput;
            if (loaded.lastPaletteInputSystem) appUi.lastPaletteInputSystem = loaded.lastPaletteInputSystem;
            if (loaded.lastTileInput) appUi.lastTileInput = loaded.lastTileInput;
            if (loaded.lastSelectedPalette) appUi.lastSelectedPalette = loaded.lastSelectedPalette;
        }

        // Load palettes from local storage
        const serialisedPalettes = localStorage.getItem(LOCAL_STORAGE_PALETTES);
        this.#palettes = PaletteList.deserialise(serialisedPalettes);
        this.#palettes.onchanged(() => {
            localStorage.setItem(LOCAL_STORAGE_PALETTES, this.#palettes.serialise());
        });
    }

    /**
     * Gets or sets the last used palette input value.
     */
    get lastPaletteInputSystem() {
        return appUi.lastPaletteInputSystem;
    }
    set lastPaletteInputSystem(value) {
        if (!value || (value !== 'ms' && value !== 'gg')) {
            value = 'gg';
        }
        appUi.lastPaletteInputSystem = value;
        this.#updateUILocalStorage();
    }


    /**
     * Gets or sets the last used palette input value.
     */
    get lastPaletteInput() {
        return appUi.lastPaletteInput;
    }
    set lastPaletteInput(value) {
        appUi.lastPaletteInput = value;
        this.#updateUILocalStorage();
    }

    /**
     * Gets or sets the last tile input value.
     */
    get lastTileInput() {
        return appUi.lastPaletteInput;
    }
    set lastTileInput(value) {
        appUi.lastTileInput = value;
        this.#updateUILocalStorage();
    }

    #updateUILocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_APPUI, JSON.stringify(appUi));
    }

    get paletteList() {
        return this.#palettes;
    }




    /**
     * Adds a palette to the palettes list.
     * @param {Palette} palette Palette to add.
     */
    addPalette(palette) {
        this.#palettes.push(palette);
    }

    /**
     * Gets the palettes.
     * @returns {Palette[]}
     */
    getPalettes() {
        return this.#palettes;
    }

    /**
     * Adds a tile set to the tile sets list.
     * @param {TileSet} tileSet Tile set to add.
     */
    addTileSet(tileSet) {
        this.#tileSets.push(tileSet);
    }

    /**
     * Gets the tile sets.
     * @returns {TileSet[]}
     */
    getTileSets() {
        return this.#tileSets;
    }

    /**
     * Saves the current palette list to local storage.
     */
    savePalettesToLocalStorage() {
        const jsonPalettes = this.#palettes.map(palette => {
            return palette.toJSON();
        });
        localStorage.setItem(LOCAL_STORAGE_PALETTES, JSON.stringify(jsonPalettes));
    }

    /**
     * Loads the palette list from local storage.
     */
    loadPalettesFromLocalStorage() {
        const localData = localStorage.getItem(LOCAL_STORAGE_PALETTES);
        if (localData) {
            /** @type {string[]} */
            const jsonPalettes = JSON.parse(localData);
            jsonPalettes.forEach(jsonPalette => {
                this.#palettes.push(Palette.fromJSON(jsonPalette));
            });
        }
    }

    saveTilesToLocalStorage() {
        const tileSets = this.#tileSets.map(tileSet => {
            return tileSet.toJSON();
        });
        localStorage.setItem('tileSets', JSON.stringify(tileSets));
    }

    loadTileSetsFromLocalStorage() {
        const localData = localStorage.getItem('tileSets');
        if (localData) {
            /** @type {string[]} */
            const jsonTileSets = JSON.parse(localData);
            jsonTileSets.forEach(jsonTileSet => {
                this.#tileSets.push(TileSet.fromJSON(jsonTileSet));
            });
        }
    }

}


/**
 * @typedef appUi
 * @type {object}
 * @property {string} lastPaletteInput - The HEX encoded native colour.
 * @property {string} lastPaletteInputSystem - Colour encoded in HEX format.
 * @property {string} lastTileInput - The HEX encoded native colour.
 * @property {number} lastSelectedPalette - The HEX encoded native colour.
 */