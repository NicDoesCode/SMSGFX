import TileFactory from "../factory/tileFactory.js";
import TileMapFactory from "../factory/tileMapFactory.js";
import TileMapTileFactory from "../factory/tileMapTileFactory.js";
import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class TileMapTool {

    /**
     * Creates a new tile map with all new tiles.
     * @param {TileMapCreateWithNewTilesArgs} args - Arguments for the creation of the tile map.
     */
    static createTileMapWithNewTiles(args) {
        if (!args.tileSet instanceof TileSet) throw new Error('Please supply a tile set.');
        const tileSet = args.tileSet;
        if (typeof args.defaultColourIndex !== 'number') throw new Error('Colour index not supplied.');

        const result = TileMapTool.#createTileMap(args);
        const totalTiles = args.columnCount * args.rowCount;
        for (let index = 0; index < totalTiles; index++) {
            const tile = TileFactory.create({ defaultColourIndex: args.defaultColourIndex });
            tileSet.addTile(tile);
            result.setTileByIndex(index, TileMapTileFactory.create({ tileId: tile.tileId }));
        }
        return result;
    }

    /**
     * Creates a new tile map with a single new tile.
     * @param {TileMapCreateWithNewTilesArgs} args - Arguments for the creation of the tile map.
     */
    static createTileMapWithOneNewTile(args) {
        if (!args.tileSet instanceof TileSet) throw new Error('Please supply a tile set.');
        const tileSet = args.tileSet;
        if (typeof args.defaultColourIndex !== 'number') throw new Error('Colour index not supplied.');

        const tile = TileFactory.create({ defaultColourIndex: args.defaultColourIndex });
        tileSet.addTile(tile);

        const result = TileMapTool.#createTileMap(args);
        const totalTiles = args.columnCount * args.rowCount;
        for (let index = 0; index < totalTiles; index++) {
            result.setTileByIndex(index, TileMapTileFactory.create({ tileId: tile.tileId }));
        }
        return result;
    }

    /**
     * Creates a new tile map with all tiles referencing a single tile within a tile set.
     * @param {TileMapCreateWithExistingTileArgs} args - Arguments for the creation of the tile map.
     */
    static createTileMapWithTileId(args) {
        if (!args.tileSet instanceof TileSet) throw new Error('Please supply a tile set.');
        const tileSet = args.tileSet;
        const tile = tileSet.getTileById(args.tileId);
        if (!tile) throw new Error('Tile with the given Tile ID was not found.')

        const result = TileMapTool.#createTileMap(args);
        const totalTiles = args.columnCount * args.rowCount;
        for (let index = 0; index < totalTiles; index++) {
            result.setTileByIndex(index, TileMapTileFactory.create({ tileId: tile.tileId }));
        }
        return result;
    }

    /**
     * Creates a new tile map with all tiles referencing sequential tiles within a tile set.
     * @param {TileMapCreateWithTileSet} args - Arguments for the creation of the tile map.
     */
    static createTileMapWithTileSet(args) {
        if (!args.tileSet instanceof TileSet) throw new Error('Please supply a tile set.');
        const tileSet = args.tileSet;

        let tileIndex = (typeof args.startTileIndex === 'number') ? Math.min(args.tileSet.tileCount, Math.max(0, args.startTileIndex)) : 0;

        const result = TileMapTool.#createTileMap(args);
        const totalTiles = args.columnCount * args.rowCount;
        for (let index = 0; index < totalTiles; index++) {
            const thisTileIndex = (tileIndex + index) % tileSet.tileCount;
            const tile = tileSet.getTileInfoByIndex(thisTileIndex);
            result.setTileByIndex(index, TileMapTileFactory.create({ tileId: tile.tileId }));
        }
        return result;
    }

    /**
     * @param {TileMapCreateArgsBase} args - Arguments for the creation of the tile map.
     */
    static #createTileMap(args) {
        if (typeof args.defaultPaletteId !== 'string') throw new Error('Invalid default palette ID.')
        const result = TileMapFactory.create({
            title: args.title ?? 'New tile map',
            columns: args.columnCount,
            rows: args.rowCount,
            optimise: args.optimise ?? true
        });
        result.getPalettes().forEach((palette, index) => {
            result.setPalette(index, args.defaultPaletteId);
        });
        return result;
    }

    /**
     * Clones an existing tile map.
     * @param {TileMapToolCloneArgs} args - Arguments for the creation of the tile map.
     */
    static cloneTileMap(args) {
        if (!args.tileMapToClone instanceof TileMap) throw new Error('Please supply a tile map to clone.');
        if (!args.tileSet instanceof TileSet) throw new Error('Please supply a tile set.');
        const tileSet = args.tileSet;

        const tileMapToClone = args.tileMapToClone;

        const result = TileMapFactory.create({
            title: args.title ?? `${tileMapToClone.title} (copy)`,
            columns: tileMapToClone.columnCount,
            rows: tileMapToClone.rowCount,
            optimise: tileMapToClone.optimise,
            vramOffset: tileMapToClone.vramOffset
        });

        tileMapToClone.getPalettes().forEach((palette, index) => {
            result.setPalette(index, palette);
        });

        /** @type {Object<string, string>} */
        const idMapping = {};

        tileMapToClone.getTiles().forEach((existingTileMapTile, index) => {
            /** @type {Tile} */ 
            let tile;
            const existingTileId = existingTileMapTile.tileId;
            if (args.cloneTiles) {
                // When cloning tiles, we have to rememeber that some tiles in the tile map
                // may reference the same tile set tile multiple times, in these cases we only
                // want to create a single cloned tile, and use it whenever that same tile is referenced
                tile = tileSet.getTileById(idMapping[existingTileId] ?? null);
                if (!tile) {
                    tile = TileFactory.clone(tileSet.getTileById(existingTileId));
                    tileSet.addTile(tile);
                    idMapping[existingTileId] = tile.tileId;
                }
            } else {
                // Not cloning tiles
                tile = tileSet.getTileById(existingTileId);
            }

            result.setTileByIndex(index, TileMapTileFactory.create({
                tileId: tile.tileId,
                horizontalFlip: existingTileMapTile.horizontalFlip,
                verticalFlip: existingTileMapTile.verticalFlip,
                palette: existingTileMapTile.palette,
                priority: existingTileMapTile.priority
            }));
        });

        return result;
    }

}
/** 
 * @typedef {object} TileMapCreateArgsBase
 * @property {string} title - Title of the new tile map.
 * @property {number} columnCount - Number of columns for the new tile map.
 * @property {number} rowCount - Number of rows for the new tile map.
 * @property {boolean} [optimise] - Should the tile map have it's optimise flag set? (false if no value supplied).
 * @property {string} defaultPaletteId - ID of the palette to use as the default palette.
 * @mixin 
 */
/** 
 * Arguments.
 * @typedef {Object} TileMapCreateWithNewTilesArgs
 * @property {string} title - Title of the new tile map.
 * @property {number} columnCount - Number of columns for the new tile map.
 * @property {number} rowCount - Number of rows for the new tile map.
 * @property {boolean} [optimise] - Should the tile map have it's optimise flag set? (false if no value supplied).
 * @property {string} defaultPaletteId - ID of the palette to use as the default palette.
 * @property {number} defaultColourIndex - Colour index to use when a new tile map is being created.
 * @property {TileSet} tileSet - Tile set that contains the tiles.
 * @exports
 */
/** 
 * Arguments.
 * @typedef {Object} TileMapCreateWithExistingTileArgs
 * @property {string} title - Title of the new tile map.
 * @property {number} columnCount - Number of columns for the new tile map.
 * @property {number} rowCount - Number of rows for the new tile map.
 * @property {boolean} [optimise] - Should the tile map have it's optimise flag set? (false if no value supplied).
 * @property {string} defaultPaletteId - ID of the palette to use as the default palette.
 * @property {string} tileId - Unique ID of the tile to be set.
 * @property {TileSet} tileSet - Tile set that contains the tiles.
 * @exports
 */
/** 
 * Arguments.
 * @typedef {Object} TileMapCreateWithTileSet
 * @property {string} title - Title of the new tile map.
 * @property {number} columnCount - Number of columns for the new tile map.
 * @property {number} rowCount - Number of rows for the new tile map.
 * @property {boolean} [optimise] - Should the tile map have it's optimise flag set? (false if no value supplied).
 * @property {string} defaultPaletteId - ID of the palette to use as the default palette.
 * @property {TileSet} tileSet - Tile set that contains the tiles.
 * @property {number} startTileIndex - Zero based index of the tile to start from when assigning.
 * @exports
 */
/** 
 * Arguments.
 * @typedef {Object} TileMapToolCloneArgs
 * @property {string} title - Title of the new tile map.
 * @property {TileMap} tileMapToClone - Tile map to be cloned.
 * @property {boolean} [cloneTiles] - When true the cloned tile map becomes a deep copy with new tiles, otherwise it becomes a shallow copy referencing existing tiles.
 * @property {TileSet} tileSet - Tile set that contains the tiles.
 * @exports
 */
