import TileMapListFactory from "../factory/tileMapListFactory.js";
import PaletteList from "../models/paletteList.js";
import Tile from "../models/tile.js";
import TileMap from "../models/tileMap.js";
import TileMapList from "../models/tileMapList.js";
import TileSet from "../models/tileSet.js";
import TileUtil from "./tileUtil.js";
import TileMapListJsonSerialiser from "./../serialisers/tileMapListJsonSerialiser.js";
import TileJsonSerialiser from "./../serialisers/tileJsonSerialiser.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";

export default class TileMapUtil {


    /**
     * Turns a tile set into a tile map.
     * @param {TileSet} tileSet - Input tile set to convert to a tile map.
     * @param {number} [paletteIndex] - Palette index to use for the tiles.
     * @param {number} [vramOffset] - VRAM memory offset for the tile addresses in the tile map.
     * @param {boolean} [optimise] - Generate an optimised tile map? (remove duplicates?), default = false.
     * @returns {TileMap}
     */
    static tileSetToTileMap(tileSet, paletteIndex, vramOffset, optimise) {
        if (!paletteIndex || ![0, 1].includes(paletteIndex)) paletteIndex = 0;
        if (!vramOffset || vramOffset < 0 || vramOffset >= 255) vramOffset = 0;
        if (typeof optimise !== 'boolean') optimise = false;

        const result = new TileMap();
        result.vramOffset = vramOffset;
        result.tileWidth = tileSet.tileWidth;
        result.optimise = optimise;
        tileSet.getTiles().forEach((tile, index) => {
            result.addTile(tile, {
                tileIndex: index,
                priority: false,
                palette: paletteIndex,
                verticalFlip: false,
                horizontalFlip: false 
            });
        });

        return result;
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

        /** @type {Object.<string, string>} */
        const tileHexToId = {};
        tileSet.getTiles().forEach((tile) => {
            const asHex = TileUtil.toHex(tile);
            if (!tileHexToId[asHex]) {
                tileHexToId[asHex] = tile.tileId;
            }
        });

        /** @type {Object.<string, string>} */
        const usedTileMapIds = {};
        const optimisedTileMapList = TileMapListJsonSerialiser.deserialise(TileMapListJsonSerialiser.serialise(tileMapList));
        optimisedTileMapList.getTileMaps().forEach((tileMap) => {
            tileMap.getTiles().forEach((tileMapTile) => {
                const tile = tileSet.getTileById(tileMapTile.tileId);
                const asHex = TileUtil.toHex(tile);
                const matchedTileId = tileHexToId[asHex];
                tileMapTile.tileId = matchedTileId;
                usedTileMapIds[matchedTileId] = matchedTileId;
            });
        });

        const optimisedTileSet = TileSetFactory.create();
        optimisedTileSet.tileWidth = tileSet.tileWidth;
        Object.keys(usedTileMapIds).forEach((tileId) => {
            const tile = tileSet.getTileById(tileId);
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
                tileMapTile.tileIndex = tileIdToIndex[tileMapTile.tileId];
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
            palettes: optimisedPaletteList,
            tileSet: optimisedTileSet, 
            tileMaps: optimisedTileMapList
        };


    }


}

/**
 * Bundle ready for encoding.
 * @typedef {object} TileMapBundle
 * @property {PaletteList} palettes - All used palettes.
 * @property {TileSet} tileSet - Tile set containing all used tiles.
 * @property {TileMapList} tileMaps - All tile maps.
 * @exports
 */
