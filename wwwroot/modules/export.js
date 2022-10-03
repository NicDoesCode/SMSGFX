import TileSet from "./tileSet.js";
import PaletteList from "./paletteList.js";

export default class Export {

    constructor() {
    }

    /**
     * 
     * @param {TileSet} tileSet 
     * @param {PaletteList} palettes 
     */
    getExportData(tileSet, palettes) {
        const result = [];
        result.push(this.#exportPalettes(palettes));
        result.push('');
        result.push(this.#exportTiles(tileSet));
        return result.join('\r\n');
    }

    /**
     * 
     * @param {PaletteList} palettes 
     */
    #exportPalettes(palettes) {
        const message = ['; PALETTES'];

        palettes.getPalettes().forEach((p, i, a) => {
            const num = i.toString().padStart(2, '0');
            const sys = p.system === 'gg' ? 'Game Gear' : p.system === 'ms' ? 'Master System' : 'Unknown';
            message.push(`; Palette ${num} - ${sys}`);
            if (p.system === 'gg') {
                const colourMessage = ['.dw'];
                p.colours.forEach(c => {
                    colourMessage.push(this.#ggColour(c));
                });
                message.push(colourMessage.join(' '));
            } else if (p.system === 'ms') {
                const colourMessage = ['.db'];
                p.colours.forEach(c => {
                    colourMessage.push(this.#msColour(c));
                });
                message.push(colourMessage.join(' '));
            }
        });

        return message.join('\r\n');
    }

    /**
     * 
     * @param {import("./palette.js").PaletteColour} value 
     * @returns 
     */
    #ggColour(value) {
        const r = Math.floor(value.r / 16).toString(16);
        const g = Math.floor(value.g / 16).toString(16);
        const b = Math.floor(value.b / 16).toString(16);
        return `$${b}${g}${r}`.toUpperCase();
    }

    /**
     * 
     * @param {import("./palette.js").PaletteColour} value 
     * @returns 
     */
    #msColour(value) {
        const r = Math.floor(value.r / 64);
        const g = Math.floor(value.g / 64);
        const b = Math.floor(value.b / 64);
        const result = (b << 4 | g << 2 | r).toString(16).padStart(4, '0').substring(2);
        return '$' + result.toUpperCase();
    }

    /**
     * 
     * @param {TileSet} tileSet 
     */
    #exportTiles(tileSet) {
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
