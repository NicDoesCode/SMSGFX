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
        return this.#exportPalettes(palettes);
    }

    /**
     * 
     * @param {PaletteList} palettes 
     */
    #exportPalettes(palettes) {
        const message = [];

        message.push('; PALETTES');
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
        return `$${b}${g}${r}`;
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
        const result = (b << 4 | g << 2 | r).toString(16).padStart(4,'0').substring(2);
        return '$' + result;
    }

}
