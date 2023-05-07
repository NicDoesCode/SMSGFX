import TileSet from "../../models/tileSet.js";
import PaletteList from "../../models/paletteList.js";
import ColourUtil from "../../util/colourUtil.js";
import Project from "../../models/project.js";
import TileMapUtil from "../../util/tileMapUtil.js";
import TileMap from "../../models/tileMap.js";
import SerialisationUtil from "../../util/serialisationUtil.js";
import ProjectAssemblySerialiser from "../projectAssemblySerialiser.js";

export default class SmsggAssemblySerialiser extends ProjectAssemblySerialiser {


    /**
     * Exports project tile set and colour palettes as WLA-DX compatible assembly code.
     * @param {Project} project - The project to export.
     * @param {import("../projectAssemblySerialiser.js").ProjectAssemblySerialisationOptions?} options - Serialisation options.
     */
    static serialise(project, options) {
        const result = ['; SEGA MASTER SYSTEM AND SEGA GAME GEAR ASSEMBLY FOR WLA-DX'];
        result.push('');

        const paletteIndex = options?.paletteIndex ?? 0;
        const memOffset = options?.tileMapMemoryOffset ?? 0;
        const tileMap = TileMapUtil.tileSetToTileMap(project.tileSet, paletteIndex, memOffset);

        result.push(SmsggAssemblySerialiser.#exportPalettes(project.paletteList));
        result.push('');

        result.push(SmsggAssemblySerialiser.#exportTileSet(tileMap.toTileSet(), project.systemType));
        result.push('');

        result.push(SmsggAssemblySerialiser.#exportTileMap(tileMap, paletteIndex, memOffset, project.systemType));
        result.push('');

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
            const sys = p.system === 'gg' ? 'Sega Game Gear' : p.system === 'ms' ? 'Sega Master System' : 'Unknown';
            const title = p.title ? ` - ${p.title}` : '';
            message.push(`; Palette ${num} - ${sys}${title}`);
            if (p.system === 'gg') {
                const colourMessage = ['.dw'];
                p.getColours().forEach(c => {
                    const colour = `$${ColourUtil.encodeColourInNativeFormat('gg', c.r, c.g, c.b, 'hex')}`;
                    colourMessage.push(colour);
                });
                message.push(colourMessage.join(' '));
            } else if (p.system === 'ms') {
                const colourMessage = ['.db'];
                p.getColours().forEach(c => {
                    const colour = `$${ColourUtil.encodeColourInNativeFormat('ms', c.r, c.g, c.b, 'hex')}`;
                    colourMessage.push(colour);
                });
                message.push(colourMessage.join(' '));
            }
        });

        return message.join('\r\n');
    }

    /**
     * Exports tile set as WLA-DX compatible assembly code.
     * @param {TileSet} tileSet - Tile set to export.
     * @param {string} systemType - Target system type, either 'smsgg' or 'gb'.
     */
    static #exportTileSet(tileSet, systemType) {
        const tileSetBinarySerialiser = SerialisationUtil.getTileSetBinarySerialiser(systemType);
        const message = ['; TILES'];
        const encoded = tileSetBinarySerialiser.serialise(tileSet);
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
     * @param {TileMap} tileMap - Tile map to export.
     * @param {number} paletteIndex - Palette index to use for the tiles.
     * @param {number} memoryOffset - VRAM memory offset for the tile addresses in the tile map.
     * @param {string} systemType - Target system type, either 'smsgg' or 'gb'.
     */
    static #exportTileMap(tileMap, paletteIndex, memoryOffset, systemType) {
        const serialiser = SerialisationUtil.getTileMapBinarySerialiser(systemType);
        const message = ['; TILE MAP FROM TILE SET'];
        const encoded = serialiser.serialise(tileMap);
        for (let i = 0; i < encoded.length; i += tileMap.tileWidth) {
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
