import AssemblyUtility from "./assemblyUtility.js";
import DataStore from "./dataStore.js";
import Palette from "./palette.js";
import { dataStore } from "./main.js";
import TileSet from "./tileSet.js";

export default class Handlers {

    static handleLoadPalette(system, paletteData) {

        const palette = new Palette(system, 0);
        if (system === 'gg') {
            const array = AssemblyUtility.readAsUint16Array(paletteData);
            palette.loadGameGearPalette(array);
        } else if (system === 'ms') {
            const array = AssemblyUtility.readAsUint8ClampedArray(paletteData);
            palette.loadMasterSystemPalette(array);
        } else throw new Error('System must be either ""ms" or "gg".');
        dataStore.addPalette(palette);

        dataStore.savePalettesToLocalStorage();

    }

    /**
     * 
     * @param {string} tileData 
     */
    static handleLoadTiles(tileData) {

        const array = AssemblyUtility.readAsUint8ClampedArray(tileData);
        const tileSet = TileSet.parsePlanarFormat(array);
        console.log('tileSet', tileSet);
        dataStore.addTileSet(tileSet);
        console.log('dataStore.getTileSets', dataStore.getTileSets());

    }

}