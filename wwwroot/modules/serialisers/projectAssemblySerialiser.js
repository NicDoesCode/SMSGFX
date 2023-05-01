import TileSet from "../models/tileSet.js";
import PaletteList from "../models/paletteList.js";
import ColourUtil from "../util/colourUtil.js";
import Project from "../models/project.js";
import TileSetBinarySerialiser from "./tileSetBinarySerialiser.js";
import TileMapBinarySerialiser from "./tileMapBinarySerialiser.js";
import TileMapUtil from "../util/tileMapUtil.js";

export default class ProjectAssemblySerialiser {


    /**
     * Exports project tile set and colour palettes as WLA-DX compatible assembly code.
     * @param {Project} project - The project to export.
     * @param {ProjectAssemblySerialisationOptions?} options - Serialisation options.
     */
    static serialise(project, options) {
        const result = [];
        result.push(ProjectAssemblySerialiser.#exportPalettes(project.paletteList));
        result.push('');
        result.push(ProjectAssemblySerialiser.#exportTiles(project.tileSet));
        if (options?.generateTileMapFromTileSet) {
            const paletteIndex = options?.paletteIndex ?? 0;
            const memOffset = options?.tileMapMemoryOffset ?? 0;
            result.push('');
            result.push(ProjectAssemblySerialiser.#exportTileSetTileMap(project.tileSet, paletteIndex, memOffset));
        }
        return result.join('\r\n');
    }

    /**
     * Exports colour palettes as WLA-DX compatible assembly code.
     * @param {PaletteList} palettes - Colour palettes to export.
     */
    static #exportPalettes(palettes) {
        const message = ['; PALETTES'];

        palettes.getPalettes().forEach((p, i, a) => {
            const num = i.toString().padStart(2, '0');
            const sys = p.system === 'gg' ? 'Sega Game Gear' : p.system === 'ms' ? 'Sega Master System' : p.system === 'gb' ? 'Nintendo Game Boy' : 'Unknown';
            const title = p.title ? ` - ${p.title}` : '';
            message.push(`; Palette ${num} - ${sys}${title}`);
            if (p.system === 'gg') {
                const colourMessage = ['.dw'];
                p.getColours().forEach(c => {
                    const colour = `$${ColourUtil.encodeToNativeString('gg', c.r, c.g, c.b, 'hex')}`;
                    colourMessage.push(colour);
                });
                message.push(colourMessage.join(' '));
            } else if (p.system === 'ms') {
                const colourMessage = ['.db'];
                p.getColours().forEach(c => {
                    const colour = `$${ColourUtil.encodeToNativeString('ms', c.r, c.g, c.b, 'hex')}`;
                    colourMessage.push(colour);
                });
                message.push(colourMessage.join(' '));
            } else if (p.system === 'gb') {
                const gbPalette = p.getColours().map(c => {
                    return ColourUtil.encodeToNativeString('gb', c.r, c.g, c.b, 'binary');
                }).join('');
                message.push(`.db %${gbPalette}`);
            }
        });

        return message.join('\r\n');
    }

    /**
     * Exports tile set as WLA-DX compatible assembly code.
     * @param {TileSet} tileSet - Tile set to export.
     */
    static #exportTiles(tileSet) {
        const message = ['; TILES'];
        const encoded = TileSetBinarySerialiser.serialise(tileSet);
        for (let i = 0; i < tileSet.length; i++) {
            message.push(`; Tile index $${i.toString(16).padStart(3, 0)}`);
            const tileMessage = ['.db'];
            const tileStartIndex = i * 32;
            for (let t = tileStartIndex; t < tileStartIndex + 32; t += 4) {
                const bytes = encoded.slice(t, t + 4);
                for (let b = 0; b < bytes.length; b++) {
                    tileMessage.push('$' + bytes[b].toString(16).padStart(8, '0').substring(6).toUpperCase());
                }
            }
            message.push(tileMessage.join(' '));
        }
        return message.join('\r\n');
    }

    /**
     * Exports tile set as WLA-DX compatible assembly code.
     * @param {TileSet} tileMap - Tile map to export.
     * @param {number} paletteIndex - Palette index to use for the tiles.
     * @param {number} memoryOffset - VRAM memory offset for the tile addresses in the tile map.
     */
    static #exportTileSetTileMap(tileSet, paletteIndex, memoryOffset) {
        const message = ['; TILE MAP FROM TILE SET'];
        const tileMap = TileMapUtil.tileSetToTileMap(tileSet, paletteIndex, memoryOffset);
        const encoded = TileMapBinarySerialiser.serialise(tileMap);
        for (let i = 0; i < encoded.length; i += tileSet.tileWidth) {
            message.push(`; Tile map row ${(i / tileMap.tileWidth)}`);
            const tileMessage = ['.dw'];
            const stopAt = Math.min(i + tileMap.tileWidth, encoded.length);
            for (let t = i; t < stopAt; t++) {
                tileMessage.push('$' + encoded[t].toString(16).padStart(4, '0').toUpperCase());
            }
            message.push(tileMessage.join(' '));
        }
        return message.join('\r\n');
    }

}

/**
 * Project assembly serialisation options.
 * @typedef {object} ProjectAssemblySerialisationOptions
 * @property {boolean?} generateTileMapFromTileSet - When true a tile map is generated from the tile set.
 * @property {number?} paletteIndex - Palette index to use for the tiles.
 * @property {number?} tileMapMemoryOffset - Memory offset of the tile map.
 * @exports
 */

