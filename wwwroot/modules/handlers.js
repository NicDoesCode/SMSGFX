import AssemblyUtility from "./assemblyUtility.js";
import Palette from "./palette.js";
import DataStore from "./dataStore.js";
import TileSet from "./tileSet.js";
import UI from "./ui.js";

export default class Handlers {

    #dataStore;
    #ui;

    /**
     * Initialises a new instance of a handlers class.
     * @param {DataStore} dataStore The data store to use.
     * @param {UI} dataStore The data store to use.
     */
    constructor(dataStore, ui) {
        this.#dataStore = dataStore;
        this.#ui = ui;
    }

}