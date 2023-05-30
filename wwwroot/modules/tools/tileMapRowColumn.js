import TileFactory from "../factory/tileFactory.js";
import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";


const MODE = {
    addRow: 'addRow',
    deleteRow: 'deleteRow',
    addColumn: 'addColumn',
    deleteColumn: 'deleteColumn'
};

const TILE_FILL_MODE = {
    useSelected: 'useSelected',
    copyOnceSelected: 'copyOnceSelected',
    copyAllSelected: 'copyAllSelected',
    newOnce: 'newOnce',
    newAll: 'newAll'
};


export default class TileMapRowColumn {


    static get Mode() {
        return MODE;
    }

    static get Modes() {
        return Object.keys(MODE);
    }

    static get TileFillMode() {
        return TILE_FILL_MODE;
    }

    static get TileFillModes() {
        return Object.keys(TILE_FILL_MODE);
    }


    /**
     * Takes the tool action.
     * @param {TileMapRowColumnArgs} args - Arguments supplied for operation.
     * @returns {TileMapRowColumnResult}
     */
    static takeAction(args) {
        if (!args) throw new Error('Invalid arguments.');
        if (!args.tileMap && !args.tileMap instanceof TileMap) throw new Error('Tile map must be supplied.');
        if (!args.tileSet && !args.tileSet instanceof TileSet) throw new Error('Tile set must be supplied.');
        if (!TileMapRowColumn.Modes.includes(args.mode)) throw new Error('Unknown mode.');
        if (!TileMapRowColumn.TileFillModes.includes(args.fillMode)) throw new Error('Unknown fill mode.');
        if (typeof args.index !== 'number') throw new Error('Index must be supplied.');

        const tileMap = args.tileMap;
        const tileSet = args.tileSet;
        const index = args.index;

        if (args.mode === MODE.addRow) {
            if (index < 0 || index > tileMap.rowCount) throw new Error('Index out or range for add new row.');

            insertTileMapRow(tileMap, tileSet, index, args.fillMode, args.tileId, args.colourIndex);

        } else if (args.mode === MODE.deleteRow) {
            if (index < 0 || index >= tileMap.rowCount) throw new Error('Index out or range for delete row.');

            tileMap.removeRow(index);

        } else if (args.mode === MODE.addColumn) {
            if (index < 0 || index > tileMap.columnCount) throw new Error('Index out or range for add new column.');

            insertTileMapColumn(tileMap, tileSet, index, args.fillMode, args.tileId, args.colourIndex);

        } else if (args.mode === MODE.deleteColumn) {
            if (index < 0 || index >= tileMap.columnCount) throw new Error('Index out or range for delete column.');

            tileMap.removeColumn(index);

        }
    }


}


/**
 * @param {TileMap} tileMap 
 * @param {TileSet} tileSet 
 * @param {number} index 
 * @param {string} fillMode 
 * @param {string?} [tileId]
 * @param {number?} [colourIndex]
 */
function insertTileMapRow(tileMap, tileSet, index, fillMode, tileId, colourIndex) {
    if (typeof fillMode === 'undefined' || !TileMapRowColumn.TileFillModes.includes(fillMode)) {
        throw new Error('Unrecognised fill mode.');
    }
    tileMap.insertRow(index);
    const newTileMapTiles = tileMap.getTileMapRow(index);
    fillNewTileRowColumn(newTileMapTiles, tileSet, fillMode, tileId, colourIndex);
}

/**
 * @param {TileMap} tileMap 
 * @param {TileSet} tileSet 
 * @param {number} index 
 * @param {string} fillMode 
 * @param {string?} [tileId]
 * @param {number?} [colourIndex]
 */
function insertTileMapColumn(tileMap, tileSet, index, fillMode, tileId, colourIndex) {
    if (typeof fillMode === 'undefined' || !TileMapRowColumn.TileFillModes.includes(fillMode)) {
        throw new Error('Unrecognised fill mode.');
    }
    tileMap.insertColumn(index);
    const newTileMapTiles = tileMap.getTileMapColumn(index);
    fillNewTileRowColumn(newTileMapTiles, tileSet, fillMode, tileId, colourIndex);
}

/**
 * @param {TileMapTile[]} tileSetTiles 
 * @param {TileSet} tileSet 
 * @param {string} fillMode
 * @param {string?} [tileId]
 * @param {number?} [colourIndex]
 */
function fillNewTileRowColumn(tileSetTiles, tileSet, fillMode, tileId, colourIndex) {
    if (fillMode === TILE_FILL_MODE.useSelected || fillMode === TILE_FILL_MODE.copyAllSelected || fillMode === TILE_FILL_MODE.copyOnceSelected) {

        const tile = tileSet.getTileById(tileId);
        if (!tile) throw new Error(`Tile with ID '${tileId}' not found.`);

        if (fillMode === TILE_FILL_MODE.useSelected) {
            tileSetTiles.forEach((tileMapTile) => {
                tileMapTile.tileId = tile.tileId;
            });
        } else if (fillMode === TILE_FILL_MODE.copyAllSelected) {
            tileSetTiles.forEach((tileMapTile) => {
                const newTile = TileFactory.create({
                    data: tile.readAll()
                });
                tileSet.addTile(newTile);
                tileMapTile.tileId = newTile.tileId;
            });
        } else if (fillMode === TILE_FILL_MODE.copyOnceSelected) {
            const newTile = TileFactory.create({
                data: tile.readAll()
            });
            tileSet.addTile(newTile);
            tileSetTiles.forEach((tileMapTile) => {
                tileMapTile.tileId = newTile.tileId;
            });
        }

    } else if (fillMode === TILE_FILL_MODE.newAll || fillMode === TILE_FILL_MODE.newOnce) {

        if (typeof colourIndex !== 'number' || colourIndex < 0 || colourIndex > 15) throw new Error('Invalid colour index.')

        if (fillMode === TILE_FILL_MODE.newOnce) {
            const newTile = TileFactory.create({
                defaultColourIndex: colourIndex
            });
            tileSet.addTile(newTile);
            tileSetTiles.forEach((tileMapTile) => {
                tileMapTile.tileId = newTile.tileId;
            });
        } else if (fillMode === TILE_FILL_MODE.newAll) {
            tileSetTiles.forEach((tileMapTile) => {
                const newTile = TileFactory.create({
                    defaultColourIndex: colourIndex
                });
                tileSet.addTile(newTile);
                tileMapTile.tileId = newTile.tileId;
            });
        }

    }
}

/** 
 * Arguments for the Tile Map row column tool.
 * @typedef {object} TileMapRowColumnArgs
 * @property {TileMap} tileMap - Tile map to operate on.
 * @property {TileSet} tileSet - Tile set that contains the tiles linked to the tile map.
 * @property {string} mode - Mode to use for the operation.
 * @property {string?} [fillMode] - Fill mode to use for the operation, must be supplied when adding rows or columns.
 * @property {number} index - Index or the row or column to operate on.
 * @property {string?} [tileId] - Unique ID of the selected tile to use when filling with a tile ID.
 * @property {number?} [colourIndex] - Index of the colour slot to fill the tile with.
 * @exports
 */
/** 
 * Result result for the Tile Map row column tool.
 * @typedef {object} TileMapRowColumnResult
 * @exports
 */