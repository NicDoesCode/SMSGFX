import PersistentUIStateFactory from "../factory/persistentUIStateFactory.js";
import PersistentUIState from "../models/persistentUIState.js";

export default class PersistentUIStateJsonSerialiser {


    /**
     * Serialises the class.
     * @param {PersistentUIState} appUI - The app UI object to serialise.
     * @returns {string}
     */
    static serialise(appUI) {
        /** @type {PersistentUISerialisable} */
        const result = {
            lastProjectId: appUI.lastProjectId,
            importPaletteAssemblyCode: appUI.importPaletteAssemblyCode,
            importPaletteSystem: appUI.importPaletteSystem,
            importTileAssemblyCode: appUI.importTileAssemblyCode,
            paletteIndex: appUI.paletteIndex,
            scale: appUI.scale,
            displayNativeColour: appUI.displayNativeColour,
            showTileGrid: appUI.showTileGrid,
            showPixelGrid: appUI.showPixelGrid,
            documentationVisibleOnStartup: appUI.documentationVisibleOnStartup,
            welcomeVisibleOnStartup: appUI.welcomeVisibleOnStartup,
            theme: appUI.theme,
            backgroundTheme: appUI.backgroundTheme,
            projectDropDownSort: appUI.projectDropDownSort,
            welcomeScreenProjectSort: appUI.welcomeScreenProjectSort,
            projectStates: appUI.projectStates
        };
        return JSON.stringify(result);
    }

    /**
     * Deserialises a JSON string into an AppUI object.
     * @param {string} value JSON string.
     * @returns {PersistentUIState}
     */
    static deserialise(value) {
        const result = PersistentUIStateFactory.create();
        /** @type {PersistentUISerialisable} */
        const deserialised = JSON.parse(value);
        if (deserialised) {
            if (deserialised.lastProjectId) {
                result.lastProjectId = deserialised.lastProjectId;
            }
            if (deserialised.importPaletteAssemblyCode) {
                result.importPaletteAssemblyCode = deserialised.importPaletteAssemblyCode;
            }
            if (deserialised.importPaletteSystem) {
                result.importPaletteSystem = deserialised.importPaletteSystem;
            }
            if (deserialised.importTileAssemblyCode) {
                result.importTileAssemblyCode = deserialised.importTileAssemblyCode;
            }
            if (deserialised.paletteIndex) {
                result.paletteIndex = deserialised.paletteIndex;
            }
            if (deserialised.scale) {
                result.scale = deserialised.scale;
            }
            if (typeof deserialised.displayNativeColour === 'boolean') {
                result.displayNativeColour = deserialised.displayNativeColour;
            }
            if (typeof deserialised.showTileGrid === 'boolean') {
                result.showTileGrid = deserialised.showTileGrid;
            }
            if (typeof deserialised.showPixelGrid === 'boolean') {
                result.showPixelGrid = deserialised.showPixelGrid;
            }
            if (typeof deserialised.documentationVisibleOnStartup === 'boolean') {
                result.documentationVisibleOnStartup = deserialised.documentationVisibleOnStartup;
            }
            if (typeof deserialised.welcomeVisibleOnStartup === 'boolean') {
                result.welcomeVisibleOnStartup = deserialised.welcomeVisibleOnStartup;
            }
            if (typeof deserialised.theme === 'string') {
                result.theme = deserialised.theme;
            }
            if (typeof deserialised.backgroundTheme === 'string') {
                result.backgroundTheme = deserialised.backgroundTheme;
            } else if (deserialised.backgroundTheme === null) {
                result.backgroundTheme = null;
            }
            if (deserialised.projectDropDownSort && deserialised.projectDropDownSort.field && deserialised.projectDropDownSort.direction) {
                result.projectDropDownSort = deserialised.projectDropDownSort;
            }
            if (deserialised.welcomeScreenProjectSort && deserialised.welcomeScreenProjectSort.field && deserialised.welcomeScreenProjectSort.direction) {
                result.welcomeScreenProjectSort = deserialised.welcomeScreenProjectSort;
            }
            if (deserialised.projectStates) {
                result.projectStates = deserialised.projectStates;
            } else {
                result.projectStates = {};
            }
        }
        return result;
    }


}

/**
 * @typedef PersistentUISerialisable
 * @type {object}
 * @property {string} lastProjectId
 * @property {string} importPaletteAssemblyCode
 * @property {string} importPaletteSystem
 * @property {string} importTileAssemblyCode
 * @property {number} paletteIndex
 * @property {number} scale
 * @property {boolean} displayNativeColour
 * @property {boolean} showTileGrid
 * @property {boolean} showPixelGrid
 * @property {boolean} documentationVisibleOnStartup
 * @property {boolean} welcomeVisibleOnStartup
 * @property {string} theme
 * @property {string?} backgroundTheme
 * @property {import('./../types.js').SortEntry} projectDropDownSort
 * @property {import('./../types.js').SortEntry} welcomeScreenProjectSort
 * @property {Object.<string, object>} projectStates
*/
