import EventDispatcher from "../components/eventDispatcher.js";
import Palette from "../models/palette.js";
import ColourUtil from "../util/colourUtil.js";
import ModalDialogue from "./modalDialogue.js";

const EVENT_OnChange = 'EVENT_OnChange';

export default class ColourPickerDialogue extends ModalDialogue {


    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {number} */
    #paletteIndex = -1;
    /** @type {string} */
    #system = 'ms';
    /** @type {number} */
    #r = 0; #originalR = 0;
    /** @type {number} */
    #g = 0; #originalG = 0;
    /** @type {number} */
    #b = 0; #originalB = 0;
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
    /** @type {HTMLDivElement} */
    #tbPreviewSelected;
    /** @type {HTMLDivElement} */
    #tbPreviewNative;


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);
        this.#dispatcher = new EventDispatcher();

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

        this.#tbPreviewSelected = element.querySelector('[data-colour-preview=selected]');
        this.#tbPreviewNative = element.querySelector('[data-colour-preview=native]');
    }


    /**
     * Shows the colour selector modal.
     * @param {Palette} palette Palette that contains the colour index.
     * @param {number} index Colour index, 0 to 15.
     */
    show(palette, index) {
        this.#paletteIndex = index;
        this.#system = palette.system;
        const colour = palette.getColour(index);
        this.#r = colour.r;
        this.#g = colour.g;
        this.#b = colour.b;
        this.#originalR = colour.r;
        this.#originalG = colour.g;
        this.#originalB = colour.b;
        this.#setAllValues();
        super.show();
    }


    /**
     * When the colour picker box has been confirmed.
     * @param {ColourPickerDialogueColourCallback} callback - Callback function.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            const args = this.#createEventArgs();
            callback(args);
        });
    }

    /**
     * When the colour picker box has a value changed.
     * @param {ColourPickerDialogueColourCallback} callback - Callback function.
     */
    addHandlerOnChange(callback) {
        this.#dispatcher.on(EVENT_OnChange, callback)
    }

    /**
     * When the colour picker box is cancelled.
     * @param {ColourPickerDialogueColourCallback} callback - Callback function.
     */
    addHandlerOnCancel(callback) {
        super.addHandlerOnCancel(() => {
            const args = this.#createEventArgs();
            callback(args);
        });
    }


    #triggerOnChange() {
        const args = this.#createEventArgs();
        this.#dispatcher.dispatch(EVENT_OnChange, args);
    }

    /**
     * @returns {ColourPickerDialogueColourEventArgs}
     */
    #createEventArgs() {
        return {
            index: this.#paletteIndex,
            system: this.#system,
            r: this.#r,
            g: this.#g,
            b: this.#b,
            originalR: this.#originalR,
            originalG: this.#originalG,
            originalB: this.#originalB
        };
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
        this.#triggerOnChange();
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
        this.#triggerOnChange();
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
        // Previews
        const previewHex = ColourUtil.toNativeHex(this.#system, this.#r, this.#g, this.#b);
        this.#tbPreviewSelected.style.backgroundColor = hex;
        this.#tbPreviewNative.style.backgroundColor = previewHex;
    }


}

/**
 * Event callback.
 * @callback PalettColourPickerDialogueCallback
 * @param {object} args - Arguments.
 * @exports
 */

/**
 * Colour picker modal dialogue callback.
 * @callback ColourPickerDialogueColourCallback
 * @argument {ColourPickerDialogueColourEventArgs} args - Event args.
 * @export
 */
/**
 * Event args from the colour picker modal.
 * @typedef {object} ColourPickerDialogueColourEventArgs
 * @property {number} index - Palette index, 0 to 15.
 * @property {string} system - Target system, either 'ms' or 'gg'.
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @property {number} originalR - Original red component.
 * @property {number} originalG - Original green component.
 * @property {number} originalB - Original blue component.
 * @export
 */