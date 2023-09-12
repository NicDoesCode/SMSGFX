import TileMapListFactory from "../factory/tileMapListFactory.js";
import PaletteList from "../models/paletteList.js";
import TileMap from "../models/tileMap.js";
import TileMapList from "../models/tileMapList.js";
import TileSet from "../models/tileSet.js";
import TileUtil from "./tileUtil.js";
import TileMapListJsonSerialiser from "./../serialisers/tileMapListJsonSerialiser.js";
import TileJsonSerialiser from "./../serialisers/tileJsonSerialiser.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";
import Project from "../models/project.js";
import TileMapFactory from "../factory/tileMapFactory.js";
import TileMapTileFactory from "../factory/tileMapTileFactory.js";
import TileFactory from "../factory/tileFactory.js";


/**
 * Provides tile map related utility functions.
 */
export default class TileMapUtil {


    /**
     * Turns a tile set into a tile map.
     * @param {TileSet} tileSet - Input tile set to convert to a tile map.
     * @param {number?} [palette] - Index of the palette to use for the tiles.
     * @param {number} [vramOffset] - VRAM memory offset for the tile addresses in the tile map.
     * @param {boolean} [optimise] - Generate an optimised tile map? (remove duplicates?), default = false.
     * @returns {TileMap}
     */
    static tileSetToTileMap(tileSet, palette, vramOffset, optimise) {
        if (!palette || ![0, 1, 2, 3].includes(palette)) palette = 0;
        if (!vramOffset || vramOffset < 0 || vramOffset >= 255) vramOffset = 0;
        if (typeof optimise !== 'boolean') optimise = false;

        const tileMap = TileMapFactory.create({
            columns: tileSet.tileWidth,
            rows: Math.ceil(tileSet.length / tileSet.tileWidth),
            vramOffset: vramOffset,
            optimise: optimise
        });
        tileSet.getTiles().forEach((tile, index) => {
            const tileMapTile = TileMapTileFactory.create({
                tileId: tile.tileId,
                horizontalFlip: false, verticalFlip: false,
                palette: palette, priority: false
            });
            tileMap.setTileByIndex(index, tileMapTile);
        });
        return tileMap;
    }


    /**
     * Returns an optimised bundle of tiles, tile maps and palettes.
     * @param {Project} project - Project to make the optimised bundle from.
     * @returns {TileMapBundle}
     */
    static createOptimisedBundleFromProject(project) {
        return TileMapUtil.createOptimisedBundle(project.tileMapList, project.tileSet, project.paletteList);
    }

    /**
     * Returns an optimised bundle of tiles, tile maps and palettes.
     * @param {TileMap | TileMapList} tileMapOrList - Tile map or list of tile maps.
     * @param {TileSet} tileSet - Tile set containing the source tiles.
     * @param {PaletteList} paletteList - List of palettes.
     * @returns {TileMapBundle}
     */
    static createOptimisedBundle(tileMapOrList, tileSet, paletteList) {
        /** @type {TileMapList} */
        let tileMapList;
        if (tileMapOrList && tileMapOrList instanceof TileMapList) {
            tileMapList = tileMapOrList;
        } else if (tileMapOrList && tileMapOrList instanceof TileMap) {
            tileMapList = TileMapListFactory.create([tileMapOrList]);
        } else {
            throw new Error('Please supply a valid tile map or tile map list.');
        }

        if (!tileSet || !tileSet instanceof TileSet) throw new Error('Please supply a valid tile set.');
        if (!paletteList || !paletteList instanceof PaletteList) throw new Error('Please supply a valid palette list.');

        // Build a list of used tiles
        // - Build optimised table
        // - Re-wire ID in tile set to matching same ID
        // - Build table with only used IDs

        const clonedTileSet = TileSetFactory.clone(tileSet);

        // Add a blank tile to catch broken tile referenves
        const blankTile = TileFactory.create({ defaultColourIndex: 0 });
        clonedTileSet.addTile(blankTile);

        /** @type {Object.<string, string>} */
        const tileHexToTileIdMapping = {};
        clonedTileSet.getTiles().forEach((tile) => {
            const tileAsHex = TileUtil.toHex(tile);
            if (!tileHexToTileIdMapping[tileAsHex]) {
                tileHexToTileIdMapping[tileAsHex] = tile.tileId;
            }
        });

        const optimisedTileMapList = TileMapListJsonSerialiser.deserialise(TileMapListJsonSerialiser.serialise(tileMapList));

        // Eliminate orphaned tiles from the tile maps
        optimisedTileMapList.getTileMaps().forEach((cloneTileMap) => {
            cloneTileMap.getTiles().forEach((tileMapTile) => {
                const tile = clonedTileSet.getTileById(tileMapTile.tileId);
                if (!tile) {
                    tileMapTile.tileId = blankTile.tileId;
                }
            });
        });

        // Scan each tile map, build a list of used tile map IDs to include in the final export
        // - If the tile map not to be optimised, then all tile IDs will be added to the list regardless
        // - When we encounter a tile with the 'alwaysKeep' flag, we'll also just add it to the list
        // - If the tile can be optimised away, compare it's hex with the tileHexToId dictionary, use a match from that instead of the original tile ID
        /** @type {Object.<string, string>} */
        const usedTileMapIds = {};
        optimisedTileMapList.getTileMaps().forEach((cloneTileMap) => {
            const skipOptimisation = !cloneTileMap.optimise;
            cloneTileMap.getTiles().forEach((tileMapTile) => {

                // Get the underlying tile from the tile set
                const tile = clonedTileSet.getTileById(tileMapTile.tileId);

                //If we're not optimising, or the tile is to be kept
                if (skipOptimisation || tile.alwaysKeep) {
                    // Just add it to the used tile list
                    usedTileMapIds[tile.tileId] = tile.tileId;
                } else  {
                    // Otherwise find a matching tile with the same hex, and use that tile instead
                    const tileHex = TileUtil.toHex(tile);
                    const tileIdMatchedFromHex = tileHexToTileIdMapping[tileHex];
                    tileMapTile.tileId = tileIdMatchedFromHex;
                    usedTileMapIds[tileIdMatchedFromHex] = tileIdMatchedFromHex;
                }

            });
        });

        // Now create an optimised tile set from the list of used tile IDs that we just created

        const optimisedTileSet = TileSetFactory.create();
        optimisedTileSet.tileWidth = clonedTileSet.tileWidth;
        Object.keys(usedTileMapIds).forEach((tileId) => {
            const tile = clonedTileSet.getTileById(tileId);
            const tileCopy = TileJsonSerialiser.deserialise(TileJsonSerialiser.serialise(tile));
            optimisedTileSet.addTile(tileCopy);
        });

        // Now we have an optimised tile set and tile map, correlate the IDs

        /** @type {Object.<string, number>} */
        const tileIdToIndex = {};
        optimisedTileSet.getTiles().forEach((tile, index) => {
            tileIdToIndex[tile.tileId] = index;
        });

        optimisedTileMapList.getTileMaps().forEach((tileMap) => {
            tileMap.getTiles().forEach((tileMapTile) => {
                tileMapTile.tileIndex = tileIdToIndex[tileMapTile.tileId] + tileMap.vramOffset;
            });
        });
        paletteList.getPalettes().forEach((p, pIndex) => {
            optimisedTileMapList.getTileMaps().forEach((t) => {
                t.setPalette(pIndex, p.paletteId);
            });
        });

        const optimisedPaletteList = PaletteListFactory.create();
        optimisedTileMapList.getTileMaps().forEach((tileMap) => {
            tileMap.getPalettes().forEach((paletteId) => {
                if (paletteId && !optimisedPaletteList.containsPaletteById(paletteId)) {
                    const palette = paletteList.getPaletteById(paletteId);
                    optimisedPaletteList.addPalette(palette);
                }
            });
        });

        return {
            paletteList: optimisedPaletteList,
            tileSet: optimisedTileSet,
            tileMaps: optimisedTileMapList
        };
    }


    /**
     * Gets attributes relating to a given tile map.
     * @param {TileMap|null} tileMap - Tile map to provide attributes for, or null to accept default system values.
     * @param {Project|string} projectOrSystemType - Either a project or the system type that the tile map belongs to.
     * @returns {import('./../types.js').TileMapAttributes}
     */
    static getTileMapAttributes(tileMap, projectOrSystemType) {
        const systemType = projectOrSystemType instanceof Project ? projectOrSystemType.systemType : projectOrSystemType;
        if (systemType === 'smsgg' && tileMap === null) {
            return { paletteSlots: 2, transparencyIndex: null, lockedIndex: null };
        } else if (systemType === 'smsgg' && tileMap.isSprite) {
            return { paletteSlots: 1, transparencyIndex: 0, lockedIndex: null };
        } else if (systemType === 'smsgg' && !tileMap.isSprite) {
            return { paletteSlots: 2, transparencyIndex: null, lockedIndex: null };
        } else if (systemType === 'gb' && tileMap === null) {
            return { paletteSlots: 1, transparencyIndex: null, lockedIndex: null };
        } else if (systemType === 'gb' && tileMap.isSprite) {
            return { paletteSlots: 1, transparencyIndex: 0, lockedIndex: null };
        } else if (systemType === 'gb' && !tileMap.isSprite) {
            return { paletteSlots: 1, transparencyIndex: null, lockedIndex: null };
        } else if (systemType === 'nes' && tileMap === null) {
            return { paletteSlots: 4, transparencyIndex: null, lockedIndex: 0 };
        } else if (systemType === 'nes' && tileMap.isSprite) {
            return { paletteSlots: 4, transparencyIndex: 0, lockedIndex: 0 };
        } else if (systemType === 'nes' && !tileMap.isSprite) {
            return { paletteSlots: 4, transparencyIndex: null, lockedIndex: 0 };
        } throw new Error('Unknown project system type.');
    }


}

/**
 * Bundle ready for encoding.
 * @typedef {object} TileMapBundle
 * @property {PaletteList} paletteList - All used palettes.
 * @property {TileSet} tileSet - Tile set containing all used tiles.
 * @property {TileMapList} tileMaps - All tile maps.
 * @exports
 */
