export default class TileEditor {


    /** 
     * When a palette is to be imported.
     * @type {TileEditorCallback} 
     */
    get onAddTileSet() {
        return this.#onAddTileSetCallback;
    }
    set onAddTileSet(value) {
        if (value && typeof value === 'function') {
            this.#onAddTileSetCallback = value;
        } else {
            this.#onAddTileSetCallback = () => { };
        }
    }

    /** @type {TileEditorCallback} */
    #onAddTileSetCallback = () => { };

    /** 
     * Selected tool is changed.
     * @type {TileEditorToolCallback} 
     */
    get onSelectedToolChanged() {
        return this.#onSelectedToolChangedCallback;
    }
    set onSelectedToolChanged(value) {
        if (value && typeof value === 'function') {
            this.#onSelectedToolChangedCallback = value;
        } else {
            this.#onSelectedToolChangedCallback = () => { };
        }
    }

    /** @type {TileEditorToolCallback} */
    #onSelectedToolChangedCallback = () => { };

    /** 
     * Tile width is changed.
     * @type {TileEditorTileWidthChangedCallback} 
     */
    get onTileWidthChanged() {
        return this.#onTileWidthChangedCallback;
    }
    set onTileWidthChanged(value) {
        if (value && typeof value === 'function') {
            this.#onTileWidthChangedCallback = value;
        } else {
            this.#onTileWidthChangedCallback = () => { };
        }
    }

    /** @type {TileEditorTileWidthChangedCallback} */
    #onTileWidthChangedCallback = () => { };

    /** 
     * Zoom level is changed.
     * @type {TileEditorZoomChangedCallback} 
     */
    get onZoomChanged() {
        return this.#onZoomChangedCallback;
    }
    set onZoomChanged(value) {
        if (value && typeof value === 'function') {
            this.#onZoomChangedCallback = value;
        } else {
            this.#onZoomChangedCallback = () => { };
        }
    }

    /** @type {TileEditorZoomChangedCallback} */
    #onZoomChangedCallback = () => { };

    /** 
     * Move has moved over a pixel.
     * @type {TileEditorPixelCallback} 
     */
    get onPixelOver() {
        return this.#onPixelOverCallback;
    }
    set onPixelOver(value) {
        if (value && typeof value === 'function') {
            this.#onPixelOverCallback = value;
        } else {
            this.#onPixelOverCallback = () => { };
        }
    }

    /** @type {TileEditorPixelCallback} */
    #onPixelOverCallback = () => { };

    /** 
     * Move has been pressed onto a pixel.
     * @type {TileEditorPixelCallback} 
     */
    get onPixelMouseDown() {
        return this.#onPixelMouseDownCallback;
    }
    set onPixelMouseDown(value) {
        if (value && typeof value === 'function') {
            this.#onPixelMouseDownCallback = value;
        } else {
            this.#onPixelMouseDownCallback = () => { };
        }
    }

    /** @type {TileEditorPixelCallback} */
    #onPixelMouseDownCallback = () => { };

    /** 
     * Move has been released or has moved outside the bounding area.
     * @type {TileEditorPixelCallback} 
     */
    get onPixelMouseUp() {
        return this.#onPixelMouseUpCallback;
    }
    set onPixelMouseUp(value) {
        if (value && typeof value === 'function') {
            this.#onPixelMouseUpCallback = value;
        } else {
            this.#onPixelMouseUpCallback = () => { };
        }
    }

    /** @type {TileEditorPixelCallback} */
    #onPixelMouseUpCallback = () => { };


    /**
     * Gets the current pixel zoom value.
     */
    get zoomValue() {
        return parseInt(this.#tbTileSetZoom.value);
    }
    set zoomValue(value) {
        this.#tbTileSetZoom.value = value;
    }

    /**
     * Gets the current pixel zoom value.
     */
    get tileWidth() {
        return parseInt(this.#tbTileSetWidth.value);
    }
    set tileWidth(value) {
        this.#tbTileSetWidth.value = value;
    }

    /**
     * Gets the canvas for drawing the image.
     */
    get canvas() {
        return this.#tbCanvas;
    }

    /**
     * Gets whether the mouse is down on the canvas.
     */
    get canvasMouseIsDown() {
        return this.#canvasMouseIsDown;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLCanvasElement} */
    #tbCanvas;
    /** @type {HTMLButtonElement} */
    #btnAddTileSet;
    /** @type {HTMLInputElement} */
    #tbTileSetWidth;
    /** @type {HTMLSelectElement} */
    #tbTileSetZoom;
    /** @type {number} */
    #lastZoom;
    /** @type {number} */
    #lastImageX = -1;
    /** @type {number} */
    #lastImageY = -1;
    /** @type {boolean} */
    #canvasMouseIsDown;


    /**
     * 
     * @param {HTMLElement} element Element that the tile editor is to be initialised from.
     */
    constructor(element) {
        this.#element = element;

        this.#tbCanvas = this.#element.querySelector('#tbCanvas');

        this.#btnAddTileSet = this.#element.querySelector('#btnAddTileSet');
        this.#btnAddTileSet.onclick = () => this.onAddTileSet(this, {});

        this.#tbTileSetWidth = this.#element.querySelector('#tbTileSetWidth');
        this.#tbTileSetWidth.onchange = () => this.#handleTileSetWidthChange();

        this.#tbTileSetZoom = this.#element.querySelector('#tbTileSetZoom');
        this.#tbTileSetZoom.onchange = () => this.#handleZoomChange();

        this.#lastZoom = parseInt(tbTileSetZoom.value);

        this.#tbCanvas.onmousemove = (event) => this.#handleCanvasMouseMove(event);
        this.#tbCanvas.onmousedown = (event) => this.#handleCanvasMouseDown(event);
        this.#tbCanvas.onmouseup = (event) => this.#handleCanvasMouseUp(event);
        this.#tbCanvas.onmouseleave = (event) => this.#handleCanvasMouseUp(event);

        const toolButtons = this.#element.querySelectorAll('button[data-tool-button]');
        toolButtons.forEach(toolButton => {
            toolButton.onclick = () => this.#handleToolChanged(toolButton.getAttribute('data-tool-button'));
        });
    }


    /**
     * Highlights selected tool.
     * @param {string} toolName Tool to highlight.
     */
    highlightTool(toolName) {
        const buttons = this.#element.querySelectorAll('button[data-tool-button]');
        buttons.forEach(button => {
            if (button.getAttribute('data-tool-button') === toolName) {
                button.classList.remove('btn-outline-secondary');
                if (!button.classList.contains('btn-secondary')) {
                    button.classList.add('btn-secondary');
                }
            } else {
                button.classList.remove('btn-secondary');
                if (!button.classList.contains('btn-outline-secondary')) {
                    button.classList.add('btn-outline-secondary');
                }
            }
        });
    }


    /** @param {MouseEvent} event */
    #getImageCoordinatesFromMouseEvent(event) {
        const rect = this.#tbCanvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        const imageX = Math.floor(canvasX / this.zoomValue);
        const imageY = Math.floor(canvasY / this.zoomValue);
        return { imageX, imageY };
    }


    /** @param {MouseEvent} event */
    #handleCanvasMouseMove(event) {
        const coords = this.#getImageCoordinatesFromMouseEvent(event);
        if (this.#lastImageX !== coords.imageX || this.#lastImageY !== coords.imageY) {
            this.onPixelOver(this, { imageX: coords.imageX, imageY: coords.imageY });
            this.#lastImageX = coords.imageX;
            this.#lastImageY = coords.imageY;
        }
    }

    /** @param {MouseEvent} event */
    #handleCanvasMouseDown(event) {
        this.#canvasMouseIsDown = true;
        const coords = this.#getImageCoordinatesFromMouseEvent(event);
        this.onPixelMouseDown(this, { imageX: coords.imageX, imageY: coords.imageY });
    }

    /** @param {MouseEvent} event */
    #handleCanvasMouseUp(event) {
        this.#canvasMouseIsDown = false;
        const coords = this.#getImageCoordinatesFromMouseEvent(event);
        this.onPixelMouseUp(this, { imageX: coords.imageX, imageY: coords.imageY });
    }

    #handleTileSetWidthChange() {
        const value = parseInt(this.#tbTileSetWidth.value);
        if (!isNaN(value) && value > 0 && value <= 16) {
            this.onTileWidthChanged(this, { tileWidth: value });
            this.#tbTileSetWidth.classList.remove('is-invalid');
        } else if (!this.#tbTileSetWidth.classList.contains('is-invalid')) {
            this.#tbTileSetWidth.classList.add('is-invalid');
        }
    }

    #handleZoomChange() {
        const newZoom = parseInt(this.#tbTileSetZoom.value);
        if (newZoom !== this.#lastZoom) {
            this.#lastZoom = newZoom;
            this.onZoomChanged(this, { zoom: newZoom });
        }
    }

    /** @param {string} tool */
    #handleToolChanged(tool) {
        this.onSelectedToolChanged(this, { tool });
    }


}

/**
 * Event callback.
 * @callback TileEditorCallback
 * @param {TileEditor} sender - Originating tile editor.
 * @param {object} e - Event args.
 * @exports
 */

/**
 * Event callback.
 * @callback TileEditorToolCallback
 * @param {TileEditor} sender - Originating tile editor.
 * @param {TileEditorToolEventData} e - Event args.
 * @exports
 */
/**
 * @typedef TileEditorToolEventData
 * @type {object}
 * @property {string} tool - Selected tool.
 * @exports 
 */

/**
 * Callback for when tile width is changed.
 * @callback TileEditorTileWidthChangedCallback
 * @param {TileEditor} sender - Originating tile editor.
 * @param {TileEditorTileWidthChangedEventData} e - Event args.
 * @exports
 */
/**
 * @typedef TileEditorTileWidthChangedEventData
 * @type {object}
 * @property {number} tileWidth - Tile width.
 * @exports 
 */

/**
 * Callback for when zoom level is changed.
 * @callback TileEditorZoomChangedCallback
 * @param {TileEditor} sender - Originating tile editor.
 * @param {TileEditorZoomChangedEventData} e - Event args.
 * @exports
 */
/**
 * @typedef TileEditorZoomChangedEventData
 * @type {object}
 * @property {number} zoom - Zoom level.
 * @exports 
 */

/**
 * Callback for the cursor is over a different pixel.
 * @callback TileEditorPixelCallback
 * @param {TileEditor} sender - Originating tile editor.
 * @param {TileEditorPixelEventData} e - Event args.
 * @exports
 */
/**
 * @typedef TileEditorPixelEventData
 * @type {object}
 * @property {number} imageX - Tile set X pixel.
 * @property {number} imageY - Tile set Y pixel.
 * @exports 
 */
