import EventDispatcher from "../../components/eventDispatcher.js";
import Palette from "../../models/palette.js";
import ColourUtil from "../../util/colourUtil.js";
import ModalDialogue from "./../modalDialogue.js";
import TemplateUtil from "../../util/templateUtil.js";
import ColourPaletteListing from "../components/colourPaletteListing.js";

const EVENT_OnChange = 'EVENT_OnChange';

export default class ColourPickerDialogue extends ModalDialogue {


    /** @type {HTMLElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {number} */
    #paletteIndex = -1;
    /** @type {string} */
    #system = 'ms';
    #currentTab = 'rgb';
    #visibleTabs = ['rgb'];
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
    /** @type {ColourPaletteListing} */
    #smsColourPaletteList = null;
    /** @type {ColourPaletteListing} */
    #gbColourPaletteList = null;
    /** @type {ColourPaletteListing} */
    #nesColourPaletteList = null;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);

        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#tbColourPickerRedSlider = this.#element.querySelector('[data-smsgfx-id=tbColourPickerRedSlider]');
        this.#tbColourPickerGreenSlider = this.#element.querySelector('[data-smsgfx-id=tbColourPickerGreenSlider]');
        this.#tbColourPickerBlueSlider = this.#element.querySelector('[data-smsgfx-id=tbColourPickerBlueSlider]');
        this.#tbColourPickerRed = this.#element.querySelector('[data-smsgfx-id=tbColourPickerRed]');
        this.#tbColourPickerGreen = this.#element.querySelector('[data-smsgfx-id=tbColourPickerGreen]');
        this.#tbColourPickerBlue = this.#element.querySelector('[data-smsgfx-id=tbColourPickerBlue]');
        this.#tbColourPickerHex = this.#element.querySelector('[data-smsgfx-id=tbColourPickerHex]');
        this.#btnColourPickerPick = this.#element.querySelector('[data-smsgfx-id=btnColourPickerPick]');

        this.#tbColourPickerRedSlider.onchange = () => this.#setFromColour('r', this.#tbColourPickerRedSlider.value);
        this.#tbColourPickerGreenSlider.onchange = () => this.#setFromColour('g', this.#tbColourPickerGreenSlider.value);
        this.#tbColourPickerBlueSlider.onchange = () => this.#setFromColour('b', this.#tbColourPickerBlueSlider.value);

        this.#tbColourPickerRed.onchange = () => this.#setFromColour('r', this.#tbColourPickerRed.value);
        this.#tbColourPickerGreen.onchange = () => this.#setFromColour('g', this.#tbColourPickerGreen.value);
        this.#tbColourPickerBlue.onchange = () => this.#setFromColour('b', this.#tbColourPickerBlue.value);

        this.#tbColourPickerHex.onchange = () => this.#setFromHex(this.#tbColourPickerHex.value);
        this.#btnColourPickerPick.onchange = () => this.#setFromHex(this.#btnColourPickerPick.value);

        this.#tbPreviewSelected = this.#element.querySelector('[data-colour-preview=selected]');
        this.#tbPreviewSelected.onclick = (ev) => {
            if (ev.button === 0) {
                this.#btnColourPickerPick.click();
            }
        };
        this.#tbPreviewNative = this.#element.querySelector('[data-colour-preview=native]');
        this.#tbPreviewNative.onclick = (ev) => {
            if (ev.button === 0) {
                this.#btnColourPickerPick.click();
            }
        };

        this.#loadPaletteListIfNotLoaded(this.#smsColourPaletteList, 'colour-palette-list-sms').then((control) => {
            if (control) {
                this.#smsColourPaletteList = control;
                this.#smsColourPaletteList.setState({
                    colours: ColourUtil.getFullMasterSystemPalette(),
                    direction: 'row',
                    coloursPerRow: 8
                });
            }
        });

        this.#loadPaletteListIfNotLoaded(this.#gbColourPaletteList, 'colour-palette-list-gb').then((control) => {
            if (control) {
                this.#gbColourPaletteList = control;
                this.#gbColourPaletteList.setState({
                    colours: ColourUtil.getFullGameBoyPalette(),
                    direction: 'row',
                    coloursPerRow: 4
                });
            }
        });

        this.#loadPaletteListIfNotLoaded(this.#nesColourPaletteList, 'colour-palette-list-nes').then((control) => {
            if (control) {
                this.#nesColourPaletteList = control;
                this.#nesColourPaletteList.setState({
                    colours: ColourUtil.getFullNESPalette(),
                    direction: 'row',
                    coloursPerRow: 14
                });
            }
        });

        /** @type NodeListOf<HTMLAnchorElement> */
        const tabLinks = this.#element.querySelectorAll('[data-colour-picker-tabs] [data-colour-tab] a');
        tabLinks.forEach(tabLink => {
            tabLink.onclick = () => {
                const tab = tabLink.parentElement.getAttribute('data-colour-tab');
                this.#selectTab(tab);
            }
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<ColourPickerDialogue>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/colourPickerDialogue', element);
        return new ColourPickerDialogue(componentElement);
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
        this.#showHideTabs(palette);
        super.show();
    }

    /**
     * @param {ColourPaletteListing} colourPaletteListControl 
     * @param {string} componentId 
     */
    async #loadPaletteListIfNotLoaded(colourPaletteListControl, componentId) {
        let result = null;
        if (!colourPaletteListControl) {
            const containerElement = this.#element.querySelector(`[data-smsgfx-component-id=${componentId}]`);
            if (containerElement) {
                result = await ColourPaletteListing.loadIntoAsync(containerElement);
                result.addHandlerOnCommand((args) => {
                    switch (args.command) {
                        case ColourPaletteListing.Commands.colourSelect:
                            const hex = ColourUtil.toHex(args.r, args.g, args.b);
                            this.#setFromHex(hex);
                            break;
                    }
                });
            }
        }
        return result;
    }

    /**
     * @param {Palette} palette 
     */
    #showHideTabs(palette) {
        this.#element.querySelectorAll(`[data-colour-tab]`).forEach((p) => p.classList.add('visually-hidden'));
        this.#element.querySelectorAll(`[data-colour-tab-page]`).forEach((p) => p.classList.add('visually-hidden'));
        switch (palette.system) {
            case 'gg':
            case 'ms':
                this.#element.querySelector(`[data-colour-tab='rgb']`).classList.remove('visually-hidden');
                this.#element.querySelector(`[data-colour-tab='sms']`).classList.remove('visually-hidden');
                this.#element.querySelector(`[data-colour-tab-page='rgb']`).classList.remove('visually-hidden');
                this.#element.querySelector(`[data-colour-tab-page='sms']`).classList.remove('visually-hidden');
                this.#selectTab('rgb');
                break;
            case 'gb':
                this.#element.querySelector(`[data-colour-tab='gb']`).classList.remove('visually-hidden');
                this.#element.querySelector(`[data-colour-tab-page='gb']`).classList.remove('visually-hidden');
                this.#selectTab('gb');
                break;
            case 'nes':
                this.#element.querySelector(`[data-colour-tab='nes']`).classList.remove('visually-hidden');
                this.#element.querySelector(`[data-colour-tab-page='nes']`).classList.remove('visually-hidden');
                this.#selectTab('nes');
                break;
        }
    }

    /**
     * @param {string} tabName
     */
    #selectTab(tabName) {
        this.#element.querySelectorAll(`[data-colour-tab] a`).forEach((t) => t.classList.remove('active'));
        this.#element.querySelector(`[data-colour-tab=${tabName}] a`).classList.add('active');
        this.#element.querySelectorAll(`[data-colour-tab-page]`).forEach((element) => {
            if (element.getAttribute('data-colour-tab-page') === tabName) {
                element.classList.remove('visually-hidden');
            } else {
                element.classList.add('visually-hidden');
            }
        });
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
        this.#tbColourPickerHex.value = hex;
        this.#btnColourPickerPick.value = hex;
        // Previews
        const closestColour = ColourUtil.getClosestNativeColour(this.#system, this.#r, this.#g, this.#b);
        const previewHex = ColourUtil.toHex(closestColour.r, closestColour.g, closestColour.b);
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