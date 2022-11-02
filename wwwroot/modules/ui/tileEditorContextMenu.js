import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    clone: 'clone', remove: 'remove',
    moveLeft: 'moveLeft', moveRight: 'moveRight',
    mirrorHorizontal: 'mirrorHorizontal', mirrorVertical: 'mirrorVertical',
    insertBefore: 'insertBefore', insertAfter: 'insertAfter'
}

export default class TileEditorContextMenu {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLButtonElement} */
    #btnTileEditorMenu;
    /** @type {EventDispatcher} */
    #dispatcher;


    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#btnTileEditorMenu = this.#element.querySelector('[data-bs-toggle=dropdown]');
    
        this.#element.querySelectorAll('button[data-command]').forEach(button => {
            button.onclick = () => {
                /** @type {TileEditorContextMenuCommandEventArgs} */
                const args = {
                    command: button.getAttribute('data-command'),
                    x: parseInt(this.#btnTileEditorMenu.getAttribute('data-x-coord')),
                    y: parseInt(this.#btnTileEditorMenu.getAttribute('data-y-coord'))
                };
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            }
        });
    }


    /**
     * Shows the context menu.
     * @param {number} clientX - X coordinate relative to the client viewport.
     * @param {number} clientY - Y coordinate relative to the client viewport.
     * @param {number} tileSetX - Corresponding X pixel in the tile set.
     * @param {number} tileSetY - Corresponding Y pixel in the tile set.
     * @returns {boolean}
     */
    show(clientX, clientY, tileSetX, tileSetY) {
        // Record related pixel
        this.#btnTileEditorMenu.setAttribute('data-x-coord', tileSetX);
        this.#btnTileEditorMenu.setAttribute('data-y-coord', tileSetY);

        // Position menu to mouse pointer
        const rect = this.#element.getBoundingClientRect();
        this.#btnTileEditorMenu.style.top = `${(clientY - rect.top - 5)}px`;
        this.#btnTileEditorMenu.style.left = `${(clientX - rect.left - 5)}px`;

        // Launch menu
        this.#btnTileEditorMenu.click();

        // Prevent default action of Boostrap context menu.
        return false;
    }


    /**
     * Register a callback function for when a command is invoked.
     * @param {TileEditorContextMenuCommandCallback} callback - Callback that will receive the command.
     */
     addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


}


/**
 * Tile editor context menu callback.
 * @callback TileEditorContextMenuCommandCallback
 * @param {TileEditorContextMenuCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileEditorContextMenuCommandEventArgs
 * @property {string} command - Command being invoked.
 * @property {number} x - X tile map pixel.
 * @property {number} y - Y tile map pixel.
 * @exports
 */

