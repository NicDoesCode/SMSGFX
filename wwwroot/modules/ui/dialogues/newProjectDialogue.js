import ModalDialogue from "./../modalDialogue.js";
import TemplateUtil from "../../util/templateUtil.js";

const tilePresets = {
    'custom': 'Custom',
    '32x30': '32x30 tiles - NES (PAL)',
    '32x28': '32x28 tiles - NES (NTSC)',
    '32x24': '32x24 tiles - Master System',
    '20x18': '20x18 tiles - Game Gear & Game Boy'
};

export default class NewProjectDialogue extends ModalDialogue {


    static get TilePresets() {
        return tilePresets;
    }


    /** @type {HTMLSelectElement} */
    #tbSystemSelect;
    /** @type {HTMLInputElement} */
    #tbCreateTileMap;
    /** @type {HTMLSelectElement} */
    #tbTileMapPreset;
    /** @type {HTMLInputElement} */
    #tbTileWidth;
    /** @type {HTMLInputElement} */
    #tbTileHeight;
    /** @type {HTMLElement} */
    #element;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);

        this.#element = element;

        TemplateUtil.wireUpLabels(this.#element);

        this.#tbSystemSelect = this.#element.querySelector('[data-smsgfx-id=system-select]');
        this.#tbCreateTileMap = this.#element.querySelector('[data-smsgfx-id=create-tile-map]');
        this.#tbTileMapPreset = this.#element.querySelector('[data-smsgfx-id=tile-map-preset]');
        this.#tbTileWidth = this.#element.querySelector('[data-smsgfx-id=tile-width]');
        this.#tbTileHeight = this.#element.querySelector('[data-smsgfx-id=tile-height]');

        this.#tbCreateTileMap.checked = true;

        this.#tbTileMapPreset.querySelectorAll('option').forEach((o) => o.remove());
        Object.keys(tilePresets).forEach((id) => {
            const option = document.createElement('option');
            option.value = id;
            option.text = tilePresets[id];
            this.#tbTileMapPreset.options.add(option);
        });
        this.#tbTileMapPreset.selectedIndex = 0;

        this.#tbTileMapPreset.addEventListener('change', (ev) => {
            const value = this.#tbTileMapPreset.value;
            this.#tbTileWidth.disabled = value !== 'custom';
            this.#tbTileHeight.disabled = value !== 'custom';
            if (value !== 'custom') {
                const dimensions = value.split('x').map((v) => parseInt(v));
                this.#tbTileWidth.value = dimensions[0];
                this.#tbTileHeight.value = dimensions[1];
            }
        });

        this.#tbTileWidth.value = 8;
        this.#tbTileWidth.addEventListener('change', () => {
            const e = this.#tbTileWidth;
            const value = this.#tbTileWidth.value;
            if (value < parseInt())
        });

        this.#tbTileHeight.value = 8;
    }

    errorCheck(elm) {
        const value = parseInt(elm.value);
        const inError = false;
        if (typeof value !== 'number') inError = true;
        if (!inError && value < parseInt(elm.getAttribute('min'))) inError = true;
        if (!inError && value > parseInt(elm.getAttribute('max'))) inError = true;
        if (inError) {
            elm.classList.add('error');
        }
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<NewProjectDialogue>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/newProjectDialogue', element);
        return new NewProjectDialogue(componentElement);
    }


    /**
     * Sets the state of the dialogue.
     * @param {NewProjectDialogueState} state - State object.
     */
    setState(state) {
        // if (typeof state?.tileSetData === 'string') {
        //     this.#tbTileSetData.value = state.tileSetData;
        // }
        // if (typeof state?.replace === 'boolean' || typeof state?.replace === 'number') {
        //     this.#tbReplaceTiles.checked = state.replace;
        // }
    }


    /**
     * @param {NewProjectDialogueConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        // super.addHandlerOnConfirm(() => {
        //     callback({
        //         tileSetData: this.#tbTileSetData.value,
        //         replace: this.#tbReplaceTiles.checked
        //     });
        // });
    }


}


/**
 * New project dialogue state object.
 * @typedef {object} NewProjectDialogueState
 * @property {string?} system - Selected system.
 * @property {boolean?} createTileMap - Create a default tile map?
 * @property {string?} selectedtilePreset - The selected tile preset.
 * @property {number?} tileWidth - Number of tiles wide for tile map.
 * @property {number?} tileHeight - Number of tiles high for tile map.
 */

/**
 * New project dialogue confirm callback.
 * @callback NewProjectDialogueConfirmCallback
 * @argument {NewProjectDialogueConfirmEventArgs} data - Data from the dialogue.
 * @exports
 */
/**
 * New project dialogue confirm args.
 * @typedef {object} NewProjectDialogueConfirmEventArgs
 * @property {string} system - Selected system.
 * @property {boolean} createTileMap - Create a default tile map?
 * @exports
 */