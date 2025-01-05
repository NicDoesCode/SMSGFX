import ModalDialogue from "./../modalDialogue.js";
import TemplateUtil from "../../util/templateUtil.js";
import TileMapList from "../../models/tileMapList.js";


const createModes = {
    new: 'new',
    clone: 'clone'
}

const tileOptions = {
    createNew: 'createNew',
    repeatNew: 'repeatNew',
    useSelected: 'useSelected',
    useTileSet: 'useTileSet'
}

const tileOptionDescriptions = {
    createNew: 'Create all new tiles',
    repeatNew: 'Create a single tile and repeat it',
    useSelected: 'Use the selected tile',
    useTileSet: 'Use the tile set (create new tiles where needed)'
}

const dimensionPresets = {
    custom: 'custom',
    size2x2: 'size2x2',
    size4x4: 'size4x4',
    size8x8: 'size8x8',
    size8x16: 'size8x16',
    size16x8: 'size16x8',
    size16x16: 'size16x16',
    size20x18: 'size20x18',
    size32x24: 'size32x24',
    size32x28: 'size32x28',
    size32x30: 'size32x30'
};

const tilePresetDescriptions = {
    custom: 'Custom',
    size2x2: '2x2 tiles',
    size4x4: '4x4 tiles',
    size8x8: '8x8 tiles',
    size8x16: '8x16 tiles - tall',
    size16x8: '16x8 tiles - wide',
    size16x16: '16x16 tiles',
    size20x18: '20x18 tiles - Game Gear & Game Boy screen size',
    size32x24: '32x24 tiles - Master System screen size',
    size32x28: '32x28 tiles - NES screen size (NTSC)',
    size32x30: '32x30 tiles - NES screen size (PAL)'
};

const presetRegex = /^[A-z]+(\d+)[x](\d+)$/;


export default class NewTileMapDialogue extends ModalDialogue {


    static get CreateModes() {
        return createModes;
    }

    static get TileOptions() {
        return tileOptions;
    }

    static get TilePresets() {
        return dimensionPresets;
    }


    /** @type {HTMLSelectElement} */
    #tbTitle;
    /** @type {HTMLElement} */
    #tbCreateMode;
    /** @type {HTMLSelectElement} */
    #tbCreateOption;
    /** @type {HTMLSelectElement} */
    #tbTileMapPreset;
    /** @type {HTMLInputElement} */
    #tbTileWidth;
    /** @type {HTMLInputElement} */
    #tbTileHeight;
    /** @type {HTMLSelectElement} */
    #tbTileMapId;
    /** @type {HTMLInputElement} */
    #tbCloneTiles;
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

        this.#tbTitle = this.#element.querySelector('[data-smsgfx-id=project-title]');
        this.#tbCreateMode = this.#element.querySelector('[data-smsgfx-id=create-mode]');
        this.#tbCreateOption = this.#element.querySelector('[data-smsgfx-id=create-option]');
        this.#tbTileMapPreset = this.#element.querySelector('[data-smsgfx-id=tile-map-preset]');
        this.#tbTileWidth = this.#element.querySelector('[data-smsgfx-id=tile-width]');
        this.#tbTileHeight = this.#element.querySelector('[data-smsgfx-id=tile-height]');
        this.#tbTileMapId = this.#element.querySelector('[data-smsgfx-id=tile-map-to-clone]');
        this.#tbCloneTiles = this.#element.querySelector('[data-smsgfx-id=clone-tile-map-tiles]');

        this.#tbCreateOption.querySelectorAll('option').forEach((o) => o.remove());
        Object.keys(tileOptions).forEach((id) => {
            const option = document.createElement('option');
            option.value = id;
            option.text = tileOptionDescriptions[id] ?? tileOptions[id];
            this.#tbCreateOption.options.add(option);
        });
        this.#tbTileMapPreset.selectedIndex = 0;

        this.#tbTileMapPreset.querySelectorAll('option').forEach((o) => o.remove());
        Object.keys(dimensionPresets).forEach((id) => {
            const option = document.createElement('option');
            option.value = id;
            option.text = tilePresetDescriptions[id] ?? dimensionPresets[id];
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
     * @returns {Promise<NewTileMapDialogue>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/newTileMapDialogue', element);
        return new NewTileMapDialogue(componentElement);
    }


    /**
     * Sets the state of the dialogue.
     * @param {NewTileMapDialogueState} state - State object.
     */
    setState(state) {
        if (typeof state?.title === 'string') {
            this.#tbTitle.value = state?.title;
        } else if (state?.title === null) {
            this.#tbTitle.value = '';
        }

        if (typeof state?.createMode === 'string' && createModes[state.createMode]) {
            TemplateUtil.setTabPanelValue(this.#tbCreateMode, state.createMode);
        }

        if (typeof state?.createOption === 'string' && tileOptions[state.createOption]) {
            this.#tbCreateOption.value = state.createOption;
        }

        if (typeof state?.tileMapWidth === 'number') {
            this.#tbTileMapPreset.selectedIndex = 0;
            this.#tbTileWidth.value = state.tileMapWidth;
        }

        if (typeof state?.tileMapHeight === 'number') {
            this.#tbTileMapPreset.selectedIndex = 0;
            this.#tbTileHeight.value = state.tileMapHeight;
        }

        if (typeof state?.selectedSizePreset === 'string' && dimensionPresets[state.selectedSizePreset]) {
            this.#tbTileMapPreset.value = state.selectedSizePreset;
            this.#updateTileMapPreset();
        }

        if (state?.tileMapList instanceof TileMapList) {
            this.#updateTileMapList(state.tileMapList);
        }
 
        if (typeof state?.cloneTiles === 'boolean') {
            this.#tbCloneTiles.checked = state.cloneTiles;
        }
   }


    /**
     * @param {NewTileMapDialogueConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            const fm = this.#element.querySelector('form');
            if (fm.checkValidity()) {
                callback({
                    title: this.#tbTitle.value,
                    createMode: TemplateUtil.getTabPanelValue(this.#tbCreateMode),
                    createOption: this.#tbCreateOption.value,
                    tileMapWidth: parseInt(this.#tbTileWidth.value),
                    tileMapHeight: parseInt(this.#tbTileHeight.value),
                    cloneTileMapId: this.#tbTileMapId.value,
                    cloneTiles: this.#tbCloneTiles.checked 
                });
            }
            fm.classList.add('was-validated');
        });
    }


    #updateTileMapPreset() {
        const value = this.#tbTileMapPreset.value;
        this.#tbTileWidth.disabled = value !== 'custom';
        this.#tbTileHeight.disabled = value !== 'custom';
        if (value !== 'custom' && presetRegex.test(value)) {
            const sizeMatch = presetRegex.exec(value);
            this.#tbTileWidth.value = parseInt(sizeMatch[1]);
            this.#tbTileHeight.value = parseInt(sizeMatch[2]);
        }
    }

    /**
     * @param {TileMapList} tileMapList 
     */
    #updateTileMapList(tileMapList) {
        const existing = this.#tbTileMapId.value;
        this.#tbTileMapId.querySelectorAll('option').forEach((node) => node.remove());
        tileMapList.getTileMaps().forEach((tileMap) => {
            const option = document.createElement('option');
            option.value = tileMap.tileMapId;
            option.text = tileMap.title;
            if (existing === tileMap.tileMapId) option.selected = true;
            this.#tbTileMapId.options.add(option);
        });
        if (this.#tbTileMapId.selectedIndex === -1) this.#tbTileMapId.selectedIndex = 0;
    }


}


/**
 * New tile map dialogue state object.
 * @typedef {Object} NewTileMapDialogueState
 * @property {string?} [title] - Tile map title.
 * @property {string?} [createMode] - The tile map creation mode.
 * @property {string?} [createOption] - How to create tiles for the tile map.
 * @property {string?} [selectedSizePreset] - The selected size preset.
 * @property {number?} [tileMapWidth] - Number of tiles wide for tile map.
 * @property {number?} [tileMapHeight] - Number of tiles high for tile map.
 * @property {TileMapList?} [tileMapList] - List of tile maps.
 * @property {TileMapList?} [cloneTiles] - List of tile maps.
 */

/**
 * New tile map dialogue confirm callback.
 * @callback NewTileMapDialogueConfirmCallback
 * @argument {NewTileMapDialogueConfirmEventArgs} data - Data from the dialogue.
 * @exports
 */
/**
 * New tile map dialogue confirm args.
 * @typedef {Object} NewTileMapDialogueConfirmEventArgs
 * @property {string} title - Tile map title.
 * @property {string} createMode - The tile map creation mode.
 * @property {string} createOption - How to create tiles for the tile map.
 * @property {number} tileMapWidth - Number of tiles wide for tile map.
 * @property {number} tileMapHeight - Number of tiles high for tile map.
 * @property {string?} cloneTileMapId - Unique ID of the tile map to clone.
 * @property {boolean} cloneTiles - Should the tiles within the tile map also be cloned?
 * @exports
 */