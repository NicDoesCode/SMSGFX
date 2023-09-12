import TileSet from "../../models/tileSet.js";
import PaletteList from "../../models/paletteList.js";
import ColourUtil from "../../util/colourUtil.js";
import Project from "../../models/project.js";
import TileMapUtil from "../../util/tileMapUtil.js";
import ProjectAssemblySerialiser from "../projectAssemblySerialiser.js";
import SmsggTileSetBinarySerialiser from "./smsggTileSetBinarySerialiser.js";
import SmsggTileMapTileBinarySerialiser from "./smsggTileMapTileBinarySerialiser.js";
import TileMapList from "../../models/tileMapList.js";
import TileMapListFactory from "../../factory/tileMapListFactory.js";
import TileMapFactory from "../../factory/tileMapFactory.js";
import SystemUtil from "../../util/systemUtil.js";

export default class SmsggAssemblySerialiser extends ProjectAssemblySerialiser {


    /**
     * Exports project tile set and colour palettes as WLA-DX compatible assembly code.
     * @param {Project} project - The project to export.
     * @param {import("../projectAssemblySerialiser.js").ProjectAssemblySerialisationOptions?} options - Serialisation options.
     */
    static serialise(project, options) {

        const tileMapList = TileMapListFactory.create();
        if (options.tileMapIds !== null && Array.isArray(options.tileMapIds)) {
            options.tileMapIds.forEach((tileMapId) => {
                const tileMap = project.tileMapList.getTileMapById(tileMapId);
                if (tileMap) {
                    const tileMapClone = TileMapFactory.clone(tileMap);
                    if (options.optimiseMode === 'always')
                        tileMapClone.optimise = true;
                    else if (options.optimiseMode === 'never')
                        tileMapClone.optimise = false;
                    tileMapClone.vramOffset = options.vramOffset;
                    tileMapList.addTileMap(tileMapClone);
                }
            });
        }

        const capabilities = SystemUtil.getSystemCapabilities(project.systemType);
        const bundle = TileMapUtil.createOptimisedBundle(tileMapList, project.tileSet, project.paletteList, capabilities);

        const result = ['; SEGA MASTER SYSTEM AND SEGA GAME GEAR ASSEMBLY FOR WLA-DX'];
        result.push('');

        if (options.exportPalettes) {
            result.push(SmsggAssemblySerialiser.#exportPalettes(bundle.paletteList));
            result.push('');
        }

        if (options.exportTileSet) {
            result.push(SmsggAssemblySerialiser.#exportTileSet(bundle.tileSet));
            result.push('');
        }

        if (options.exportTileMaps) {
            result.push(SmsggAssemblySerialiser.#exportTileMapList(bundle.tileMaps));
            result.push('');
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
     */
    static #exportTileSet(tileSet) {
        const tileSetBinarySerialiser = SmsggTileSetBinarySerialiser;
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
     * Exports tile map as WLA-DX compatible assembly code.
     * @param {TileMapList} tileMapList - Tile map list to export.
     */
    static #exportTileMapList(tileMapList) {
        const message = [`; TILE MAPS`];

        tileMapList.getTileMaps().forEach((tileMap, tileMapIdx) => {
            message.push(`; Tile map ${tileMapIdx.toString().padStart(2, '0')} - ${(tileMap.title ?? '(Not named)')}`);

            for (let rowIdx = 0; rowIdx < tileMap.rowCount; rowIdx++) {
                const row = tileMap.getTileMapRow(rowIdx);
                const rowMessage = ['.dw'];
                for (let colIdx = 0; colIdx < row.length; colIdx++) {
                    const tile = row[colIdx];
                    const tileBinary = SmsggTileMapTileBinarySerialiser.serialise(tile);
                    rowMessage.push('$' + tileBinary.toString(16).padStart(4, '0').toUpperCase());
                }
                message.push(rowMessage.join(' '));
            }

            message.push();
        });

        return message.join('\r\n');
    }


}
