import TileSet from "../../models/tileSet.js";
import PaletteList from "../../models/paletteList.js";
import ColourUtil from "../../util/colourUtil.js";
import Project from "../../models/project.js";
import TileMapUtil from "../../util/tileMapUtil.js";
import TileMap from "../../models/tileMap.js";
import SerialisationUtil from "../../util/serialisationUtil.js";
import ProjectAssemblySerialiser from "../projectAssemblySerialiser.js";

export default class NesAssemblySerialiser extends ProjectAssemblySerialiser {


    /**
     * Exports project tile set and colour palettes as WLA-DX compatible assembly code.
     * @param {Project} project - The project to export.
     * @param {import("../projectAssemblySerialiser.js").ProjectAssemblySerialisationOptions?} options - Serialisation options.
     */
    static serialise(project, options) {
        const result = ['; NINTENDO ENTERTAINMENT SYSTEM ASSEMBLY FOR WLA-DX'];
        result.push('');

        const paletteIndex = options?.paletteIndex ?? 0;
        const memOffset = options?.tileMapMemoryOffset ?? 0;
        const tileMap = TileMapUtil.tileSetToTileMap(project.tileSet, paletteIndex, memOffset);

        result.push(NesAssemblySerialiser.#exportPalettes(project.paletteList));
        result.push('');

        result.push(NesAssemblySerialiser.#exportTileSet(tileMap.toTileSet(), project.systemType));
        result.push('');

        result.push(NesAssemblySerialiser.#exportNameTable(tileMap, paletteIndex, memOffset, project.systemType));
        result.push('');

        result.push(NesAssemblySerialiser.#exportBackgroundAttributeTable(tileMap, paletteIndex, memOffset, project.systemType));
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
            const sys = p.system;
            const title = p.title ? ` - ${p.title}` : '';
            message.push(`; Palette ${num} - ${sys}${title}`);
            const colourMessage = ['.db'];
            p.getColours().forEach(c => {
                const colour = `$${ColourUtil.encodeColourInNativeFormat('nes', c.r, c.g, c.b, 'hex')}`;
                colourMessage.push(colour);
            });
            message.push(colourMessage.join(' '));
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
            const tileStartIndex = i * 16;
            for (let t = tileStartIndex; t < tileStartIndex + 16; t += 2) {
                const bytes = encoded.slice(t, t + 2);
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
    static #exportNameTable(tileMap, paletteIndex, memoryOffset, systemType) {
        const serialiser = SerialisationUtil.getTileMapBinarySerialiser(systemType);
        const message = ['; NAME TABLE'];
        const encoded = serialiser.serialise(tileMap);
        for (let i = 0; i < encoded.length; i += tileMap.tileWidth) {
            message.push(`; Name table row ${(i / tileMap.tileWidth)}`);
            const tileMessage = ['.db'];
            const stopAt = Math.min(i + tileMap.tileWidth, encoded.length);
            for (let t = i; t < stopAt; t++) {
                tileMessage.push('$' + encoded[t].toString(16).padStart(2, '0').toUpperCase());
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
    static #exportBackgroundAttributeTable(tileMap, paletteIndex, memoryOffset, systemType) {
        const serialiser = SerialisationUtil.getTileAttributeBinarySerialiser(systemType);
        const message = [];
        message.push('; BACKGROUND ATTRIBUTE TABLE');
        const encoded = serialiser.serialise(tileMap);
        const attrWidth = (tileMap.tileWidth + (tileMap.tileWidth % 2)) / 2;
        for (let i = 0; i < encoded.length; i += attrWidth) {
            message.push(`; Attribute table row ${(i / attrWidth)}`);
            const tileMessage = ['.db'];
            const stopAt = Math.min(i + attrWidth, encoded.length);
            for (let t = i; t < stopAt; t++) {
                tileMessage.push('$' + encoded[t].toString(16).padStart(2, '0').toUpperCase());
            }
            message.push(tileMessage.join(' '));
        }
        return message.join('\r\n');
    }

}

