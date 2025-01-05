import PersistentUIStateFactory from "../factory/persistentUIStateFactory.js";
import PersistentUIState from "../models/persistentUIState.js";


/**
 * Provides persistent UI state serialisation functions.
 */
export default class PersistentUIStateJsonSerialiser {


    /**
     * Serialises a persistent UI state object to a JSON string.
     * @param {PersistentUIState} value - The persistent UI state object to serialise.
     * @returns {string}
     */
    static serialise(value) {
        const result = PersistentUIStateJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Deserialises a JSON string into an persistent UI state object.
     * @param {string} jsonString - Serialisable persistent UI state object as JSON string.
     * @throws When the JSON string is null or empty.
     * @returns {PersistentUIState}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Please pass a valis JSON string.');

        /** @type {PersistentUISerialisable} */
        const deserialised = JSON.parse(jsonString);
        return PersistentUIStateJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile set object to a serialisable one.
     * @param {PersistentUIState} value - The persistent UI state object to serialise.
     * @throws When a valid persistent UI state object was not passed.
     * @returns {PersistentUISerialisable} 
     */
    static toSerialisable(value) {
        if (!value instanceof PersistentUIState) throw new Error('Please pass a persistent UI state.');
      
        return {
            lastProjectId: value.lastProjectId,
            importPaletteAssemblyCode: value.importPaletteAssemblyCode,
            importPaletteSystem: value.importPaletteSystem,
            importTileAssemblyCode: value.importTileAssemblyCode,
            paletteIndex: value.paletteIndex,
            scale: value.scale,
            displayNativeColour: value.displayNativeColour,
            showTileGrid: value.showTileGrid,
            showPixelGrid: value.showPixelGrid,
            highlightSameTiles: value.highlightSameTiles,
            documentationVisibleOnStartup: value.documentationVisibleOnStartup,
            welcomeVisibleOnStartup: value.welcomeVisibleOnStartup,
            theme: value.theme,
            backgroundTheme: value.backgroundTheme,
            projectDropDownSort: value.projectDropDownSort,
            welcomeScreenProjectSort: value.welcomeScreenProjectSort,
            projectStates: value.projectStates
        };
    }

    /**
     * Converts a serialisable tiles set back to a tile set.
     * @param {PersistentUIState} serialisable - Serialisable tile set to convert.
     * @returns {TileSet}
     */
    static fromSerialisable(serialisable) {
        const result = PersistentUIStateFactory.create();
        if (serialisable.lastProjectId) {
            result.lastProjectId = serialisable.lastProjectId;
        }
        if (serialisable.importPaletteAssemblyCode) {
            result.importPaletteAssemblyCode = serialisable.importPaletteAssemblyCode;
        }
        if (serialisable.importPaletteSystem) {
            result.importPaletteSystem = serialisable.importPaletteSystem;
        }
        if (serialisable.importTileAssemblyCode) {
            result.importTileAssemblyCode = serialisable.importTileAssemblyCode;
        }
        if (serialisable.paletteIndex) {
            result.paletteIndex = serialisable.paletteIndex;
        }
        if (serialisable.scale) {
            result.scale = serialisable.scale;
        }
        if (typeof serialisable.displayNativeColour === 'boolean') {
            result.displayNativeColour = serialisable.displayNativeColour;
        }
        if (typeof serialisable.showTileGrid === 'boolean') {
            result.showTileGrid = serialisable.showTileGrid;
        }
        if (typeof serialisable.showPixelGrid === 'boolean') {
            result.showPixelGrid = serialisable.showPixelGrid;
        }
        if (typeof serialisable.highlightSameTiles === 'boolean') {
            result.highlightSameTiles = serialisable.highlightSameTiles;
        }
        if (typeof serialisable.documentationVisibleOnStartup === 'boolean') {
            result.documentationVisibleOnStartup = serialisable.documentationVisibleOnStartup;
        }
        if (typeof serialisable.welcomeVisibleOnStartup === 'boolean') {
            result.welcomeVisibleOnStartup = serialisable.welcomeVisibleOnStartup;
        }
        if (typeof serialisable.theme === 'string') {
            result.theme = serialisable.theme;
        }
        if (typeof serialisable.backgroundTheme === 'string') {
            result.backgroundTheme = serialisable.backgroundTheme;
        } else if (serialisable.backgroundTheme === null) {
            result.backgroundTheme = null;
        }
        if (serialisable.projectDropDownSort && serialisable.projectDropDownSort.field && serialisable.projectDropDownSort.direction) {
            result.projectDropDownSort = serialisable.projectDropDownSort;
        }
        if (serialisable.welcomeScreenProjectSort && serialisable.welcomeScreenProjectSort.field && serialisable.welcomeScreenProjectSort.direction) {
            result.welcomeScreenProjectSort = serialisable.welcomeScreenProjectSort;
        }
        if (serialisable.projectStates) {
            result.projectStates = serialisable.projectStates;
        } else {
            result.projectStates = {};
        }
        return result;
    }


}

/**
 * @typedef {Object} PersistentUISerialisable
 * @property {string} lastProjectId
 * @property {string} importPaletteAssemblyCode
 * @property {string} importPaletteSystem
 * @property {string} importTileAssemblyCode
 * @property {number} paletteIndex
 * @property {number} scale
 * @property {boolean} displayNativeColour
 * @property {boolean} showTileGrid
 * @property {boolean} showPixelGrid
 * @property {boolean} highlightSameTiles
 * @property {boolean} documentationVisibleOnStartup
 * @property {boolean} welcomeVisibleOnStartup
 * @property {string} theme
 * @property {string?} backgroundTheme
 * @property {import('./../types.js').SortEntry} projectDropDownSort
 * @property {import('./../types.js').SortEntry} welcomeScreenProjectSort
 * @property {Object.<string, object>} projectStates
*/
