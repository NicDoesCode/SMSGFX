import ModalDialogue from "./../modalDialogue.js";
import TemplateUtil from "../../util/templateUtil.js";


const systems = {
    'smsgg': 'smsgg',
    'nes': 'nes',
    'gb': 'gb'
}

const systemDescriptions = {
    'smsgg': 'Sega Master System and Game Gear',
    'nes': 'Nintendo Entertainment System',
    'gb': 'Nintendo Game Boy'
}

const tilePresets = {
    custom: 'custom',
    '32x30': '32x30',
    '32x28': '32x28',
    '32x24': '32x24',
    '20x18': '20x18'
};

const tilePresetDescriptions = {
    'custom': 'Custom',
    '32x30': '32x30 tiles - NES (PAL)',
    '32x28': '32x28 tiles - NES (NTSC)',
    '32x24': '32x24 tiles - Master System',
    '20x18': '20x18 tiles - Game Gear & Game Boy'
};

export default class NewProjectDialogue extends ModalDialogue {


    static get Systems() {
        return systems;
    }

    static get TilePresets() {
        return tilePresets;
    }


    /** @type {HTMLSelectElement} */
    #tbSystemType;
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

        this.#tbSystemType = this.#element.querySelector('[data-smsgfx-id=system-type]');
        this.#tbCreateTileMap = this.#element.querySelector('[data-smsgfx-id=create-tile-map]');
        this.#tbTileMapPreset = this.#element.querySelector('[data-smsgfx-id=tile-map-preset]');
        this.#tbTileWidth = this.#element.querySelector('[data-smsgfx-id=tile-width]');
        this.#tbTileHeight = this.#element.querySelector('[data-smsgfx-id=tile-height]');

        this.#tbCreateTileMap.checked = true;

        this.#tbSystemType.querySelectorAll('option').forEach((o) => o.remove());
        Object.keys(systems).forEach((id) => {
            const option = document.createElement('option');
            option.value = id;
            option.text = systemDescriptions[id] ?? systems[id];
            this.#tbSystemType.options.add(option);
        });
        this.#tbSystemType.selectedIndex = 0;

        this.#tbTileMapPreset.querySelectorAll('option').forEach((o) => o.remove());
        Object.keys(tilePresets).forEach((id) => {
            const option = document.createElement('option');
            option.value = id;
            option.text = tilePresetDescriptions[id] ?? tilePresets[id];
            this.#tbTileMapPreset.options.add(option);
        });
        this.#tbTileMapPreset.selectedIndex = 0;

        this.#tbTileMapPreset.addEventListener('change', () => this.#updateTileMapPreset());

        this.#tbTileWidth.value = 8;
        this.#tbTileHeight.value = 8;
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
        if (typeof state?.systemType === 'string' && systems[state.systemType]) {
            this.#tbSystemType.value = state.systemType;
        }
        if (typeof state?.createTileMap === 'boolean') {
            this.#tbCreateTileMap.checked = state.createTileMap;
        }
        if (typeof state?.selectedtilePreset === 'string' && tilePresets[state.selectedtilePreset]) {
            this.#tbTileMapPreset.value = state.selectedtilePreset;
            this.#updateTileMapPreset();
        }
        if (typeof state?.tileWidth === 'number') {
            this.#tbTileMapPreset.selectedIndex = 0;
            this.#tbTileWidth.value = state.tileWidth;
        }
        if (typeof state?.tileHeight === 'number') {
            this.#tbTileMapPreset.selectedIndex = 0;
            this.#tbTileHeight.value = state.tileHeight;
        }
    }


    /**
     * @param {NewProjectDialogueConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            const fm = this.#element.querySelector('form');
            if (fm.checkValidity()) {
                callback({
                    systemType: this.#tbSystemType.value,
                    createTileMap: this.#tbCreateTileMap.checked,
                    tileWidth: parseInt(this.#tbTileWidth.value),
                    tileHeight: parseInt(this.#tbTileHeight.value)
                });
            }
            fm.classList.add('was-validated');
        });
    }


    #updateTileMapPreset() {
        const value = this.#tbTileMapPreset.value;
        this.#tbTileWidth.disabled = value !== 'custom';
        this.#tbTileHeight.disabled = value !== 'custom';
        if (value !== 'custom' && value.includes('x')) {
            const dimensions = value.split('x').map((v) => parseInt(v));
            this.#tbTileWidth.value = dimensions[0];
            this.#tbTileHeight.value = dimensions[1];
        }
    }


}


/**
 * New project dialogue state object.
 * @typedef {object} NewProjectDialogueState
 * @property {string?} title - Project title.
 * @property {string?} systemType - Selected system.
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
 * @property {string} title - Project title.
 * @property {string} systemType - Selected system.
 * @property {boolean} createTileMap - Create a default tile map?
 * @property {number} tileWidth - Number of tiles wide for tile map.
 * @property {number} tileHeight - Number of tiles high for tile map.
 * @exports
 */