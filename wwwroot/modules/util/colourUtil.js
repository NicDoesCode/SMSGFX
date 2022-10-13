/** @type string[] */
const standardColours = ['#000000', '#000000', '#00AA00', '#00FF00', '#000055', '#0000FF', '#550000', '#00FFFF', '#AA0000', '#FF0000', '#555500', '#FFFF00', '#005500', '#FF00FF', '#555555', '#FFFFFF'];
const hexRegex = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

export default class ColourUtil {

    static rgbFromHex(hex) {
        if (hex && hexRegex.test(hex)) {
            const match = hexRegex.exec(hex);
            return {
                r: parseInt(match[1], 16),
                g: parseInt(match[2], 16),
                b: parseInt(match[3], 16),
                hex: hex
            };
        } else throw new Error(`Invalid hex value "${hex}".`);
    }

    static getNativeColourFromHex(system, hex) {
        const rgb = this.rgbFromHex(hex);
        return this.getNativeColour(system, rgb.r, rgb.g, rgb.b);
    }

    static getNativeColour(system, r, g, b) {
        if (system === 'ms') {
            r = Math.round(3 / 255 * r);
            g = Math.round(3 / 255 * g) << 2;
            b = Math.round(3 / 255 * b) << 4;
            return (r | g | b).toString(16).padStart(8, '0');
        } else if (system === 'gg') {
            r = Math.round(15 / 255 * r);
            g = Math.round(15 / 255 * g) << 4;
            b = Math.round(15 / 255 * b) << 8;
            return (r | g | b).toString(16).padStart(16, '0');
        }
    }

    static paletteColourFromHex(index, system, hex) {
        const rgb = this.rgbFromHex(hex);
        rgb.index = index;
        return {
            index: index,
            nativeColour: this.getNativeColour(system, rgb.r, rgb.g, rgb.b),
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
            hex: hex
        }
    }

}

/**
 * @typedef PaletteColour
 * @type {object}
 * @property {number} index - Colour slot (0 to 15).
 * @property {string} nativeColour - The HEX encoded native colour.
 * @property {string} hex - Colour encoded in HEX format.
 * @property {number} r - Red value.
 * @property {number} g - Green value.
 * @property {number} b - Blue value.
 */
