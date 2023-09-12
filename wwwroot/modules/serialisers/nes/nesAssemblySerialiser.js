import TileSet from "../../models/tileSet.js";
import PaletteList from "../../models/paletteList.js";
import ColourUtil from "../../util/colourUtil.js";
import Project from "../../models/project.js";
import TileMapUtil from "../../util/tileMapUtil.js";
import TileMapList from "../../models/tileMapList.js";
import ProjectAssemblySerialiser from "../projectAssemblySerialiser.js";
import NesTileSetBinarySerialiser from "./nesTileSetBinarySerialiser.js";
import NesTileMapTileBinarySerialiser from "./nesTileMapTileBinarySerialiser.js";
import NesTileAttributeBinarySerialiser from "./nesTileAttributeBinarySerialiser.js";
import TileMapListFactory from "../../factory/tileMapListFactory.js";
import TileMapFactory from "../../factory/tileMapFactory.js";
import SystemUtil from "../../util/systemUtil.js";

export default class NesAssemblySerialiser extends ProjectAssemblySerialiser {


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

        const result = ['; NINTENDO ENTERTAINMENT SYSTEM ASSEMBLY FOR WLA-DX'];
        result.push('');

        if (options.exportPalettes) {
            result.push(NesAssemblySerialiser.#exportPalettes(bundle.paletteList));
            result.push('');
        }

        if (options.exportTileSet) {
            result.push(NesAssemblySerialiser.#exportTileSet(bundle.tileSet));
            result.push('');
        }

        if (options.exportTileMaps) {
            result.push(NesAssemblySerialiser.#exportTileMapList(bundle.tileMaps));
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
     */
    static #exportTileSet(tileSet) {
        const serialiser = NesTileSetBinarySerialiser;
        const message = ['; TILES'];
        const encoded = serialiser.serialise(tileSet);
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
     * Exports tile map as WLA-DX compatible assembly code.
     * @param {TileMapList} tileMapList - Tile map list to export.
     */
    static #exportTileMapList(tileMapList) {
        const message = [`; TILE MAPS`];

        tileMapList.getTileMaps().forEach((tileMap, tileMapIdx) => {

            message.push(`; Name table ${tileMapIdx.toString().padStart(2, '0')} - ${(tileMap.title ?? '(Not named)')}`);
            for (let rowIdx = 0; rowIdx < tileMap.rowCount; rowIdx++) {
                const row = tileMap.getTileMapRow(rowIdx);
                const rowMessage = ['.db'];
                for (let colIdx = 0; colIdx < row.length; colIdx++) {
                    const tile = row[colIdx];
                    const tileBinary = NesTileMapTileBinarySerialiser.serialise(tile);
                    rowMessage.push('$' + tileBinary.toString(16).padStart(2, '0').toUpperCase());
                }
                message.push(rowMessage.join(' '));
            }

            message.push(`; Attribute table ${tileMapIdx.toString().padStart(2, '0')} - ${(tileMap.title ?? '(Not named)')}`);
            const encoded = NesTileAttributeBinarySerialiser.serialise(tileMap);
            const attrWidth = (tileMap.columnCount + (tileMap.columnCount % 2)) / 2;
            for (let i = 0; i < encoded.length; i += attrWidth) {
                // message.push(`; Attribute table row ${(i / attrWidth)}`);
                const attrMessage = ['.db'];
                const stopAt = Math.min(i + attrWidth, encoded.length);
                for (let t = i; t < stopAt; t++) {
                    attrMessage.push('$' + encoded[t].toString(16).padStart(2, '0').toUpperCase());
                }
                message.push(attrMessage.join(' '));
            }

            message.push();
        });

        return message.join('\r\n');
    }


}

