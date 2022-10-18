import EventDispatcher from "../components/eventDispatcher.js";
import ColourUtil from "../util/colourUtil.js";

const EVENT_RequestColourChange = 'EVENT_RequestColourChange';
const EVENT_RequestTabChange = 'EVENT_RequestTabChange';

export default class ColourPickerToolbox {


    #element;
    /** @type {number} */
    #r = 0;
    /** @type {number} */
    #g = 0;
    /** @type {number} */
    #b = 0;
    /** @type {HTMLInputElement} */
    #tbColourToolboxRedSlider;
    /** @type {HTMLInputElement} */
    #tbColourToolboxGreenSlider;
    /** @type {HTMLInputElement} */
    #tbColourToolboxBlueSlider;
    /** @type {HTMLInputElement} */
    #tbColourToolboxRed;
    /** @type {HTMLInputElement} */
    #tbColourToolboxGreen;
    /** @type {HTMLInputElement} */
    #tbColourToolboxBlue;
    /** @type {HTMLInputElement} */
    #btnColourToolboxPick;
    /** @type {HTMLInputElement} */
    #tbColourToolboxHex;
    /** @type {HTMLElement} */
    #currentTab;
    #dispatcher;


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLElement} element The DIV that contains the modal.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#currentTab = 'rgb';

        this.#tbColourToolboxRedSlider = element.querySelector('#tbColourToolboxRedSlider');
        this.#tbColourToolboxGreenSlider = element.querySelector('#tbColourToolboxGreenSlider');
        this.#tbColourToolboxBlueSlider = element.querySelector('#tbColourToolboxBlueSlider');
        this.#tbColourToolboxRed = element.querySelector('#tbColourToolboxRed');
        this.#tbColourToolboxGreen = element.querySelector('#tbColourToolboxGreen');
        this.#tbColourToolboxBlue = element.querySelector('#tbColourToolboxBlue');
        this.#btnColourToolboxPick = element.querySelector('#btnColourToolboxPick');
        this.#tbColourToolboxHex = element.querySelector('#tbColourToolboxHex');

        this.#tbColourToolboxRedSlider.onchange = () => this.#setFromColour('r', tbColourToolboxRedSlider.value);
        this.#tbColourToolboxGreenSlider.onchange = () => this.#setFromColour('g', tbColourToolboxGreenSlider.value);
        this.#tbColourToolboxBlueSlider.onchange = () => this.#setFromColour('b', tbColourToolboxBlueSlider.value);

        this.#tbColourToolboxRed.onchange = () => this.#setFromColour('r', tbColourToolboxRedSlider.value);
        this.#tbColourToolboxGreen.onchange = () => this.#setFromColour('g', tbColourToolboxGreenSlider.value);
        this.#tbColourToolboxBlue.onchange = () => this.#setFromColour('b', tbColourToolboxBlueSlider.value);

        this.#btnColourToolboxPick.onchange = () => this.#setFromHex(btnColourToolboxPick.value);
        this.#tbColourToolboxHex.onchange = () => this.#setFromHex(tbColourToolboxHex.value);

        /** @type NodeListOf<HTMLAnchorElement> */
        const tabLinks = this.#element.querySelectorAll('[data-colour-toolbox-tabs] [data-colour-toolbox-tab] a');
        tabLinks.forEach(tabLink => {
            tabLink.onclick = () => {
                const tab = tabLink.parentElement.getAttribute('data-colour-toolbox-tab');
                this.#handleTabChanged(tab);
            }
        });

        this.#makeSMSColourButtons();
    }


    /**
     * Sets the state of the colour picker toolbox.
     * @param {ColourPickerToolboxState} state - State to set.
     */
    setState(state) {
        if (state) {
            if (typeof state.showTab === 'string') {
                this.#currentTab = (state.showTab === 'sms') ? 'sms' : 'rgb';
                this.#showCurrentTab();
            }
            if (typeof state.r === 'number') {
                if (state.r < 0 || state.r > 255) throw new Error('Red colour value must be between 0 and 255.');
                this.#r = state.r;
            }
            if (typeof state.g === 'number') {
                if (state.g < 0 || state.g > 255) throw new Error('Green colour value must be between 0 and 255.');
                this.#g = state.g;
            }
            if (typeof state.b === 'number') {
                if (state.b < 0 || state.b > 255) throw new Error('Blue colour value must be between 0 and 255.');
                this.#b = state.b;
            }
        }
        this.#setAllValues();
    }


    /**
     * When the colour picker toolbox has a value changed.
     * @param {ColourPickerToolboxTabCallback} callback - Callback function.
     */
    addHandlerRequestTabChange(callback) {
        this.#dispatcher.on(EVENT_RequestTabChange, callback)
    }

    /**
     * When the colour picker toolbox has a value changed.
     * @param {ColourPickerToolboxColourCallback} callback - Callback function.
     */
    addHandlerRequestColourChange(callback) {
        this.#dispatcher.on(EVENT_RequestColourChange, callback)
    }


    /**
     * @param {string} tab - The tab that was selected.
     */
    #handleTabChanged(tab) {
        /** @type {ColourPickerToolboxTabEventArgs} */
        const args = { tab: tab };
        this.#dispatcher.dispatch(EVENT_RequestTabChange, args);
    }

    #handleColourChanged() {
        /** @type {ColourPickerToolboxColourEventArgs} */
        const args = { r: this.#r, g: this.#g, b: this.#b };
        this.#dispatcher.dispatch(EVENT_RequestColourChange, args);
    }


    #makeSMSColourButtons() {
        const colourValues = [0, 85, 170, 255];
        const colours = [];
        colourValues.forEach(b => {
            colourValues.forEach(g => {
                colourValues.forEach(r => {
                    colours.push({ r, g, b });
                });
            });
        });
        const smsColourContainer = this.#element.querySelector('#pnlColourToolboxSMS');
        const box = smsColourContainer.querySelector('#tbSMSColourBox');
        colours.forEach(colour => {
            const colourHex = ColourUtil.toHex(colour.r, colour.g, colour.b);
            const btn = document.createElement('button');
            btn.setAttribute('data-colour-hex', colourHex);
            btn.style.backgroundColor = colourHex;
            btn.onclick = () => {
                this.#r = colour.r;
                this.#g = colour.g;
                this.#b = colour.b;
                this.#tbColourToolboxHex.value = colourHex;
                this.#setAllValues();
                this.#handleColourChanged();
            };
            box.appendChild(btn);
        });
    }

    #showCurrentTab() {
        const allTabs = this.#element.querySelectorAll('[data-colour-toolbox-tabs] [data-colour-toolbox-tab] a');
        allTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        const tabToSelect = this.#element.querySelector(`[data-colour-toolbox-tabs] [data-colour-toolbox-tab=${this.#currentTab}] a`);
        if (tabToSelect) {
            tabToSelect.classList.add('active');
        }
        const allContent = this.#element.querySelectorAll('[data-colour-toolbox-tab-content]');
        allContent.forEach(content => {
            if (!content.classList.contains('visually-hidden')) {
                content.classList.add('visually-hidden');
            }
        });
        const allContentToSelect = this.#element.querySelectorAll(`[data-colour-toolbox-tab-content=${this.#currentTab}]`);
        allContentToSelect.forEach(contentToSelect => {
            while (contentToSelect.classList.contains('visually-hidden')) {
                contentToSelect.classList.remove('visually-hidden');
            }
        });
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
        this.#handleColourChanged();
    }

    /**
     * Updates values based on picker value.
     * @param {string} hex Hexadecimal value.
     */
    #setFromHex(hex) {
        try {
            const rgb = ColourUtil.rgbFromHex(hex);
            this.#r = rgb.r;
            this.#g = rgb.g;
            this.#b = rgb.b;
            this.#setAllValues();
            this.#handleColourChanged();
        } catch {
            if (!this.#tbColourToolboxHex.classList.contains('is-invalid')) {
                this.#tbColourToolboxHex.classList.add('is-invalid');
            }
        }
    }

    #setAllValues() {
        this.#tbColourToolboxRedSlider.value = this.#r;
        this.#tbColourToolboxGreenSlider.value = this.#g;
        this.#tbColourToolboxBlueSlider.value = this.#b;
        this.#tbColourToolboxRed.value = this.#r;
        this.#tbColourToolboxGreen.value = this.#g;
        this.#tbColourToolboxBlue.value = this.#b;
        const hex = ColourUtil.toHex(this.#r, this.#g, this.#b);
        tbColourToolboxHex.value = hex;
        btnColourToolboxPick.value = hex;
        this.#tbColourToolboxHex.classList.remove('is-invalid');
    }


}


/**
 * @typedef {object} ColourPickerToolboxState
 * @property {string?} showTab - Either 'rgb' or 'sms', which content tab to show.
 * @property {number?} r - Red component.
 * @property {number?} g - Green component.
 * @property {number?} b - Blue component.
 * @exports 
 */

/**
 * Tab changed callback.
 * @callback ColourPickerToolboxTabCallback
 * @param {ColourPickerToolboxTabEventArgs} args - Arguments.
 * @exports
 */
/**
 * Tab changed event args.
 * @typedef {object} ColourPickerToolboxTabEventArgs
 * @property {string} tab - Tab to display.
 * @export
 */
/**
 * Colour changed callback.
 * @callback ColourPickerToolboxColourCallback
 * @argument {ColourPickerToolboxColourEventArgs} args - Event args.
 * @export
 */
/**
 * Colour event args.
 * @typedef {object} ColourPickerToolboxColourEventArgs
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @export
 */