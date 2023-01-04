import EventDispatcher from "../components/eventDispatcher.js";
import ColourUtil from "../util/colourUtil.js";
import TemplateUtil from "../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    colourChanged: 'colourChanged',
    tabChanged: 'tabChanged'
}

export default class ColourPickerToolbox {


    static get Commands() {
        return commands;
    }


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
    #enabled = true;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
     constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#currentTab = 'rgb';

        this.#tbColourToolboxRedSlider = this.#element.querySelector('[data-smsgfx-id=redSlider]');
        this.#tbColourToolboxGreenSlider = this.#element.querySelector('[data-smsgfx-id=greenSlider]');
        this.#tbColourToolboxBlueSlider = this.#element.querySelector('[data-smsgfx-id=blueSlider]');
        this.#tbColourToolboxRed = this.#element.querySelector('[data-smsgfx-id=inputRedValue]');
        this.#tbColourToolboxGreen = this.#element.querySelector('[data-smsgfx-id=inputGreenValue]');
        this.#tbColourToolboxBlue = this.#element.querySelector('[data-smsgfx-id=inputBlueValue]');
        this.#btnColourToolboxPick = this.#element.querySelector('[data-smsgfx-id=colourPicker]');
        this.#tbColourToolboxHex = this.#element.querySelector('[data-smsgfx-id=inputHex]');

        this.#tbColourToolboxRedSlider.onchange = () => this.#setFromColour('r', this.#tbColourToolboxRedSlider.value);
        this.#tbColourToolboxGreenSlider.onchange = () => this.#setFromColour('g', this.#tbColourToolboxGreenSlider.value);
        this.#tbColourToolboxBlueSlider.onchange = () => this.#setFromColour('b', this.#tbColourToolboxBlueSlider.value);

        this.#tbColourToolboxRed.onchange = () => this.#setFromColour('r', this.#tbColourToolboxRedSlider.value);
        this.#tbColourToolboxGreen.onchange = () => this.#setFromColour('g', this.#tbColourToolboxGreenSlider.value);
        this.#tbColourToolboxBlue.onchange = () => this.#setFromColour('b', this.#tbColourToolboxBlueSlider.value);

        this.#btnColourToolboxPick.onchange = () => this.#setFromHex(this.#btnColourToolboxPick.value);
        this.#tbColourToolboxHex.onchange = () => this.#setFromHex(this.#tbColourToolboxHex.value);

        /** @type NodeListOf<HTMLAnchorElement> */
        const tabLinks = this.#element.querySelectorAll('[data-colour-toolbox-tabs] [data-colour-toolbox-tab] a');
        tabLinks.forEach(tabLink => {
            tabLink.onclick = () => {
                const tab = tabLink.parentElement.getAttribute('data-colour-toolbox-tab');
                const args = this.#createEventArgs(commands.tabChanged);
                args.tab = tab;
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            }
        });

        this.#makeSMSColourButtons();
        this.#showCurrentTab();
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<ColourPickerToolbox>}
     */
     static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('colourPickerToolbox', element);
        return new ColourPickerToolbox(componentElement);
    }


    /**
     * Sets the state of the colour picker toolbox.
     * @param {ColourPickerToolboxState} state - State to set.
     */
    setState(state) {
        if (typeof state?.showTab === 'string') {
            this.#currentTab = (state.showTab === 'sms') ? 'sms' : 'rgb';
            this.#showCurrentTab();
        }
        if (typeof state?.r === 'number') {
            if (state.r < 0 || state.r > 255) throw new Error('Red colour value must be between 0 and 255.');
            this.#r = state.r;
        }
        if (typeof state?.g === 'number') {
            if (state.g < 0 || state.g > 255) throw new Error('Green colour value must be between 0 and 255.');
            this.#g = state.g;
        }
        if (typeof state?.b === 'number') {
            if (state.b < 0 || state.b > 255) throw new Error('Blue colour value must be between 0 and 255.');
            this.#b = state.b;
        }
        this.#setAllValues();

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state.enabled;
            this.#element.querySelectorAll('input').forEach(element => {
                element.disabled = !this.#enabled;
            });
            const box = this.#element.querySelector('[data-smsgfx-id=smsColourPalette]');
            box.querySelectorAll('button[data-colour-hex]').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }
    }


    /**
     * Registers a handler for a command.
     * @param {PaletteEditorCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    #handleColourChanged() {
        const args = this.#createEventArgs(commands.colourChanged);
        args.r = this.#r;
        args.g = this.#g;
        args.b = this.#b;
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
    }


    /** @returns {ColourPickerToolboxCommandEventArgs} */
    #createEventArgs(command) {
        return {
            command: command,
            r: 0, g: 0, b: 0,
            tab: null
        };
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
        const smsColourContainer = this.#element.querySelector('[data-smsgfx-id=smsColourContainer]');
        const box = smsColourContainer.querySelector('[data-smsgfx-id=smsColourPalette]');
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
        this.#tbColourToolboxHex.value = hex;
        this.#btnColourToolboxPick.value = hex;
        this.#tbColourToolboxHex.classList.remove('is-invalid');
    }


}


/**
 * @typedef {object} ColourPickerToolboxState
 * @property {boolean?} enabled - Is the toolbox enabled?
 * @property {string?} showTab - Either 'rgb' or 'sms', which content tab to show.
 * @property {number?} r - Red component.
 * @property {number?} g - Green component.
 * @property {number?} b - Blue component.
 * @exports 
 */

/**
 * Colour picker toolbox on command callback.
 * @callback ColourPickerToolboxCommandCallback
 * @param {ColourPickerToolboxCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * Colour picker toolbox on command event args.
 * @typedef {object} ColourPickerToolboxCommandEventArgs
 * @property {string} command - Command being issued.
 * @property {string} tab - Tab to display.
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @exports
 */
