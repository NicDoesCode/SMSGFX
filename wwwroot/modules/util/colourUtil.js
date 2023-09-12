const hexRegex = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;


export default class ColourUtil {


    /**
     * Gets the amount of colours per palette for a system.
     * @param {string} system - System to get the palette colour count for.
     * @returns {number}
     */
    static getColoursPerPalette(system) {
        switch (system) {
            case 'smsgg':
            case 'ms':
            case 'gg':
                return 16;
            case 'gb':
                return 4;
            case 'nes':
                return 4;
            default:
                return 0;
        }
    }


    /**
     * Converts an RGB value to a hexadecimal colour code.
     * @param {number} r - Red value.
     * @param {number} g - Green value.
     * @param {number} b - Blue value.
     * @returns {string}
     */
    static toHex(r, g, b) {
        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');
        return `#${hexR}${hexG}${hexB}`;
    }

    /**
     * Extracts RGB colour values from a hexadecimal colour code.
     * @param {string} hex - Hexadecimal colour code.
     * @returns {ColourInformation}
     */
    static rgbFromHex(hex) {
        if (hex && hexRegex.test(hex)) {
            const match = hexRegex.exec(hex);
            return {
                r: parseInt(match[1], 16),
                g: parseInt(match[2], 16),
                b: parseInt(match[3], 16)
            };
        } else throw new Error(`Invalid hex value "${hex}".`);
    }

    /**
     * Converts a hexadecimal colour to the native binary format for the given system.
     * @param {string} system - Target system, either 'ms', 'gg', 'nes' or 'gb'.
     * @param {string} hex - Hexadecimal colour code.
     * @returns {string}
     */
    static getClosestNativeColourFromHex(system, hex) {
        const rgb = this.rgbFromHex(hex);
        const closestColour = this.getClosestNativeColour(system, rgb.r, rgb.g, rgb.b);
        return this.toHex(closestColour.r, closestColour.g, closestColour.b);
    }

    /**
     * Converts a given RGB value to a web safe hexadecimal approximation to the closest native system colour.
     * @param {string} system - Target system, either 'ms', 'gg', 'nes' or 'gb'.
     * @param {number} r - Red value, 0 to 255.
     * @param {number} g - Green value, 0 to 255.
     * @param {number} b - Blue value, 0 to 255.
     * @returns {ColourInformation}
     */
    static getClosestNativeColour(system, r, g, b) {
        if (r < 0 || r > 255) throw new Error('Invalid value for red.');
        if (g < 0 || g > 255) throw new Error('Invalid value for green.');
        if (b < 0 || b > 255) throw new Error('Invalid value for blue.');
        if (system === 'ms') {
            r = Math.round(3 / 255 * r) * 85;
            g = Math.round(3 / 255 * g) * 85;
            b = Math.round(3 / 255 * b) * 85;
            return { r, g, b };
        } else if (system === 'gg') {
            r = Math.round(15 / 255 * r) * 17;
            g = Math.round(15 / 255 * g) * 17;
            b = Math.round(15 / 255 * b) * 17;
            return { r, g, b };
        } else if (system === 'nes') {
            return getNearestNESColour(r, g, b);
        } else if (system === 'gb') {
            const colour = Math.round(getNearestGBColour((r + g + b) / 3));
            return { r: colour, g: colour, b: colour };
        } else throw new Error('System was not valid.');

    }

    /**
     * Converts a RGB value to a native colour value as a byte.
     * @param {string} system - System to get the native colour for, either 'ms', 'gg' or 'gb'.
     * @param {number} r - Red value.
     * @param {number} g - Green value.
     * @param {number} b - Blue value.
     * @param {string?} format - Either 'hex' or 'binary', default is 'hex'.
     * @returns {string}
     */
    static encodeColourInNativeFormat(system, r, g, b, format) {
        if (r < 0 || r > 255) throw new Error('Invalid value for red.');
        if (g < 0 || g > 255) throw new Error('Invalid value for green.');
        if (b < 0 || b > 255) throw new Error('Invalid value for blue.');
        if (!format) format = 'hex';
        if (format !== 'hex' && format !== 'binary') throw new Error('Format must be null, "hex" or "binary".');
        if (system === 'ms') {
            // Master System will return a 6-bit RGB value
            r = Math.round(3 / 255 * r);
            g = Math.round(3 / 255 * g) << 2;
            b = Math.round(3 / 255 * b) << 4;
            if (format === 'binary') return (r | g | b).toString(2).padStart(6, 0);
            else return (r | g | b).toString(16).padStart(2, '0');
        } else if (system === 'gg') {
            // Game gear will return a 12-bit RGB value 
            r = Math.round(15 / 255 * r);
            g = Math.round(15 / 255 * g) << 4;
            b = Math.round(15 / 255 * b) << 8;
            if (format === 'binary') return (r | g | b).toString(2).padStart(12, 0);
            else return (r | g | b).toString(16).padStart(3, '0');
        } else if (system === 'nes') {
            // NES will return the index of the closest colour index from the hand-picked colour palette.
            const colour = getNearestNESColourIndex(r, g, b);
            if (format === 'binary') return colour.toString(2).padStart(8, 0);
            else return (colour).toString(16).padStart(2, '0');
        } else if (system === 'gb') {
            // Game Boy will return a grey index between 0 and 4
            const colour = Math.round(getNearestGBColour((r + g + b) / 3) / 85);
            if (format === 'binary') return colour.toString(2).padStart(2, 0);
            else return (colour).toString(16);
        } else throw new Error('System was not valid.');
    }

    /**
     * Gets a Master System colour palette.
     * @returns {ColourInformation[]}
     */
    static getFullMasterSystemPalette() {
        if (!masterSystemPalette) {
            masterSystemPalette = [];
            const colourShades = [0, 85, 170, 255];
            colourShades.forEach(b => {
                colourShades.forEach(g => {
                    colourShades.forEach(r => {
                        masterSystemPalette.push({ r, g, b });
                    });
                });
            });
        }
        return masterSystemPalette;
    }

    /**
     * Gets a Game Gear colour palette.
     * @returns {ColourInformation[]}
     */
    static getFullGameGearPalette() {
        if (!gameGearPalette) {
            gameGearPalette = [];
            const colourShades = [0, 15, 31, 47, 63, 79, 95, 111, 127, 143, 159, 175, 191, 207, 223, 239, 255];
            colourShades.forEach(b => {
                colourShades.forEach(g => {
                    colourShades.forEach(r => {
                        gameGearPalette.push({ r, g, b });
                    });
                });
            });
        }
        return gameGearPalette;
    }

    /**
     * Gets a Nintendo Entertainment System colour palette.
     * @returns {ColourInformation[]}
     */
    static getFullNESPalette() {
        return nesPalette;
    }

    /**
     * Gets a Game Boy colour palette.
     * @returns {ColourInformation[]}
     */
    static getFullGameBoyPalette() {
        if (!gameBoyPalette) {
            gameBoyPalette = [];
            const colourShades = [0, 85, 170, 255];
            colourShades.forEach(c => {
                gameBoyPalette.push({ r: c, g: c, b: c });
            });
        }
        return gameBoyPalette;
    }


}



/** @type {ColourInformation[]} */
let masterSystemPalette = null;

/** @type {ColourInformation[]} */
let gameGearPalette = null;

/** @type {ColourInformation[]}>} */
const nesPalette = [
    { r: 84, g: 84, b: 84 },
    { r: 0, g: 30, b: 116 },
    { r: 8, g: 16, b: 144 },
    { r: 48, g: 0, b: 136 },
    { r: 68, g: 0, b: 100 },
    { r: 92, g: 0, b: 48 },
    { r: 84, g: 4, b: 0 },
    { r: 60, g: 24, b: 0 },
    { r: 32, g: 42, b: 0 },
    { r: 8, g: 58, b: 0 },
    { r: 0, g: 64, b: 0 },
    { r: 0, g: 60, b: 0 },
    { r: 0, g: 50, b: 60 },
    { r: 0, g: 0, b: 0 },
    { r: 152, g: 150, b: 152 },
    { r: 8, g: 76, b: 196 },
    { r: 48, g: 50, b: 236 },
    { r: 92, g: 30, b: 228 },
    { r: 136, g: 20, b: 176 },
    { r: 160, g: 20, b: 100 },
    { r: 152, g: 34, b: 32 },
    { r: 120, g: 60, b: 0 },
    { r: 84, g: 90, b: 0 },
    { r: 40, g: 114, b: 0 },
    { r: 8, g: 124, b: 0 },
    { r: 0, g: 118, b: 40 },
    { r: 0, g: 102, b: 120 },
    { r: 0, g: 0, b: 0 },
    { r: 236, g: 238, b: 236 },
    { r: 76, g: 154, b: 236 },
    { r: 120, g: 124, b: 236 },
    { r: 176, g: 98, b: 236 },
    { r: 228, g: 84, b: 236 },
    { r: 236, g: 88, b: 180 },
    { r: 236, g: 106, b: 100 },
    { r: 212, g: 136, b: 32 },
    { r: 160, g: 170, b: 0 },
    { r: 116, g: 196, b: 0 },
    { r: 76, g: 208, b: 32 },
    { r: 56, g: 204, b: 108 },
    { r: 56, g: 180, b: 204 },
    { r: 60, g: 60, b: 60 },
    { r: 236, g: 238, b: 236 },
    { r: 168, g: 204, b: 236 },
    { r: 188, g: 188, b: 236 },
    { r: 212, g: 178, b: 236 },
    { r: 236, g: 174, b: 236 },
    { r: 236, g: 174, b: 212 },
    { r: 236, g: 180, b: 176 },
    { r: 228, g: 196, b: 144 },
    { r: 204, g: 210, b: 120 },
    { r: 180, g: 222, b: 120 },
    { r: 168, g: 226, b: 144 },
    { r: 152, g: 226, b: 180 },
    { r: 160, g: 214, b: 228 },
    { r: 160, g: 162, b: 160 },
];

/** @type {ColourInformation[]} */
let gameBoyPalette = null;

let gbColours = [0, 85, 170, 255];
let gbColourValues = [0, 1, 2, 3];

/**
 * Gets the nearest GB colour.
 * @param {number} colour - Colour to check.
 * @returns {number}
 */
function getNearestGBColour(colour) {
    return gbColours.reduce((prev, curr) => {
        return (Math.abs(curr - colour) < Math.abs(prev - colour) ? curr : prev);
    });
}

/**
 * Gets the nearest NES colour.
 * @param {number} r - Red.
 * @param {number} g - Green.
 * @param {number} b - Blue.
 * @returns {ColourInformation}
 */
function getNearestNESColour(r, g, b) {
    const rgbByCloseness = nesPalette.map((nesRGB) => {
        const rgbDiff = [
            { channel: 'r', value: Math.abs(r - nesRGB.r) },
            { channel: 'g', value: Math.abs(g - nesRGB.g) },
            { channel: 'b', value: Math.abs(b - nesRGB.b) }
        ].sort((c1, c2) => c1.value > c2.value ? 1 : -1);

        return {
            r: nesRGB.r, g: nesRGB.g, b: nesRGB.b,
            diff0: rgbDiff[0].value, diff1: rgbDiff[1].value, diff2: rgbDiff[2].value,
            diff: (rgbDiff[0].value + rgbDiff[1].value + rgbDiff[2].value) / 3
        }
    }).sort((c1, c2) => {
        if (c1.diff > c2.diff) return 1;
        if (c1.diff < c2.diff) return -1;
        return 0;
    });

    const closestRGB = rgbByCloseness[0];
    return {
        r: closestRGB.r,
        g: closestRGB.g,
        b: closestRGB.b
    };
}

/**
 * Gets the nearest NES colour palette index.
 * @param {number} r - Red.
 * @param {number} g - Green.
 * @param {number} b - Blue.
 * @returns {number}
 */
function getNearestNESColourIndex(r, g, b) {
    const closestRGB = getNearestNESColour(r, g, b);
    const item = nesPalette.filter((c) => c.r === closestRGB.r && c.g === closestRGB.g && c.b === closestRGB.b)[0];
    const index = nesPalette.indexOf(item);
    const row = Math.floor(index / 14);
    const col = index % 14;
    const nesIndex = col | (row << 4);
    return nesIndex;
}


/**
 * @typedef ColourInformation
 * @type {object}
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @export
 */