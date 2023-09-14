import TileMapListFactory from "../factory/tileMapListFactory.js";
import PaletteList from "../models/paletteList.js";
import TileMap from "../models/tileMap.js";
import TileMapList from "../models/tileMapList.js";
import TileSet from "../models/tileSet.js";
import TileUtil from "./tileUtil.js";
import SystemUtil from "./systemUtil.js";
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
        const capabilities = SystemUtil.getGraphicsCapabilities(project.systemType);
        return TileMapUtil.createOptimisedBundle(project.tileMapList, project.tileSet, project.paletteList, capabilities);
    }

    /**
     * Returns an optimised bundle of tiles, tile maps and palettes.
     * @param {TileMap | TileMapList} tileMapOrList - Tile map or list of tile maps.
     * @param {TileSet} tileSet - Tile set containing the source tiles.
     * @param {PaletteList} paletteList - List of palettes.
     * @param {import("./systemUtil.js").GraphicsCapabilities} capabilities - System capabilities.
     * @returns {TileMapBundle}
     */
    static createOptimisedBundle(tileMapOrList, tileSet, paletteList, capabilities) {
        /** @type {TileMapList} */capabilities
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

        const optimised = createOptimisedTileMapsAndTileSet(tileMapList.getTileMaps(), tileSet, capabilities);

        // Set the tile index in the tile maps
        const tileIdToIndex = {};
        optimised.tileSet.getTiles().forEach((tile, index) => tileIdToIndex[tile.tileId] = index);
        optimised.tileMapList.getTileMaps().forEach((tileMap) => {
            tileMap.getTiles().forEach((tileMapTile) => {
                tileMapTile.tileIndex = tileIdToIndex[tileMapTile.tileId] + tileMap.vramOffset;
            });
        });

        // Create optimised list of palettes
        const optimisedPaletteList = PaletteListFactory.create();
        optimised.tileMapList.getTileMaps().forEach((tileMap) => {
            const capability = tileMap.isSprite ? capabilities.sprite : capabilities.background;
            for (let i = 0; i < capability.totalPaletteSlots; i++) {
                const palette = paletteList.getPaletteById(tileMap.getPalette(i));
                if (palette && !optimisedPaletteList.getPaletteById(palette.paletteId)) {
                    optimisedPaletteList.addPalette(palette);
                }
            }
        });

        return {
            paletteList: optimisedPaletteList,
            tileSet: optimised.tileSet,
            tileMaps: optimised.tileMapList
        };
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


/**
 * @param {TileMap[]} tileMaps
 * @param {TileSet} tileSet
 * @param {import("./systemUtil.js").GraphicsCapabilities} capabilities 
 * @returns {{tileMapList: TileMapList, tileSet: TileSet}}
 */
function createOptimisedTileMapsAndTileSet(tileMaps, tileSet, capabilities) {

    const blankTile = TileFactory.create({ defaultColourIndex: 0 });

    /** @type {Object.<string, { tileId: string, horizontalFlip: boolean, verticalFlip: boolean }>} */
    const usedTiles = {};

    // CHECK EACH TILE MAP, IF THERE IS ANY TILE THAT DOESN'T CONFORM TO CAPABILITIES, MAKE SURE IT DOES CONFIRM

    const conformingTileSet = TileSetFactory.clone(tileSet);
    const conformingTileMaps = tileMaps.map((tileMap) => {

        const capability = tileMap.isSprite ? capabilities.sprite : capabilities.background;

        const conformingTileMap = TileMapFactory.clone(tileMap);
        conformingTileMap.getTiles().forEach((tileMapTile) => {

            // Get matched tile set tile or blank if not found
            const tile = tileSet.getTileById(tileMapTile.tileId) ?? blankTile;

            if ((tileMapTile.horizontalFlip && tileMapTile.verticalFlip) && (!capability.horizontalFlip || !capability.verticalFlip)) {
                // Tile is both horizontal and vertical flipped, but capabilities don't allow
                const conformingTile = TileUtil.createHorizontallyMirroredClone(TileUtil.createVerticallyMirroredClone(tile));
                conformingTile.tileId += '(flipHV)';
                tileMapTile.tileId = conformingTile.tileId;
                tileMapTile.horizontalFlip = false;
                tileMapTile.verticalFlip = false;
                conformingTileSet.addTile(conformingTile);
            } else if (tileMapTile.horizontalFlip && !capability.horizontalFlip) {
                // Tile is horizontal flipped, but capabilities don't allow
                const conformingTile = TileUtil.createHorizontallyMirroredClone(tile);
                conformingTile.tileId += '(flipH)';
                tileMapTile.tileId = conformingTile.tileId;
                tileMapTile.horizontalFlip = false;
                conformingTileSet.addTile(conformingTile);
            } else if (tileMapTile.verticalFlip && !capability.verticalFlip) {
                // Tile is horizontal flipped, but capabilities don't allow
                const conformingTile = TileUtil.createVerticallyMirroredClone(tile);
                conformingTile.tileId += '(flipV)';
                tileMapTile.tileId = conformingTile.tileId;
                tileMapTile.verticalFlip = false;
                conformingTileSet.addTile(conformingTile);
            }

        });
        return conformingTileMap;

    });

    // ITERATE TILE MAPS, BUILD A MINIMAL LIST OF USED TILES AND RETURN OPTIMISED TILE MAPS THAT USE THAT LIST

    const optimisedTileMaps = conformingTileMaps.map((tileMap) => {

        const capability = tileMap.isSprite ? capabilities.sprite : capabilities.background;

        const optimisedTileMap = TileMapFactory.clone(tileMap);
        optimisedTileMap.getTiles().forEach((tileMapTile) => {

            // Get matched tile set tile or blank if not found
            const tile = conformingTileSet.getTileById(tileMapTile.tileId) ?? blankTile;

            // Apply transformations to the tile
            let transformedTile = TileFactory.clone(tile);
            if (tileMapTile.horizontalFlip) transformedTile = TileUtil.createHorizontallyMirroredClone(transformedTile);
            if (tileMapTile.verticalFlip) transformedTile = TileUtil.createVerticallyMirroredClone(transformedTile);
            const transformedTileHex = TileUtil.toHex(transformedTile);

            // Check for tile in used tiles collection
            const usedTile = usedTiles[transformedTileHex];
            if (usedTile) {
                // Appears in used tiles, set tile map tile accordingly
                tileMapTile.tileId = usedTile.tileId;
                tileMapTile.horizontalFlip = usedTile.horizontalFlip;
                tileMapTile.verticalFlip = usedTile.verticalFlip;
            } else {
                // Doesn't appear in used tiles, add this tile into used tiles as well as HEX for all it's supported variations
                const hex = TileUtil.toHex(tile);
                usedTiles[hex] = { tileId: tileMapTile.tileId, horizontalFlip: false, verticalFlip: false };
                const hexHV = (capability.horizontalFlip && capability.verticalFlip) ? TileUtil.toHex(TileUtil.createHorizontallyMirroredClone(TileUtil.createVerticallyMirroredClone(tile))) : null;
                if (!usedTiles[hexHV] && capability.horizontalFlip && capability.verticalFlip) usedTiles[hexHV] = { tileId: tileMapTile.tileId, hFlip: true, vFlip: true };
                const hexH = (capability.horizontalFlip) ? TileUtil.toHex(TileUtil.createHorizontallyMirroredClone(tile)) : null;
                if (!usedTiles[hexH] && capability.horizontalFlip) usedTiles[hexH] = { tileId: tileMapTile.tileId, hFlip: true, vFlip: false };
                const hexV = (capability.verticalFlip) ? TileUtil.toHex(TileUtil.createVerticallyMirroredClone(tile)) : null;
                if (!usedTiles[hexV] && capability.verticalFlip) usedTiles[hexV] = { tileId: tileMapTile.tileId, hFlip: false, vFlip: true };
            }

        });
        return optimisedTileMap;

    });

    // GET OPTIMISED TILE MAP

    const usedTileIdDictionary = {};
    Object.values(usedTiles).forEach((usedTile) => usedTileIdDictionary[usedTile.tileId] = usedTile.tileId);

    // Create the optimised tile set with only the used tiles
    const optimisedTileSet = TileSetFactory.create({ tileWidth: conformingTileSet.tileWidth });
    conformingTileSet.getTiles().forEach((tile) => {
        if (tile.alwaysKeep || usedTileIdDictionary[tile.tileId]) {
            const clonedTile = TileFactory.clone(tile);
            optimisedTileSet.addTile(clonedTile);
        }
    });
    if (usedTileIdDictionary[blankTile.tileId] && !conformingTileSet.getTileById(blankTile)) {
        optimisedTileSet.addTile(blankTile);
    }

    // RETURN OPTIMISED TILE MAPS AND TILE SET

    return {
        tileMapList: TileMapListFactory.create(optimisedTileMaps),
        tileSet: optimisedTileSet
    }
}
