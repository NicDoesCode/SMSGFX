import EventDispatcher from "../../components/eventDispatcher.js";
import TileMapList from "../../models/tileMapList.js";
import TemplateUtil from "../../util/templateUtil.js";
import ComponentBase from "../componentBase.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    tileSetSelect: 'tileSetSelect',
    tileMapSelect: 'tileMapSelect',
    tileMapDelete: 'tileMapDelete'
}

export default class TileMapListing extends ComponentBase {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLElement} */
    #listElmement;
    /** @type {EventDispatcher} */
    #dispatcher;
    #enabled = true;
    /** @type {string?} */
    #selectedTileMapId = null;
    #showTileSetButton = false;
    #showDeleteButton = false;
    /** @type {TileMapList} */
    #tileMapList = null;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);

        this.#element = element;
        this.#listElmement = this.#element.querySelector('[data-smsgfx-id=tile-map-list]') ?? this.#element;

        this.#dispatcher = new EventDispatcher();
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<TileMapListing>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('components/tileMapListing', element);
        return new TileMapListing(componentElement);
    }


    /**
     * Updates the state of the object.
     * @param {TileMapListingState} state - State to set.
     */
    setState(state) {
        let dirty = false;

        if (typeof state.showTileSet !== 'undefined') {
            dirty = true;
            this.#showTileSetButton = state.showTileSet;
        }

        if (typeof state.showDelete !== 'undefined') {
            dirty = true;
            this.#showDeleteButton = state.showDelete;
        }

        if (typeof state?.selectedTileMapId !== 'undefined') {
            if (typeof state.selectedTileMapId === 'string') {
                this.#selectedTileMapId = state.selectedTileMapId;
            } else if (state.selectedTileMapId === null) {
                this.#selectedTileMapId = null;
            }
            this.#highlightSelectedTileMapId();
        }

        if (typeof state.width !== 'undefined') {
            this.#listElmement.style.width = (state.width !== null) ? state.width : null;
        }

        if (typeof state.height !== 'undefined') {
            this.#listElmement.style.height = (state.height !== null) ? state.height : null;
        }

        if (typeof state.tileMapList?.getTileMaps === 'function') {
            dirty = true;
            this.#tileMapList = state.tileMapList;
        }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }

        if (dirty) {
            this.#displayTileMapList(this.#tileMapList);
        }
    }


    /**
     * Registers a handler for a toolbar command.
     * @param {TileMapListingCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    #displayTileMapList() {
        const renderList = [];
        if (this.#showTileSetButton) {
            renderList.push({
                command: 'tileSetSelect',
                title: 'Entire tile set',
                tileMapId: '',
                showDeleteButton: false
            });
        }
        if (this.#tileMapList) {
            this.#tileMapList.getTileMaps().forEach((tileMap) => {
                renderList.push({
                    command: 'tileMapSelect',
                    title: tileMap.title,
                    tileMapId: tileMap.tileMapId,
                    showDeleteButton: this.#showDeleteButton
                });
            });
        }

        this.renderTemplateToElement(this.#listElmement, 'item-template', renderList);
        TemplateUtil.wireUpCommandAutoEvents(this.#listElmement, (element, event, command, domEvent) => this.handleAutoEvent(element, event, command, domEvent));

        this.#listElmement.querySelectorAll('[data-command=tileMapDelete]').forEach((elm) => {
            elm.style.display = this.#showDeleteButton ? null : 'none';
        });

        this.#highlightSelectedTileMapId();
    }

    /**
     * Override to handle auto events.
     * @param {HTMLElement} element - Element that generated the event.
     * @param {string} event - Name of the event that occurred.
     * @param {string} command - Name of the command that was invoked.
     * @param {Event} domEvent - The DOM event that occurred.
     */
    handleAutoEvent(element, event, command, domEvent) {
        const tileMapId = element.getAttribute('data-tile-map-id');
        this.#handleTileMapCommandButtonClicked(command, tileMapId);
        domEvent.stopImmediatePropagation();
        domEvent.preventDefault();
    }


    #highlightSelectedTileMapId() {
        this.#listElmement.querySelectorAll('[data-tile-map-id]').forEach((elm) => {
            elm.classList.remove('active');
            const tileMapId = elm.getAttribute('data-tile-map-id');
            if (tileMapId && tileMapId === this.#selectedTileMapId) {
                elm.classList.add('active');
            } else if (!tileMapId && this.#selectedTileMapId === null) {
                elm.classList.add('active');
            }
        });
    }


    /**
     * @param {string} command 
     * @param {string} tileMapId 
     */
    #handleTileMapCommandButtonClicked(command, tileMapId) {
        const args = this.#createArgs(command);
        args.tileMapId = tileMapId;
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
    }


    /**
     * @param {string} command
     * @returns {TileMapListingCommandEventArgs}
     */
    #createArgs(command) {
        return {
            command: command,
            tileMapId: null
        };
    }


}


/**
 * Tile map list state.
 * @typedef {object} TileMapListingState
 * @property {TileMapList?} tileMapList - List of tile maps to display in the menu.
 * @property {string?} [selectedTileMapId] - Unique ID of the selected tile map.
 * @property {boolean?} showTileSet - Show the tile set option?
 * @property {boolean?} showDelete - Show the delete button?
 * @property {string?} width - List width CSS declaration.
 * @property {string?} height - List height CSS declaration.
 * @property {boolean?} enabled - Is the control enabled or disabled?
 * @property {boolean?} visible - Is the control visible?
 */

/**
 * Tile map list callback.
 * @callback TileMapListingCommandCallback
 * @param {TileMapListingCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileMapListingCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string?} tileMapId - Unique tile map ID.
 * @exports
 */

