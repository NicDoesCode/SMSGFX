import TileMapFactory from "../factory/tileMapFactory.js";

export default class OptimisationUtil {


    /**
     * Takes a tile map list as an input and returns a new tile map list with optimised tile maps.
     * @param {TileMapList} tileMapList - Tile maps to optimise.
     * @param {TileSet} tileSet - Tile set that contains the tiles for the tile map.
     * @returns {TileMapList}
     */
    static generateOptimisedTileMapList(tileMapList, tileSet) {
        const tiles = tileSet.getTiles();

        /** @type {Object.<number, string>} */
        const tileIndexToHex = {};
        tileMapList.getTileMaps().forEach((map) => {
            map.getTileMapTiles().forEach((mapTile) => {
                const tile = tiles[mapTile.tileIndex];
                const tileHex = TileUtil.toHex(tile);
                if (!tileIndexToHex[mapTile.tileIndex]) {
                    tileIndexToHex[mapTile.tileIndex] = tileHex;
                }
            });
        });

        /** @type {Object.<string, number>} */
        const hexToTileIndex = {};
        const tileIndexesInOrder = Object.keys(tileIndexToHex).sort((a, b) => a > b ? 1 : -1);
        tileIndexesInOrder.forEach((idx) => {
            const tileHex = tileIndexToHex[idx];
            if (!hexToTileIndex[tileHex]) {
                hexToTileIndex[tileHex] = idx;
            }
        });

        /** @type {Object.<number, string>} */
        const uniqueTiles = {};
        // TODO 

        const result = TileMapListFactory.create();
        tileMapList.getTileMaps().foreach((map) => {
            if (map.optimise) {
                const optimisedTiles = map.getTileMapTiles().map((tile) => {
                    const tileHex = tileIndexToHex[tile.tileIndex];
                    return TileMapTileFactory.create({
                        tileIndex: hexToTileIndex[tileHex],
                        priority: tile.priority,
                        palette: tile.palette,
                        horizontalFlip: tile.horizontalFlip,
                        verticalFlip: tile.verticalFlip
                    });
                });
                result.addTileMap(TileMapFactory.create({
                    tileMapId: map.tileMapId,
                    title: map.title,
                    columns: map.columns,
                    rows: map.rows,
                    optimise: map.optimise,
                    vramOffset: map.vramOffset,
                    tiles: optimisedTiles
                }));
            } else {
                result.addTileMap(map);
            }
        });
        return result;
    }


}

