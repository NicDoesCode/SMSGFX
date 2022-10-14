import TileSet from "../models/tileSet.js";
import PaletteList from "../models/paletteList.js";
import ColourUtil from "../util/colourUtil.js";
import Project from "../models/project.js";

export default class ProjectAssemblySerialiser {


    /**
     * Exports project tile set and colour palettes as WLA-DX compatible assembly code.
     * @param {Project} project - The project to export.
     */
    static serialise(project) {
        const result = [];
        result.push(ProjectAssemblySerialiser.#exportPalettes(project.paletteList));
        result.push('');
        result.push(ProjectAssemblySerialiser.#exportTiles(project.tileSet));
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
            const sys = p.system === 'gg' ? 'Game Gear' : p.system === 'ms' ? 'Master System' : 'Unknown';
            message.push(`; Palette ${num} - ${sys}`);
            if (p.system === 'gg') {
                const colourMessage = ['.dw'];
                p.getColours().forEach(c => {
                    const colour = `$${ColourUtil.getNativeColour('gg', c.r, c.g, c.b)}`;
                    colourMessage.push(colour);
                });
                message.push(colourMessage.join(' '));
            } else if (p.system === 'ms') {
                const colourMessage = ['.db'];
                p.getColours().forEach(c => {
                    const colour = `$${ColourUtil.getNativeColour('ms', c.r, c.g, c.b)}`;
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
    static #exportTiles(tileSet) {
        const message = ['; TILES'];

        tileSet.getTiles().forEach((tile, idx, a) => {
            message.push(`; Tile index $${idx.toString(16).padStart(3, 0)}`);
            const tileMessage = ['.db'];
            for (let row = 0; row < 8; row++) {
                const encoded = [0, 0, 0, 0];
                for (let col = 0; col < 8; col++) {
                    const px = tile.readAt((row * 8) + col);
                    const shift = 7 - col;
                    encoded[0] = encoded[0] | (((px & masks[7]) >> 0) << shift);
                    encoded[1] = encoded[1] | (((px & masks[6]) >> 1) << shift);
                    encoded[2] = encoded[2] | (((px & masks[5]) >> 2) << shift);
                    encoded[3] = encoded[3] | (((px & masks[4]) >> 3) << shift);
                }
                for (let e = 0; e < encoded.length; e++) {
                    tileMessage.push('$' + encoded[e].toString(16).padStart(8, '0').substring(6).toUpperCase());
                }
            }
            message.push(tileMessage.join(' '));
        });

        return message.join('\r\n');
    }

}

const masks = [
    parseInt('10000000', 2),
    parseInt('01000000', 2),
    parseInt('00100000', 2),
    parseInt('00010000', 2),
    parseInt('00001000', 2),
    parseInt('00000100', 2),
    parseInt('00000010', 2),
    parseInt('00000001', 2)
];
