import Palette from "../models/palette.js";
import Tile from "../models/tile.js";
import TileSet from "../models/tileSet.js";
import PaletteJsonSerialiser from "../serialisers/paletteJsonSerialiser.js";
import TileJsonSerialiser from "../serialisers/tileJsonSerialiser.js";
import TileSetJsonSerialiser from "../serialisers/tileSetJsonSerialiser.js";
import PaintUtil from "../util/paintUtil.js";


/** @type {Object<string, { canvas: OffscreenCanvas, context: CanvasRenderingContext2D}>} */
let canvases = {};
/** @type {TileSet} */
let tileSet = null;
/** @type {Palette} */
let palette = null;


addEventListener('message', (e) => {
    if (e.data?.messageType === 'add') {
        addTileCanvas(e.data);
    } else if (e.data?.messageType === 'update') {
        updateTileCanvas(e.data);
    } else if (e.data?.messageType === 'clear') {
        clearTileCanvases(e.data);
    } else if (e.data?.messageType === 'set') {
        setValues(e.data);
    }
});


/**
 * @param {TileImageWorkerAddCanvasMessage} message 
 */
function addTileCanvas(message) {
    canvases[message.tileId] = {
        canvas: message.canvas,
        context: message.canvas.getContext('2d')
    };
}

/**
 * @param {TileImageWorkerUpdateMessage} message 
 */
function updateTileCanvas(message) {
    if (Array.isArray(message.tiles)) {
        message.tiles.forEach((tileSerialsable) => {
            const tile = TileJsonSerialiser.fromSerialisable(tileSerialsable);
            const existing = tileSet.getTileById(tile.tileId);
            if (existing) {
                existing.setData(tile.readAll());
                updateTile(tile.tileId);
            } 
        });
    }
}

/**
 * @param {TileImageWorkerClearMessage} message 
 */
function clearTileCanvases(message) {
    canvases = {};
    palette = null;
    tileSet = null;
}

/**
 * @param {TileImageWorkerSetMessage} message 
 */
function setValues(message) {
    let update = false;
    if (typeof message.clear === 'boolean' && message.clear === true) {
        canvases = {};
        update = true;
    }
    if (typeof message.tileSet === 'object' && message.tileSet !== null) {
        tileSet = TileSetJsonSerialiser.fromSerialisable(message.tileSet);
        update = true;
    }
    if (typeof message.palette === 'object' && message.palette !== null) {
        palette = PaletteJsonSerialiser.fromSerialisable(message.palette);
        update = true;
    }
    if (message.canvases && Array.isArray(message.canvases)) {
        message.canvases.forEach((c) => {
            canvases[c.tileId] = {
                canvas: c.canvas,
                context: c.canvas.getContext('2d')
            };
        });
        update = true;
    }
    if (update) {
        updateAll();
    }
}


function updateAll() {
    Object.keys(canvases).forEach((tileId) => {
        updateTile(tileId);
    });
}

function updateTile(tileId) {
    const c = canvases[tileId];
    const tile = tileSet.getTileById(tileId);
    if (c && tile instanceof Tile && palette instanceof Palette) {
        PaintUtil.drawTileImageOntoCanvas(tile, palette, c.canvas, c.context, []);
    }
}


/**
 * @typedef {Object} TileImageWorkerAddCanvasMessage
 * @property {string} messageType - Always 'add'
 * @property {OffscreenCanvas} canvas 
 * @property {string} tileId
 * @exports
 */

/**
 * @typedef {Object} TileImageWorkerUpdateMessage
 * @property {string} messageType - Always 'update'
 * @property {Object[]} tiles
 * @exports
 */

/**
 * @typedef {Object} TileImageWorkerClearMessage
 * @property {string} messageType - Always 'clear'
 * @exports
 */

/**
 * @typedef {Object} TileImageWorkerSetMessage
 * @property {string} messageType - Always 'set'
 * @property {import('./../serialisers/paletteJsonSerialiser.js').PaletteSerialisable} [palette] 
 * @property {import('./../serialisers/tileSetJsonSerialiser.js').TileSetSerialisable} [tileSet] 
 * @property {{tileId: string, canvas: OffscreenCanvas}[]} [canvases] 
 * @property {boolean} [clear] 
 * @exports
 */
