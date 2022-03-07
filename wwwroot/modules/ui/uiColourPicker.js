import Palette from "../palette.js";

/** @type {HTMLInputElement} */
const tbColourPickerRedSlider = document.getElementById('tbColourPickerRedSlider');
/** @type {HTMLInputElement} */
const tbColourPickerGreenSlider = document.getElementById('tbColourPickerGreenSlider');
/** @type {HTMLInputElement} */
const tbColourPickerBlueSlider = document.getElementById('tbColourPickerBlueSlider');
/** @type {HTMLInputElement} */
const tbColourPickerRed = document.getElementById('tbColourPickerRed');
/** @type {HTMLInputElement} */
const tbColourPickerGreen = document.getElementById('tbColourPickerGreen');
/** @type {HTMLInputElement} */
const tbColourPickerBlue = document.getElementById('tbColourPickerBlue');
/** @type {HTMLInputElement} */
const btnColourPickerPick = document.getElementById('btnColourPickerPick');
/** @type {HTMLInputElement} */
const tbColourPickerHex = document.getElementById('tbColourPickerHex');
/** @type {HTMLButtonElement} */
const btnColourPickerModalConfirm = document.getElementById('btnColourPickerModalConfirm');

const colourRegex = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

export default class UIColourPicker {

    #index;
    /** @type {ConfirmColourPickerCallback[]} */
    #onConfirmColourPickerCallbacks = [];

    constructor() {

        tbColourPickerRedSlider.onchange = () => this.#updateColourSliderValue('r', tbColourPickerRedSlider.value);
        tbColourPickerGreenSlider.onchange = () => this.#updateColourSliderValue('g', tbColourPickerGreenSlider.value);
        tbColourPickerBlueSlider.onchange = () => this.#updateColourSliderValue('b', tbColourPickerBlueSlider.value);

        tbColourPickerRed.onchange = () => this.#updateColourTextboxValue('r', tbColourPickerRedSlider.value);
        tbColourPickerGreen.onchange = () => this.#updateColourTextboxValue('g', tbColourPickerGreenSlider.value);
        tbColourPickerBlue.onchange = () => this.#updateColourTextboxValue('b', tbColourPickerBlueSlider.value);

        btnColourPickerPick.onchange = () => this.#updateFromPicker(btnColourPickerPick.value);
        tbColourPickerHex.onchange = () => this.#updateFromHex(tbColourPickerHex.value);

        btnColourPickerModalConfirm.onclick = () => this.confirm();

    }

    /**
     * When the user confirms the colour picker.
     * @param {ConfirmColourPickerCallback} callback Callback function.
     */
    onConfirm(callback) {
        this.#onConfirmColourPickerCallbacks.push(callback);
    }

    confirm() {
        this.#onConfirmColourPickerCallbacks.forEach(callback => {
            const hex = btnColourPickerPick.value;
            const match = colourRegex.exec(hex);
            const r = parseInt(match[1], 16);
            const g = parseInt(match[2], 16);
            const b = parseInt(match[3], 16);
            callback({ index: this.#index, r, g, b, hex });
        });
    }

    /**
     * Sets the values.
     * @param {Palette} palette The palette.
     * @param {number} index Colour index.
     */
    setTo(palette, index) {
        this.#index = index;
        const colour = palette.colours[index];
        tbColourPickerRedSlider.value = colour.r;
        tbColourPickerRed.value = colour.r;
        tbColourPickerGreenSlider.value = colour.g;
        tbColourPickerGreen.value = colour.g;
        tbColourPickerBlueSlider.value = colour.b;
        tbColourPickerBlue.value = colour.b;
        btnColourPickerPick.value = colour.hex;
        tbColourPickerHex.value = colour.hex;
    }

    /**
     * Updates the colour slider values.
     * @param {string} colour r, g or b.
     * @param {number} value Value 0 to 255.
     */
    #updateColourSliderValue(colour, value) {
        if (colour === 'r') tbColourPickerRed.value = value;
        if (colour === 'g') tbColourPickerGreen.value = value;
        if (colour === 'b') tbColourPickerBlue.value = value;
        const hex = `#${parseInt(tbColourPickerRed.value).toString(16)}${parseInt(tbColourPickerGreen.value).toString(16)}${parseInt(tbColourPickerBlue.value).toString(16)}`;
        tbColourPickerHex.value = hex;
        btnColourPickerPick.value = hex;
    }

    /**
     * Updates the colour textbox values.
     * @param {string} colour r, g or b.
     * @param {number} value Value 0 to 255.
     */
    #updateColourTextboxValue(colour, value) {
        if (colour === 'r') tbColourPickerRedSlider.value = value;
        if (colour === 'g') tbColourPickerGreenSlider.value = value;
        if (colour === 'b') tbColourPickerBlueSlider.value = value;
        const hex = `#${parseInt(tbColourPickerRed.value).toString(16)}${parseInt(tbColourPickerGreen.value).toString(16)}${parseInt(tbColourPickerBlue.value).toString(16)}`;
        tbColourPickerHex.value = hex;
        btnColourPickerPick.value = hex;
    }

    /**
     * Updates values based on picker value.
     * @param {string} hex Hexadecimal value.
     */
    #updateFromPicker(hex) {
        if (hex && colourRegex.test(hex)) {
            const match = colourRegex.exec(hex);
            const r = parseInt(match[1], 16);
            const g = parseInt(match[2], 16);
            const b = parseInt(match[3], 16);
            tbColourPickerHex.value = hex;
            tbColourPickerRedSlider.value = r;
            tbColourPickerGreenSlider.value = g;
            tbColourPickerBlueSlider.value = b;
            tbColourPickerRed.value = r;
            tbColourPickerGreen.value = g;
            tbColourPickerBlue.value = b;
        } else throw new Error(`Invalid hex value "${hex}".`);
    }

    /**
     * Updates values based on a HEX string.
     * @param {string} hex Hexadecimal value.
     */
    #updateFromHex(hex) {
        if (hex && colourRegex.test(hex)) {
            const match = colourRegex.exec(hex);
            const r = parseInt(match[1], 16);
            const g = parseInt(match[2], 16);
            const b = parseInt(match[3], 16);
            btnColourPickerPick.value = hex;
            tbColourPickerRedSlider.value = r;
            tbColourPickerGreenSlider.value = g;
            tbColourPickerBlueSlider.value = b;
            tbColourPickerRed.value = r;
            tbColourPickerGreen.value = g;
            tbColourPickerBlue.value = b;
        }
    }

}

/**
 * Callback for when selected tool is changed.
 * @callback ConfirmColourPickerCallback
 * @param {ConfirmColourPickerEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef ConfirmColourPickerEventData
 * @type {object}
 * @property {number} index - Colour palette index.
 * @property {string} hex - Hexadecimal value.
 * @property {number} r - Red value.
 * @property {number} g - Green value.
 * @property {number} b - Blue value.
 * @exports 
 */

