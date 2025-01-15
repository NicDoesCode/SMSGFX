import ComponentBase from "../componentBase.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import TileMapRowColumnTool from "../../tools/tileMapRowColumnTool.js";
import TemplateUtil from "../../util/templateUtil.js";
import Palette from "../../models/palette.js";
import ColourUtil from "../../util/colourUtil.js";

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
    tileSetTileAttributes: 'tileSetTileAttributes',
    tileMapTileAttributes: 'tileMapTileAttributes',
    tileStampDefine: 'tileStampDefine',
    tileStampClear: 'tileStampClear',
    patternIndex: 'patternIndex',
    primaryColourIndex: 'primaryColourIndex',
    secondaryColourIndex: 'secondaryColourIndex',
    patternFixedOrigin: 'patternFixedOrigin'
}

const toolstrips = {
    select: 'select',
    pencil: 'pencil',
    tilePattern: 'tilePattern',
    tileMapPencil: 'tileMapPencil',
    tileMapPattern: 'tileMapPattern',
    referenceImage: 'referenceImage',
    rowColumn: 'rowColumn',
    palettePaint: 'palettePaint',
    tileStamp: 'tileStamp',
    tileLinkBreak: 'tileLinkBreak',
    tileMapTileAttributes: 'tileMapTileAttributes',
    tileEyedropper: 'tileEyedropper'
}

const toolstripLayouts = {
    tileSelect: ['selectLabel', 'tileCutCopyPaste', 'tileClone', 'tileDelete', 'tileMove', 'tileMirror', 'tileInsert', 'alwaysKeepTile'],
    tileMapSelect: ['tileAttributesLabel', 'tileMapMirror', 'tileMapPriority', 'tileMapPalette', 'alwaysKeepTile'],
    tilePencil: ['brushSize', 'tileClamp'],
    tileMapPencil: ['brushSize', 'tileClamp', 'breakLinks'],
    tileColourReplace: ['brushSize', 'tileClamp'],
    tileMapColourReplace: ['brushSize', 'tileClamp', 'breakLinkes'],
    tileBucket: ['tileClamp'],
    tileMapBucket: ['tileClamp', 'breakLinks'],
    tilePattern: ['patternSelect', 'brushSize', 'primaryColourIndex', 'secondaryColourIndex', 'tileClamp', 'fixedOrigin'],
    tileMapPattern: ['patternSelect', 'brushSize', 'primaryColourIndex', 'secondaryColourIndex', 'tileClamp', 'fixedOrigin', 'breakLinks'],
    eyedropper: ['tileEyedropperLabel', 'tileEyedropperDescription'],
    referenceImage: ['referenceImageLabel', 'referenceImageLoadClear', 'referenceImageRevert', 'referenceImagePosition', 'referenceImageDimensions', 'referenceImageColour'],
    tileMapAddRemove: ['rowColumnLabel', 'rowAddRemove', 'columnAddRemove', 'fillMode'],
    tileMapBreakLink: ['tileLinkBreakLabel', 'tileLinkBreakDescription'],
    tileStampPattern: ['tileStampLabel', 'tileStempSettings'],
    tileMapPalettePaint: ['palettePaintLabel', 'paletteSlot'],
    tileEyedropper: ['tileEyedropperLabel', 'tileEyedroppedDescription']
};

export default class TileContextToolbar extends ComponentBase {


    static get Commands() {
        return commands;
    }

    static get Toolstrips() {
        return toolstrips;
    }

    static get ToolstripLayouts() {
        return toolstripLayouts;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {{HTMLButtonElement}} */
    #buttons = {};
    #dispatcher;
    #enabled = true;
    /** @type {DOMRect} */
    #lastBounds = null;
    /** @type {Palette} */
    #palette = null;


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
        if (Array.isArray(state?.toolstripLayout)) {
            this.#setToolstripLayout(state.toolstripLayout.filter((i) => typeof i === 'string'));
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

        if (state?.tileMapTileAttributes) {
            setBooleanCheckField(this.#element, commands.tileMapTileAttributes, 'horizontalFlip', state.tileMapTileAttributes.horizontalFlip);
            setBooleanCheckField(this.#element, commands.tileMapTileAttributes, 'verticalFlip', state.tileMapTileAttributes.verticalFlip);
            setBooleanCheckField(this.#element, commands.tileMapTileAttributes, 'priority', state.tileMapTileAttributes.priority);
            setBooleanCheckField(this.#element, commands.tileMapTileAttributes, 'alwaysKeep', state.tileMapTileAttributes.alwaysKeep);
            setPaletteSlotCheckFields(this.#element, commands.tileMapTileAttributes, 'palette', state.tileMapTileAttributes.palette);
        }
        if (state?.tileSetTileAttributes) {
            setBooleanCheckField(this.#element, commands.tileSetTileAttributes, 'alwaysKeep', state.tileSetTileAttributes.alwaysKeep);
        }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }

        if (state?.palette instanceof Palette || state?.palette === null) {
            this.#palette = state.palette;
            this.#updatePaletteItems(this.#palette);
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
                fillPaletteSlotButtons(container, TileContextToolbar.Commands.tileMapTileAttributes, 'palette', state.paletteSlotCount, (e, n) => {
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

        if (Array.isArray(state?.patterns)) {
            this.#element.querySelectorAll('select[data-field=patternIndex]').forEach((/** @type {HTMLSelectElement} */ select) => {
                while (select.options.length > 0) select.options.remove(0);
                state?.patterns.forEach((pattern, index) => {
                    const option = document.createElement('option');
                    option.innerText = `#${index}`;
                    option.value = index;
                    select.options.add(option);
                });
            });
        }

        if (typeof state?.patternIndex === 'number') {
            this.#element.querySelectorAll('select[data-field=patternIndex]').forEach((select) => {
                if (state.patternIndex >= 0 && state.patternIndex < select.options.length) {
                    select.selectedIndex = state.patternIndex;
                }
            });
        }

        if (typeof state?.patternFixedOrigin === 'boolean') {
            this.#element.querySelectorAll('input[data-command=patternFixedOrigin]').forEach((checkbox) => {
                checkbox.checked = state.patternFixedOrigin;
            });
        }

        if (typeof state?.primaryColourIndex === 'number') {
            this.#element.querySelectorAll('select[data-field=primaryColourIndex]').forEach((select) => {
                if (state.primaryColourIndex >= 0 && state.primaryColourIndex < select.options.length) {
                    select.selectedIndex = state.primaryColourIndex;
                }
            });
        }

        if (typeof state?.secondaryColourIndex === 'number') {
            this.#element.querySelectorAll('select[data-field=secondaryColourIndex]').forEach((select) => {
                if (state.secondaryColourIndex >= 0 && state.secondaryColourIndex < select.options.length) {
                    select.selectedIndex = state.secondaryColourIndex;
                }
            });
        }
    }


    /**
     * 
     * @param {Palette?} palette - Palette to update with.
     */
    #updatePaletteItems(palette) {
        /** @type {HTMLSelectElement[]} */
        const selectors = [
            this.#element.querySelector('[data-field=primaryColourIndex]'),
            this.#element.querySelector('[data-field=secondaryColourIndex]')
        ];
        for (let selector of selectors) {
            const lastSelected = selector.selectedIndex;
            while (selector.options.length > 0) selector.options.remove(0);
            if (palette) {
                palette.getColours().forEach((colour, index) => {
                    const option = new Option(`#${index}`, index.toString(), index === 0);
                    option.style.backgroundColor = ColourUtil.toHex(colour.r, colour.g, colour.b);
                    option.style.color = ColourUtil.toHex(colour.r, colour.g, colour.b);
                    selector.options.add(option);
                });
                if (lastSelected >= 0 && lastSelected < selector.options.length) {
                    selector.selectedIndex = lastSelected;
                } else {
                    selector.selectedIndex = 0;
                }    
            }
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

        if (command === coms.tileMapTileAttributes) {
            const field = element.getAttribute('data-field');
            /** @type {TileContextToolbarTileMapTileAttributes} */ const attr = {};
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
            if (field === 'alwaysKeep') {
                attr.alwaysKeep = element.getAttribute('data-selected') ? false : true;
            } else {
                attr.alwaysKeep = this.#element.querySelector(`[data-command=${command}][data-field=alwaysKeep]`).getAttribute('data-selected') ? true : false;
            }
            result.tileMapTileAttributes = attr;
        }

        if (command === coms.tileSetTileAttributes) {
            const field = element.getAttribute('data-field');
            /** @type {TileContextToolbarTileSetTileAttributes} */ const attr = {};
            if (field === 'alwaysKeep') {
                attr.alwaysKeep = element.getAttribute('data-selected') ? false : true;
            } else {
                attr.alwaysKeep = this.#element.querySelector(`[data-command=${command}][data-field=alwaysKeep]`).getAttribute('data-selected') ? true : false;
            }
            result.tileSetTileAttributes = attr;
        }

        if (command === coms.patternIndex) {
            result.patternIndex = element.selectedIndex;
        }

        if (command === coms.patternFixedOrigin) {
            result.patternFixedOrigin = element.checked;
        }

        if (command === coms.primaryColourIndex) {
            result.primaryColourIndex = element.selectedIndex;
        }

        if (command === coms.secondaryColourIndex) {
            result.secondaryColourIndex = element.selectedIndex;
        }

        return result;
    }


    /**
     * @param {string[]} layoutItems 
     */
    #setToolstripLayout(layoutItems) {
        const container = this.#element.querySelector('[data-smsgfx-id=toolstrip]');
        const components = this.#element.querySelector('[data-smsgfx-id=toolstrip-components]');

        container.querySelectorAll('[data-tool-id]').forEach((layoutItemElement) => {
            components.appendChild(layoutItemElement);
        });
        // container.childNodes.forEach((n) => {
        //     components.appendChild(n);
        // });

        layoutItems.forEach((layoutItem) => {
            const layoutItemElement = components.querySelector(`[data-tool-id=${layoutItem}]`);
            if (layoutItemElement) {
                container.appendChild(layoutItemElement);
            } else {
                console.error(`Can't find tool item: ${layoutItem}`); // TMP 
            }
        });
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
 * @typedef {Object} TileContextToolbarState
 * @property {boolean?} visible - Is the toolbar visible?
 * @property {boolean?} enabled - Is the toolbar enabled?
 * @property {string[]?} [toolstripLayout] - Array of toolstrip items to display.
 * @property {string[]?} disabledCommands - An array of strings containing disabled buttons.
 * @property {string[]?} selectedCommands - An array of strings containing selected commands to set to active display status.
 * @property {string?} [systemType] - Type of system, which will affect fields with 'data-system-type' attribute .
 * @property {number?} [brushSize] - Selected brush size, 1 to 5.
 * @property {boolean?} [clampToTile] - Clamp to tile?
 * @property {boolean?} [tileBreakLinks] - Break tile links on edit?
 * @property {string?} [rowColumnMode] - Mode for add / remove row / column.
 * @property {string?} [rowColumnFillMode] - Fill mode for the row / column tool.
 * @property {Palette?} [palette] - Current colour palette.
 * @property {number?} [paletteSlot] - Palette slot.
 * @property {number?} [paletteSlotCount] - Number of palette slots.
 * @property {DOMRect?} referenceBounds - Bounds for the reference image.
 * @property {boolean?} referenceLockAspect - Whether or not to lock the aspect ratio for the reference image.
 * @property {number?} referenceTransparency - Transparency colour for the reference image.
 * @property {TileContextToolbarTileSetTileAttributes?} [tileSetTileAttributes] - Tile set tile attributes.
 * @property {TileContextToolbarTileMapTileAttributes?} [tileMapTileAttributes] - Tile map tile attributes.
 * @property {import("../../types.js").Pattern[]} [patterns] - Index of the pattern in the pattern list.
 * @property {number} [patternIndex] - Index of the pattern in the pattern list.
 * @property {boolean} [patternFixedOrigin] - Use a fixed origin for pattern painting?
 * @property {number} [primaryColourIndex] - Index of the pattern primary colour (colour #1).
 * @property {number} [secondaryColourIndex] - Index of the pattern secondary colour (colour #2).
* @exports
 */

/**
 * @typedef {Object} TileContextToolbarTileMapTileAttributes
 * @property {boolean} horizontalFlip - Flip the tile horizontally?
 * @property {boolean} verticalFlip - Flip the tile vertically?
 * @property {boolean} priority - Does the tile have render priority?
 * @property {number} palette - Which palette slot is the tile using?
 * @property {boolean} alwaysKeep - Preserve the underlying tile through optimisation routines?
 * @exports
 */

/**
 * @typedef {Object} TileContextToolbarTileSetTileAttributes
 * @property {boolean} alwaysKeep - Preserve the tile through optimisation routines?
 * @exports
 */

/**
 * Callback for when a command is invoked.
 * @callback TileContextToolbarCommandCallback
 * @param {TileContextToolbarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} TileContextToolbarCommandEventArgs
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
 * @property {TileContextToolbarTileSetTileAttributes?} [tileSetTileAttributes] - Tile set tile attributes.
 * @property {TileContextToolbarTileMapTileAttributes?} [tileMapTileAttributes] - Tile map tile attributes.
 * @property {number} [patternIndex] - Index of the pattern in the pattern list.
 * @property {boolean} [patternFixedOrigin] - Use a fixed origin for pattern painting?
 * @property {number} [primaryColourIndex] - Index of the pattern primary colour (colour #1).
 * @property {number} [secondaryColourIndex] - Index of the pattern secondary colour (colour #2).
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

function setBooleanCheckField(element, command, field, checkedValue, additionalSelector) {
    const selector = `button[data-command=${command}][data-field=${field}]`;
    if (typeof additionalSelector === 'string') {
        selector += additionalSelector;
    } else if (Array.isArray(additionalSelector)) {
        additionalSelector.forEach((sel) => selector += additionalSelector);
    }
    element.querySelectorAll(selector).forEach((el) => {
        if (checkedValue) {
            el.classList.add('active');
            el.setAttribute('data-selected', 'true');
        } else {
            el.classList.remove('active');
            el.removeAttribute('data-selected');
        }
    });
}
function setPaletteSlotCheckFields(element, command, field, selectedPaletteSlot) {
    element.querySelectorAll(`button[data-command=${command}][data-field=${field}]`).forEach((el) => {
        const slotNumber = parseInt(el.getAttribute('data-slot-number'));
        if (selectedPaletteSlot === slotNumber) {
            el.classList.add('active');
            el.setAttribute('data-selected', 'true');
        } else {
            el.classList.remove('active');
            el.removeAttribute('data-selected');
        }
    });
}