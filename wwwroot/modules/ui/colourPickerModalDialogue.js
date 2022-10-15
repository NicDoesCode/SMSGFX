import Palette from "../models/palette.js";
import ColourUtil from "../util/colourUtil.js";
import ModalDialogue from "./modalDialogue.js";

const hexRegex = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

export default class ColourPickerModalDialogue extends ModalDialogue {


    get palette() {
        return this.#palette;
    }

    get paletteIndex() {
        return this.#paletteIndex;
    }

    get inputSystem() {
        return this.#palette.system;
    }

    get redValue() {
        return this.#r;
    }
    set redValue(value) {
        if (typeof value !== 'number' || value < 0 && value > 255) throw new Error('Value must be a number between 0 and 255.');
        this.#r = value;
    }

    get greenValue() {
        return this.#g;
    }
    set greenValue(value) {
        if (typeof value !== 'number' || value < 0 && value > 255) throw new Error('Value must be a number between 0 and 255.');
        this.#g = value;
    }

    get blueValue() {
        return this.#b;
    }
    set blueValue(value) {
        if (typeof value !== 'number' || value < 0 && value > 255) throw new Error('Value must be a number between 0 and 255.');
        this.#b = value;
    }

    get hexValue() {
        const hexR = this.#r.toString(16).padStart(2, '0');
        const hexG = this.#g.toString(16).padStart(2, '0');
        const hexB = this.#b.toString(16).padStart(2, '0');
        return `#${hexR}${hexG}${hexB}`;
    }

    get nativeValue() {
        if (this.inputSystem === 'ms') {
            const r = Math.round(3 / 255 * this.redValue);
            const g = Math.round(3 / 255 * this.greenValue) << 2;
            const b = Math.round(3 / 255 * this.blueValue) << 4;
            return (r | g | b).toString(16).padStart(8, '0');
        } else if (this.inputSystem === 'gg') {
            const r = Math.round(15 / 255 * this.redValue);
            const g = Math.round(15 / 255 * this.greenValue) << 4;
            const b = Math.round(15 / 255 * this.blueValue) << 8;
            return (r | g | b).toString(16).padStart(16, '0');
        }
    }


    /** @type {number} */
    #paletteIndex = -1;
    /** @type {Palette} */
    #palette = null;
    /** @type {number} */
    #r = 0;
    /** @type {number} */
    #g = 0;
    /** @type {number} */
    #b = 0;
    /** @type {HTMLInputElement} */
    #tbColourPickerRedSlider;
    /** @type {HTMLInputElement} */
    #tbColourPickerGreenSlider;
    /** @type {HTMLInputElement} */
    #tbColourPickerBlueSlider;
    /** @type {HTMLInputElement} */
    #tbColourPickerRed;
    /** @type {HTMLInputElement} */
    #tbColourPickerGreen;
    /** @type {HTMLInputElement} */
    #tbColourPickerBlue;
    /** @type {HTMLInputElement} */
    #btnColourPickerPick;
    /** @type {HTMLInputElement} */
    #tbColourPickerHex;


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);

        this.#tbColourPickerRedSlider = element.querySelector('#tbColourPickerRedSlider');
        this.#tbColourPickerGreenSlider = element.querySelector('#tbColourPickerGreenSlider');
        this.#tbColourPickerBlueSlider = element.querySelector('#tbColourPickerBlueSlider');
        this.#tbColourPickerRed = element.querySelector('#tbColourPickerRed');
        this.#tbColourPickerGreen = element.querySelector('#tbColourPickerGreen');
        this.#tbColourPickerBlue = element.querySelector('#tbColourPickerBlue');
        this.#btnColourPickerPick = element.querySelector('#btnColourPickerPick');
        this.#tbColourPickerHex = element.querySelector('#tbColourPickerHex');

        this.#tbColourPickerRedSlider.onchange = () => this.#setFromColour('r', tbColourPickerRedSlider.value);
        this.#tbColourPickerGreenSlider.onchange = () => this.#setFromColour('g', tbColourPickerGreenSlider.value);
        this.#tbColourPickerBlueSlider.onchange = () => this.#setFromColour('b', tbColourPickerBlueSlider.value);

        this.#tbColourPickerRed.onchange = () => this.#setFromColour('r', tbColourPickerRedSlider.value);
        this.#tbColourPickerGreen.onchange = () => this.#setFromColour('g', tbColourPickerGreenSlider.value);
        this.#tbColourPickerBlue.onchange = () => this.#setFromColour('b', tbColourPickerBlueSlider.value);

        this.#btnColourPickerPick.onchange = () => this.#setFromHex(btnColourPickerPick.value);
        this.#tbColourPickerHex.onchange = () => this.#setFromHex(tbColourPickerHex.value);
    }


    /**
     * Shows the colour selector modal.
     * @param {Palette} palette Palette that contains the colour index.
     * @param {number} index Colour index, 0 to 15.
     */
    show(palette, index) {
        this.#palette = palette;
        this.#paletteIndex = index;
        this.#setTo(palette, index);
        super.show();
    }

    /**
     * Sets the values.
     * @param {Palette} palette The palette.
     * @param {number} index Colour index.
     */
    #setTo(palette, index) {
        const colour = palette.getColour(index);
        this.#r = colour.r;
        this.#g = colour.g;
        this.#b = colour.b;
        this.#setAllValues();
    }

    /**
     * Updates the colour slider values.
     * @param {string} colour r, g or b.
     * @param {string} value Value 0 to 255.
     */
    #setFromColour(colour, value) {
        if (!colour || !['r', 'g', 'b'].includes(colour)) throw new Error('Colour value must be "r", "g", or "b".');
        if (!/\d+$/i.test(value.trim())) throw new Error('Value must be a number between 0 and 255.');
        const numValue = parseInt(value.trim());
        if (numValue < 0 || numValue > 255) throw new Error('Value must be a number between 0 and 255.');
        if (colour === 'r') this.#r = numValue;
        if (colour === 'g') this.#g = numValue;
        if (colour === 'b') this.#b = numValue;
        this.#setAllValues();
    }

    /**
     * Updates values based on picker value.
     * @param {string} hex Hexadecimal value.
     */
    #setFromHex(hex) {
        const rgb = ColourUtil.rgbFromHex(hex);
        this.#r = rgb.r;
        this.#g = rgb.g;
        this.#b = rgb.b;
        this.#setAllValues();
    }

    #setAllValues() {
        this.#tbColourPickerRedSlider.value = this.#r;
        this.#tbColourPickerGreenSlider.value = this.#g;
        this.#tbColourPickerBlueSlider.value = this.#b;
        this.#tbColourPickerRed.value = this.#r;
        this.#tbColourPickerGreen.value = this.#g;
        this.#tbColourPickerBlue.value = this.#b;
        const hex = ColourUtil.toHex(this.#r, this.#g, this.#b);
        tbColourPickerHex.value = hex;
        btnColourPickerPick.value = hex;
    }

    /**
     * Returns the values from this object as a palette colour.
     * @returns {import("../palette").PaletteColour}
     */
    toPaletteColour() {
        return {
            r: this.redValue,
            g: this.greenValue,
            b: this.blueValue
        };
    }


}