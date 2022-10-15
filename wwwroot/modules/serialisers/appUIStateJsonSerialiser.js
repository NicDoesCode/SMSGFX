import AppUIStateFactory from "../factory/appUIStateFactory.js";
import AppUIState from "../models/appUIState.js";

export default class appUIStateJsonSerialiser {


    /**
     * Serialises the class.
     * @param {AppUIState} appUI - The app UI object to serialise.
     * @returns {string}
     */
     static serialise(appUI) {
        /** @type {AppUISerialisable} */
        const result = {
            lastPaletteInput: appUI.lastPaletteInput,
            lastPaletteInputSystem: appUI.lastPaletteInputSystem,
            lastTileInput: appUI.lastTileInput,
            lastSelectedPaletteIndex: appUI.lastSelectedPaletteIndex,
            lastZoomValue: appUI.lastZoomValue
        };
        return JSON.stringify(result);
    }

    /**
     * Deserialises a JSON string into an AppUI object.
     * @param {string} value JSON string.
     * @returns {DataStoreUIData}
     */
    static deserialise(value) {
        /** @type {AppUISerialisable} */
        const result = AppUIStateFactory.create();
        const deserialised = JSON.parse(value);
        if (deserialised) {
            if (deserialised.lastPaletteInput) {
                result.lastPaletteInput = deserialised.lastPaletteInput;
            }
            if (deserialised.lastPaletteInputSystem) {
                result.lastPaletteInputSystem = deserialised.lastPaletteInputSystem;
            }
            if (deserialised.lastTileInput) {
                result.lastTileInput = deserialised.lastTileInput;
            }
            if (deserialised.lastSelectedPaletteIndex) {
                result.lastSelectedPaletteIndex = deserialised.lastSelectedPaletteIndex;
            }
            if (deserialised.lastZoomValue) {
                result.lastZoomValue = deserialised.lastZoomValue;
            }
        }
        return result;
    }


}

/**
 * @typedef AppUISerialisable
 * @type {object}
 * @property {string} lastPaletteInput
 * @property {string} lastPaletteInputSystem
 * @property {string} lastTileInput
 * @property {number} lastSelectedPaletteIndex
 * @property {number} lastZoomValue
 */
