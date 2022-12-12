import PaletteFactory from "../factory/paletteFactory.js";
import Palette from "../models/palette.js";
import PaletteColour from "../models/paletteColour.js";
import ColourUtil from "../util/colourUtil.js";
import ImageUtil from "../util/imageUtil.js";

export default class ImageImporter {


    get hasGameGearPalette() {
        // TODO 
    }

    get hasMasterSystemPalette() {
        // TODO 
    }


    /** @type {Object.<string, ColourMatch>} */
    #sourceColours;
    /** @type {HTMLImageElement} */
    #sourceImage;
    /** @type {HTMLImageElement} */
    #resizedSourceImage;
    /** @type {HTMLImageElement} */
    #previewImage;
    #palette;


    /**
     * Do not call the constructor, use the "fromImageAsync" method instead.
     * @param {HTMLImageElement} sourceImage - Source image.
     * @returns {ImageData}
     */
    constructor(sourceImage) {
        this.#sourceImage = sourceImage;
        this.#resizedSourceImage = null;
        this.#previewImage = null;
    }


    /**
     * Creates a new instance of the class.
     * @param {HTMLImageElement} sourceImage - Source image.
     * @returns {Promise<ImageImporter>}
     */
    static async fromImageAsync(sourceImage) {
        return new Promise((resolve, reject) => {
            resolve(new ImageImporter(sourceImage));
        });
    }


    #checkSourceImage(width, height) {
        if (!this.#sourceImage) {
            this.#eraseResizedSourceImage();
        } else {
            const dims = ImageUtil.calculateAspectRatioDimensions(this.#sourceImage, width, height);
            const src = this.#resizedSourceImage;
            if (src.width !== dims.width || src.height !== dims.height) {
                this.#eraseResizedSourceImage();
            }
        }
    }

    #checkPreviewImage() {
        if (!this.#previewImage) {
            this.#erasePreviewImage();
        } else {
            const src = this.#resizedSourceImage;
            const img = this.#previewImage;
            if (src.width !== img.width || src.height !== img.height) {
                this.#erasePreviewImage();
            }
        }
    }

    #eraseResizedSourceImage() {
        this.#resizedSourceImage = null;
        this.#sourceColours = null;
        this.#erasePreviewImage();
    }

    #erasePreviewImage() {
        this.#resizedSourceImage = null;
        this.#previewImage = null;
        this.#palette = null;
    }




    /**
     * Updates the preview image.
     * @param {number} width - Width of the image to return.
     * @param {number} height - Height of the image to return.
     * @param {string|Palette} palette - Either 'ms', 'gg' or a colour palette object to match colours to.
     */
    async updateImageAsync(width, height, palette) {
        if (!palette) throw new Error('Argument "palette" can not be null or undefined.');
        if (typeof palette === 'string' && !['ms', 'gg'].includes(palette)) throw new Error('Argument "palette" must be a string of either "ms" or "gg" or a "Palette" object.');
        if (typeof palette !== 'string' && !palette instanceof Palette) throw new Error('Argument "palette" must be a string of either "ms" or "gg" or a "Palette" object.');

        this.#checkSourceImage(width, height);
        if (!this.#resizedSourceImage) {
            // Resize the image
            this.#resizedSourceImage = await ImageUtil.resizeImageAsync(this.#sourceImage, dim.width, dim.height);
            // Extract unique colours
            this.#sourceColours = await extractUniqueColoursAsync(this.#resizedSourceImage);
        }

        this.#checkPreviewImage();

        // Determine palette to use
        const colours = getColoursFromPalette(palette);
        // Match to full palette
        // Shrink palette
        const grouped = { matches: colours,  };
        let matchRangeFactor = 0;
        while (matchedColours.matches.length > 16) {
            matchRangeFactor += 4;
            grouped = await groupSimilarColoursAsync(grouped.matches, matchRangeFactor);
        }

        // Build palettes
        this.#palette = createPalette(palette, colours);

        // Update the image
        this.#previewImage = await renderImageFromPaletteAsync();

        // Return - { image, palettes[] }
    }


}


/**
 * Takes an input list of colour matches and reduces by grouping colours with other similar colours.
 * @param {ColourMatch[]} coloursToGroup - Input list of colours to match.
 * @param {number} matchRangeFactor - Match sensitivity, value between 1 and 255, colours with an R, G, and B value that all fall withing this range will be grouped.
 * @returns {Promise<ColourMapping>}
 */
async function groupSimilarColoursAsync(coloursToGroup, matchRangeFactor) {
    return new Promise((resolve, reject) => {
        try {
            resolve(groupSimilarColours(coloursToGroup, matchRangeFactor))
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Takes an input list of colour matches and reduces by grouping colours with other similar colours.
 * @param {ColourMatch[]} coloursToGroup - Input list of colours to match.
 * @param {number} matchRangeFactor - Match sensitivity, value between 1 and 255, colours with an R, G, and B value that all fall withing this range will be grouped.
 * @returns {ColourMapping}
 */
function groupSimilarColours(coloursToGroup, matchRangeFactor) {

    /** @type {ColourMapping} */
    const result = { hexLookup: {}, matches: [] };

    /** @type {ColourMatch[]} */
    const baseColours = coloursToGroup.map(c => JSON.parse(JSON.stringify(c))).sort((a, b) => b.count > a.count);
    /** @type {ColourMatch[]} */
    let coloursToMatch = coloursToGroup.map(c => JSON.parse(JSON.stringify(c))).sort((a, b) => a.count < b.count);

    baseColours.forEach(baseColour => {

        // Only if the colour isn't in the lookup table
        if (!result.hexLookup[baseColour.hex]) {

            // Add the base colour to the result
            result.hexLookup[baseColour.hex] = baseColour.hex;
            baseColour.matchedColours.forEach(hex => {
                result.hexLookup[hex] = baseColour.hex;
            });
            result.matches.push(baseColour);

            // Find any similar colours
            const matchRange = createMatchRange(baseColour, matchRangeFactor);
            const unmatchedColours = [];
            coloursToMatch.forEach(colourToMatch => {

                if (isSimilar(colourToMatch, matchRange)) {

                    result.hexLookup[colourToMatch.hex] = baseColour.hex;
                    if (!baseColour.matchedColours.includes(colourToMatch.hex)) {
                        baseColour.matchedColours.push(colourToMatch.hex);
                    }
                    colourToMatch.matchedColours.forEach(hex => {
                        result.hexLookup[hex] = baseColour.hex;
                        if (!baseColour.matchedColours.includes(hex)) {
                            baseColour.matchedColours.push(hex);
                        }
                    });

                    baseColour.count += colourToMatch.count;

                } else {
                    unmatchedColours.push(colourToMatch);
                }

            });
            coloursToMatch = unmatchedColours;

        }

    });

    return result;
}

/**
 * @param {ColourMatch} colour 
 * @param {number} range 
 * @returns {ColourRange}
 */
function createMatchRange(colour, rangeFactor) {
    return {
        rLow: Math.max(colour.r - rangeFactor / 2, 0),
        gLow: Math.max(colour.g - rangeFactor / 2, 0),
        bLow: Math.max(colour.b - rangeFactor / 2, 0),
        rHigh: Math.min(colour.r + rangeFactor / 2, 255),
        gHigh: Math.min(colour.g + rangeFactor / 2, 255),
        bHigh: Math.min(colour.b + rangeFactor / 2, 255),
        r: colour.r,
        g: colour.g,
        b: colour.b,
        rangeFactor: rangeFactor
    };
}

/**
 * @param {ColourMatch} colour 
 * @param {ColourRange} range 
 * @returns {boolean}
 */
function isSimilar(colour, range) {
    return (colour.r >= range.rLow && colour.r <= range.rHigh) &&
        (colour.g >= range.gLow && colour.g <= range.gHigh) &&
        (colour.b >= range.bLow && colour.b <= range.bHigh)
        ;
}

/**
 * @param {string|Palette} palette - Either 'ms', 'gg' or a colour palette object to match colours to.
 * @returns {ColourMatchDictionary}
 */
function getColoursFromPalette(palette) {
    /** @type {Object.<string, ColourMatch>} */
    let result = {};
    if (palette instanceof Palette) {
        // Convert palette to match colours
        palette.getColours().forEach(c => {
            const hex = ColourUtil.toHex(c.r, c.g, c.b);
            if (!result[hex]) {
                result[hex] = {
                    hex: hex, r: c.r, g: c.g, b: c.b,
                    count: 0, matchedColours: []
                }
            }
        });
    } else if (palette === 'ms' || palette === 'gg') {
        const colours = palette === 'ms' ? ColourUtil.getFullMasterSystemPalette() : ColourUtil.getFullGameGearPalette();
        colours.forEach(c => {
            const hex = ColourUtil.toHex(c.r, c.g, c.b);
            if (!result[hex]) {
                result[hex] = {
                    hex: hex, r: c.r, g: c.g, b: c.b,
                    count: 0, matchedColours: []
                }
            }
        });
    } else throw new Error('Invalid palette.');
    return result;
}

/**
 * @param {string|Palette} sourcePaletteOrSystemName - Either 'ms', 'gg' or a colour palette object to match colours to.
 * @param {ColourMatch[]} colours - Colours to turn into a palette.
 * @returns {ColourMatchDictionary}
 */
function createPalette(sourcePaletteOrSystemName, colours) {
    /** @type {Palette} */
    let result;
    if (sourcePaletteOrSystemName instanceof Palette) {
        result = PaletteFactory.create(sourcePaletteOrSystemName.title, sourcePaletteOrSystemName.system);
    } else if (sourcePaletteOrSystemName === 'ms' || sourcePaletteOrSystemName === 'gg') {
        result = PaletteFactory.create('Imported palette', sourcePaletteOrSystemName);
    } else throw new Error('Invalid palette.');
    colours.forEach((c, i) => {
        if (i < 16) {
            result.setColour(i, new PaletteColour(c.r, c.g, c.b));
        }
    });
    return result;
}

/**
 * Gets a new image using a colour palette.
 * @param {ColourMatch[]} colours - Palette of colours.
 * @param {HTMLImageElement} sourceImage - Image to display.
 * @returns {Promise<HTMLImageElement>}
 */
async function renderImageFromPaletteAsync(colours, sourceImage) {
    return await new Promise(async (resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
        const context = canvas.getContext('2d');

        const imageData = ImageUtil.extractImageData(sourceImage);

        // Get a hex colour lookup table from palette data
        /** @type {Object.<string, string>} */
        const colourHexLookup = {};
        colours.forEach(colour => {
            colourHexLookup[colour.hex] = colour.hex;
            colour.matchedColours.forEach(matchHex => {
                colourHexLookup[matchHex] = colour.hex;
            });
        });

        const noMatch = []; // TMP 

        let x = 0, y = -1;
        for (let i = 0; i < imageData.data.length; i += 4) {

            // Move to next vertical line at end of horizontal line 
            if (x % canvas.width === 0) {
                x = 0;
                y++;
            }

            // Fill the pixel based on image in hex lookup
            const pixel = getPixelValue(imageData.data, i);
            if (colourHexLookup[pixel.hex]) {
                context.fillStyle = colourHexLookup[pixel.hex];
            } else {
                if (!noMatch.includes(pixel.hex)) noMatch.push(pixel.hex); // TMP 
                context.fillStyle = 'yellow';
            }
            context.fillRect(x, y, 1, 1);

            x++;
        }

        console.log('noMatch', noMatch); // TMP 
        resolve(await canvasToImageAsync(canvas));
    });
}



/**
 * Extracts all unique colours from an image.
 * @param {HTMLImageElement} image - Input image to extract colours from.
 * @returns {Promise<ColourMatchDictionary>}
 */
function extractUniqueColoursAsync(image) {
    return new Promise((resolve, reject) => {
        return extractUniqueColours(image);
    });
}
/**
 * Extracts all unique colours from an image.
 * @param {HTMLImageElement} image - Input image to extract colours from.
 * @returns {ColourMatchDictionary}
 */
function extractUniqueColours(image) {
    const imageData = ImageUtil.extractImageData(image);
    /** @type {ColourMatchDictionary} */
    const uniqueColours = {};
    for (let i = 0; i < imageData.data.length; i += 4) {
        const pxColour = getPixelValue(imageData.data, i);

        if (!uniqueColours[pxColour.hex]) {
            uniqueColours[pxColour.hex] = {
                r: pxColour.r,
                g: pxColour.g,
                b: pxColour.b,
                hex: pxColour.hex,
                count: 1,
                matchedColours: []
            };
        } else {
            uniqueColours[pxColour.hex].count++;
        }
    }
    return uniqueColours;
}


/** 
 * @typedef {Object.<string, ColourMatch>} ColourMatchDictionary
 */
/** 
 * @typedef {object} ColourMatch
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @property {string} hex - HEX value for this colour.
 * @property {number} count - Amount of times this colour was found.
 * @property {string[]} matchedColours - HEX values of all colours that are similar and hence replaced by this colour.
 */
/**
 * @typedef {object} ColourMapping
 * @property {ColourMatch[]} matches
 * @property {Object.<string, string>} hexLookup
 */