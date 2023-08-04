import ComponentBase from "../componentBase.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import TileMapRowColumnTool from "../../tools/tileMapRowColumnTool.js";
import TemplateUtil from "../../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    cut: 'cut', copy: 'copy', paste: 'paste',
    clone: 'clone', remove: 'remove',
    moveLeft: 'moveLeft', moveRight: 'moveRight',
    mirrorHorizontal: 'mirrorHorizontal', mirrorVertical: 'mirrorVertical',
    insertBefore: 'insertBefore', insertAfter: 'insertAfter',
    brushSize: 'brushSize',
    tileClamp: 'tileClamp',
    tileLinkBreak: 'tileLinkBreak',
    referenceImageLockAspect: 'referenceImageLockAspect',
    referenceImageSelect: 'referenceImageSelect',
    referenceImageClear: 'referenceImageClear',
    referenceImageDisplay: 'referenceImageDisplay',
    referenceImageRevert: 'referenceImageRevert',
    rowColumnMode: 'rowColumnMode',
    rowColumnFillMode: 'rowColumnFillMode',
    paletteSlot: 'paletteSlot',
    tileAttributes: 'tileAttributes',
    tileStampDefine: 'tileStampDefine',
    tileStampClear: 'tileStampClear'
}
const toolstrips = {
    select: 'select',
    pencil: 'pencil',
    tileMapPencil: 'tileMapPencil',
    referenceImage: 'referenceImage',
    rowColumn: 'rowColumn',
    palettePaint: 'palettePaint',
    tileStamp: 'tileStamp',
    tileLinkBreak: 'tileLinkBreak',
    tileAttributes: 'tileAttributes',
    tileEyedropper: 'tileEyedropper'
}

export default class TileContextToolbar extends ComponentBase {


    static get Commands() {
        return commands;
    }

    static get Toolstrips() {
        return toolstrips;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {{HTMLButtonElement}} */
    #buttons = {};
    #dispatcher;
    #enabled = true;
    /** @type {DOMRect} */
    #lastBounds = null;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        TemplateUtil.wireUpLabels(this.#element);
        TemplateUtil.wireUpCommandAutoEvents(this.#element, (sender, ev, command) => {
            const args = this.#createArgs(command, sender);
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<TileContextToolbar>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('toolbars/tileContextToolbar', element);
        return new TileContextToolbar(componentElement);
    }


    /**
     * Sets the state of the tile context toolbar.
     * @param {TileContextToolbarState} state - State object.
     */
    setState(state) {
        if (typeof state?.visible === 'boolean') {
            // Set visibility
            if (state.visible) {
                while (this.#element.classList.contains('visually-hidden')) {
                    this.#element.classList.remove('visually-hidden');
                }
            } else {
                if (!this.#element.classList.contains('visually-hidden')) {
                    this.#element.classList.add('visually-hidden');
                }
            }
        }
        if (state?.disabledCommands && Array.isArray(state.disabledCommands)) {
            this.#element.querySelectorAll('[data-command]').forEach((button) => {
                button.removeAttribute('disabled');
            });
            state.disabledCommands.forEach((disabledCommand) => {
                if (disabledCommand && typeof disabledCommand === 'string') {
                    this.#element.querySelectorAll(`[data-command=${disabledCommand}]`).forEach((elm) => {
                        elm.setAttribute('disabled', 'disabled');
                    });
                }
            });
        }
        if (state?.selectedCommands && Array.isArray(state.selectedCommands)) {
            this.#element.querySelectorAll('[data-command]').forEach((button) => {
                const command = button.getAttribute('data-command');
                button.classList.remove('active');
                if (state.selectedCommands.includes(command)) {
                    button.classList.add('active');
                }

            });
        }
        if (typeof state?.systemType === 'string') {
            this.#element.querySelectorAll('[data-system-type]').forEach((element) => {
                element.classList.remove('sms-hidden-system');
                const systems = element.getAttribute('data-system-type')?.split(',') ?? [];
                const containsSystem = systems.indexOf(state.systemType) >= 0;
                if (!containsSystem) {
                    element.classList.add('sms-hidden-system');
                }
            });
        } else if (state?.systemType === null) {
            this.#element.querySelectorAll('[data-system-type]').forEach((element) => {
                element.classList.remove('sms-hidden-system');
            });
        }
        if (typeof state?.brushSize === 'number') {
            this.#element.querySelectorAll(`[data-command=${commands.brushSize}]`).forEach(button => {
                button.classList.remove('active');
                const size = parseInt(button.getAttribute('data-brush-size'));
                if (size === state.brushSize) {
                    button.classList.add('active');
                }
            });
        }
        if (typeof state?.clampToTile === 'boolean') {
            /** @type {HTMLInputElement?} */
            const check = this.#element.querySelector(`[data-command=${TileContextToolbar.Commands.tileClamp}]`);
            if (check) check.checked = state.clampToTile;
        }
        if (typeof state?.tileBreakLinks === 'boolean') {
            /** @type {HTMLInputElement?} */
            const check = this.#element.querySelector(`[data-command=${TileContextToolbar.Commands.tileBreakLinks}]`);
            if (check) check.checked = state.tileBreakLinks;
        }
        if (typeof state?.rowColumnMode !== 'undefined') {
            this.#element.querySelectorAll(`button[data-command=${TileContextToolbar.Commands.rowColumnMode}][data-mode]`)
                .forEach((button) => button.classList.remove('active'));
            if (state?.rowColumnMode !== null) {
                this.#element.querySelectorAll(`button[data-command=${TileContextToolbar.Commands.rowColumnMode}][data-mode=${CSS.escape(state.rowColumnMode)}]`)
                    .forEach((button) => button.classList.add('active'));
            }
        }
        if (typeof state?.rowColumnFillMode !== 'undefined') {
            const mode = state.rowColumnFillMode ?? TileMapRowColumnTool.TileFillMode.useSelected;
            this.#element.querySelectorAll(`select[data-command=${TileContextToolbar.Commands.rowColumnFillMode}]`)
                .forEach((select) => select.value = mode);
        }
        if (state?.visibleToolstrips && Array.isArray(state.visibleToolstrips)) {
            this.#element.querySelectorAll('[data-toolstrip]').forEach(element => {
                const toolstrip = element.getAttribute('data-toolstrip');
                if (state.visibleToolstrips.includes(toolstrip)) {
                    while (element.classList.contains('visually-hidden')) {
                        element.classList.remove('visually-hidden');
                    }
                } else {
                    element.classList.add('visually-hidden');
                }
            });
        }
        if (state.referenceBounds) {
            const b = state.referenceBounds;
            this.#element.querySelectorAll(`[data-command=${commands.referenceImageDisplay}][data-field]`).forEach(element => {
                switch (element.getAttribute('data-field')) {
                    case 'referenceX': element.value = Math.round(b.x); break;
                    case 'referenceY': element.value = Math.round(b.y); break;
                    case 'referenceWidth': element.value = Math.round(b.width); break;
                    case 'referenceHeight': element.value = Math.round(b.height); break;
                }
            });
            this.#lastBounds = b;
        }
        if (typeof state?.referenceLockAspect === 'boolean') {
            const element = this.#element.querySelector('button[data-toggle=referenceImageAspect]');
            if (state.referenceLockAspect) {
                if (element.classList.contains('active')) element.classList.add('active');
                element.setAttribute('aria-pressed', 'true');
            } else {
                while (element.classList.contains('active')) element.classList.remove('active');
                element.setAttribute('aria-pressed', 'false');
            }
        }
        if (typeof state?.referenceTransparency === 'number') {
            const element = this.#element.querySelector(`[data-command=${commands.referenceImageDisplay}][data-field=referenceTransparency]`);
            if (element) element.value = state.referenceTransparency;
        }
        if (state?.tileAttributes) {
            this.#element.querySelectorAll('button[data-command=tileAttributes][data-field=horizontalFlip]').forEach((el) => {
                if (state.tileAttributes.horizontalFlip) {
                    el.classList.add('active');
                    el.setAttribute('data-selected', 'true');
                } else {
                    el.classList.remove('active');
                    el.removeAttribute('data-selected');
                }
            });
            this.#element.querySelectorAll('button[data-command=tileAttributes][data-field=verticalFlip]').forEach((el) => {
                if (state.tileAttributes.verticalFlip) {
                    el.classList.add('active');
                    el.setAttribute('data-selected', 'true');
                } else {
                    el.classList.remove('active');
                    el.removeAttribute('data-selected');
                }
            });
            this.#element.querySelectorAll('button[data-command=tileAttributes][data-field=priority]').forEach((el) => {
                if (state.tileAttributes.priority) {
                    el.classList.add('active');
                    el.setAttribute('data-selected', 'true');
                } else {
                    el.classList.remove('active');
                    el.removeAttribute('data-selected');
                }
            });
            this.#element.querySelectorAll('button[data-command=tileAttributes][data-field=palette]').forEach((el) => {
                const slotNumber = parseInt(el.getAttribute('data-slot-number'));
                if (state.tileAttributes.palette === slotNumber) {
                    el.classList.add('active');
                    el.setAttribute('data-selected', 'true');
                } else {
                    el.classList.remove('active');
                    el.removeAttribute('data-selected');
                }
            });
        }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }

        if (typeof state?.paletteSlotCount === 'number') {
            this.#element.querySelectorAll('[data-smsgfx-id=paletteSlotSelect]').forEach((container) => {
                fillPaletteSlotButtons(container, TileContextToolbar.Commands.paletteSlot, null, state.paletteSlotCount, (e, n) => {
                    const command = e.getAttribute('data-command');
                    const args = this.#createArgs(command, e);
                    this.#dispatcher.dispatch(EVENT_OnCommand, args);
                });
            });
            this.#element.querySelectorAll('[data-smsgfx-id=tileAttributePaletteSlot]').forEach((container) => {
                fillPaletteSlotButtons(container, TileContextToolbar.Commands.tileAttributes, 'palette', state.paletteSlotCount, (e, n) => {
                    const command = e.getAttribute('data-command');
                    const args = this.#createArgs(command, e);
                    this.#dispatcher.dispatch(EVENT_OnCommand, args);
                });
            });
        }

        if (typeof state?.paletteSlot === 'number') {
            this.#element.querySelectorAll('[data-smsgfx-id=paletteSlotSelect] button').forEach((button) => {
                button.classList.remove('active');
                const slotNumber = parseInt(button.getAttribute('data-slot-number'));
                if (slotNumber === state.paletteSlot) {
                    button.classList.add('active');
                }
            });
        }
    }


    /**
     * Register a callback for when a command button is clicked on the tile context toolbar.
     * @param {TileContextToolbarCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command 
     * @param {HTMLElement} element 
     * @returns {TileContextToolbarCommandEventArgs}
     */
    #createArgs(command, element) {

        const referenceBounds = new DOMRect(
            parseInt(this.#element.querySelector('[data-field=referenceX]')?.value ?? 0),
            parseInt(this.#element.querySelector('[data-field=referenceY]')?.value ?? 0),
            parseInt(this.#element.querySelector('[data-field=referenceWidth]')?.value ?? 0),
            parseInt(this.#element.querySelector('[data-field=referenceHeight]')?.value ?? 0)
        );

        const buttonLinkReferenceAspect = this.#element.querySelector('button[data-toggle=referenceImageAspect]');

        if (this.#lastBounds) {
            if (isToggled(buttonLinkReferenceAspect)) {
                const field = element.getAttribute('data-field');
                if (field === 'referenceWidth') {
                    const percent = 1 / this.#lastBounds.width * referenceBounds.width;
                    referenceBounds.height = Math.round(this.#lastBounds.height * percent);
                } else if (field === 'referenceHeight') {
                    const percent = 1 / this.#lastBounds.height * referenceBounds.height;
                    referenceBounds.width = Math.round(this.#lastBounds.width * percent);
                }
            }
        }

        /** @type {TileContextToolbarCommandEventArgs} */
        const result = {
            command: command ?? null,
            brushSize: 0,
            referenceBounds: referenceBounds,
            referenceLockAspect: isToggled(buttonLinkReferenceAspect),
            referenceTransparency: parseInt(this.#element.querySelector('[data-field=referenceTransparency]')?.value ?? 0)
        };

        const coms = TileContextToolbar.Commands;

        if (command === coms.rowColumnMode || command === coms.rowColumnFillMode) {
            /** @type {HTMLButtonElement} */
            const modeButton = command === coms.rowColumnMode ? element : this.#element.querySelector(`button[data-command=${commands.rowColumnMode}].active`);
            /** @type {HTMLSelectElement} */
            const fillModeSelect = this.#element.querySelector(`select[data-command=${commands.rowColumnFillMode}]`);
            if (modeButton) {
                result.rowColumnMode = modeButton.getAttribute('data-mode');
                result.rowColumnFillMode = fillModeSelect.value;
            } else {
                throw new Error('Unable to determine active fill mode.');
            }
        }

        if (command === coms.brushSize) {
            result.brushSize = parseInt(element.getAttribute('data-brush-size') ?? 0);
        }

        if (command === coms.tileClamp) {
            result.tileClamp = element.nodeName === 'INPUT' && element.type === 'checkbox' && element.checked;
        }

        if (command === coms.tileLinkBreak) {
            result.tileBreakLinks = element.nodeName === 'INPUT' && element.type === 'checkbox' && element.checked;
        }

        if (command === coms.paletteSlot) {
            result.paletteSlot = parseInt(element.getAttribute('data-slot-number'));
        }

        if (command === coms.tileAttributes) {
            const field = element.getAttribute('data-field');
            /** @type {TileContextToolbarTileAttributes} */ const attr = {};
            if (field === 'horizontalFlip') {
                attr.horizontalFlip = element.getAttribute('data-selected') ? false : true;
            } else {
                attr.horizontalFlip = this.#element.querySelector(`[data-command=${command}][data-field=horizontalFlip]`).getAttribute('data-selected') ? true : false;
            }
            if (field === 'verticalFlip') {
                attr.verticalFlip = element.getAttribute('data-selected') ? false : true;
            } else {
                attr.verticalFlip = this.#element.querySelector(`[data-command=${command}][data-field=verticalFlip]`).getAttribute('data-selected') ? true : false;
            }
            if (field === 'priority') {
                attr.priority = element.getAttribute('data-selected') ? false : true;
            } else {
                attr.priority = this.#element.querySelector(`[data-command=${command}][data-field=priority]`).getAttribute('data-selected') ? true : false;
            }
            if (field === 'palette') {
                attr.palette = parseInt(element.getAttribute('data-slot-number') ?? '0');
            } else {
                const selected = this.#element.querySelector(`[data-command=${command}][data-field=palette][data-selected]`);
                attr.palette = parseInt(selected?.getAttribute('data-slot-number') ?? '0');
            }
            result.tileAttributes = attr;
        }

        return result;
    }


}

/**
 * @param {HTMLElement} element
 * @returns {Boolean}
 */
function isToggled(element) {
    return element?.classList.contains('active') ?? false;
}


/**
 * @typedef {object} TileContextToolbarState
 * @property {boolean?} visible - Is the toolbar visible?
 * @property {boolean?} enabled - Is the toolbar enabled?
 * @property {string[]?} visibleToolstrips - An array of strings containing visible toolstrips.
 * @property {string[]?} disabledCommands - An array of strings containing disabled buttons.
 * @property {string[]?} selectedCommands - An array of strings containing selected commands to set to active display status.
 * @property {string?} [systemType] - Type of system, which will affect fields with 'data-system-type' attribute .
 * @property {number?} [brushSize] - Selected brush size, 1 to 5.
 * @property {boolean?} [clampToTile] - Clamp to tile?
 * @property {boolean?} [tileBreakLinks] - Break tile links on edit?
 * @property {string?} [rowColumnMode] - Mode for add / remove row / column.
 * @property {string?} [rowColumnFillMode] - Fill mode for the row / column tool.
 * @property {number?} [paletteSlot] - Palette slot.
 * @property {number?} [paletteSlotCount] - Number of palette slots.
 * @property {DOMRect?} referenceBounds - Bounds for the reference image.
 * @property {boolean?} referenceLockAspect - Whether or not to lock the aspect ratio for the reference image.
 * @property {number?} referenceTransparency - Transparency colour for the reference image.
 * @property {TileContextToolbarTileAttributes?} [tileAttributes] - Tile attributes to fill.
 * @exports
 */

/**
 * @typedef {object} TileContextToolbarTileAttributes
 * @property {boolean} horizontalFlip - Flip the tile horizontally?
 * @property {boolean} verticalFlip - Flip the tile vertically?
 * @property {boolean} priority - Does the tile have render priority?
 * @property {number} palette - Which palette slot is the tile using?
 * @exports
 */

/**
 * Callback for when a command is invoked.
 * @callback TileContextToolbarCommandCallback
 * @param {TileContextToolbarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileContextToolbarCommandEventArgs
 * @property {string} command - Command being invoked.
 * @property {number?} [brushSize] - Brush size, 1 to 5.
 * @property {boolean?} [tileClamp] - Clamp to tile?
 * @property {boolean?} [tileBreakLinks] - Break tile links on edit?
 * @property {string?} [rowColumnMode] - Mode for add / remove row / column.
 * @property {string?} [rowColumnFillMode] - Tile fill mode for add / remove row / column.
 * @property {number?} [paletteSlot] - Palette slot.
 * @property {DOMRect} referenceBounds - Bounds for the reference image.
 * @property {boolean} referenceLockAspect - Whether or not to lock the aspect ratio for the reference image.
 * @property {number} referenceTransparency - Colour index to draw transparent.
 * @property {TileContextToolbarTileAttributes?} [tileAttributes] - Tile map tile attributes.
 * @exports
 */

/**
 * @callback PaletteSlotClickCallback
 * @argument {HTMLElement} element
 * @argument {number} slotNumber
 */
/**
 * 
 * @param {HTMLElement} element 
 * @param {string} command 
 * @param {string?} [field] 
 * @param {number} slotCount 
 * @param {PaletteSlotClickCallback} clickEvent 
 */
function fillPaletteSlotButtons(element, command, field, slotCount, clickEvent) {
    element.querySelectorAll('button').forEach((button) => {
        button.remove();
    });
    for (let slotNumber = 0; slotNumber < slotCount; slotNumber++) {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-secondary');
        button.innerText = slotNumber;
        button.setAttribute('data-command', command);
        if (field) {
            button.setAttribute('data-field', field);
        }
        button.setAttribute('data-slot-number', slotNumber);
        button.setAttribute('title', `Palette slot ${slotNumber}.`)
        element.appendChild(button);
        button.addEventListener('click', () => clickEvent(button, slotNumber));
    }
}

