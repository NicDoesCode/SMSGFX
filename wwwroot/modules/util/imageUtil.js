import ColourUtil from "./colourUtil.js";

export default class ImageUtil {


    /**
     * Displays an image on a canvas element.
     * @param {HTMLCanvasElement} canvas - Canvas element to display the image on.
     * @param {HTMLImageElement} image - Image to display.
     */
    static displayImageOnCanvas(canvas, image) {
        if (!canvas) throw new Error('Canvas must be set.');
        const context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
    }

    /**
     * Gets a new image using a colour palette.
     * @param {ColourMatch} palette - Palette of colours.
     * @param {HTMLImageElement} image - Image to display.
     * @returns {HTMLImageElement}
     */
    static async getImageFromPaletteAsync(palette, image) {
        return await new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');

            const imageData = ImageUtil.extractImageData(image);

            // Get a hex colour lookup table from palette data
            /** @type {Object.<string, string>} */
            const hexLookup = {};
            palette.forEach(p => {
                hexLookup[p.hex] = p.hex;
                p.matchedColours.forEach(m => {
                    hexLookup[m] = p.hex;
                });
            });

            console.log('getImageFromPalette palette', palette);
            console.log('getImageFromPalette hexLookup', hexLookup);

            let x = 0, y = 0;
            for (let i = 0; i < imageData.data.length; i += 4) {

                // Move to next vertical line at end of horizontal line 
                if (x % canvas.width === 0) {
                    x = 0;
                    y++;
                }

                // Fill the pixel based on image in hex lookup
                const pixel = getPixelValue(imageData.data, i);
                if (hexLookup[pixel.hex]) {
                    ctx.fillStyle = hexLookup[pixel.hex];
                } else {
                    ctx.fillStyle = 'yellow';
                }
                ctx.fillRect(x, y, 1, 1);

                x++;
            }

            const dataUrl = canvas.toDataURL();
            const previewImage = new Image();
            previewImage.onload = () => {
                resolve(previewImage);
            };
            previewImage.src = dataUrl;
        });
    }

    /**
     * Creates an image data object from a canvas element.
     * @param {HTMLImageElement} image - Input image.
     * @returns {ImageData}
     */
    static extractImageData(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        return context.getImageData(0, 0, canvas.width, canvas.height);
    }

    /**
     * Reads an image from a HTML file input.
     * @param {HTMLInputElement} fileInput - The file input to read.
     * @returns {HTMLImageElement}
     */
    static async fileInputToImageAsync(fileInput) {
        if (!fileInput) throw new Error('File input must be set.');
        if (fileInput.files.length === 0) throw new Error('File input had no files.');
        return await new Promise((resolve, reject) => {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result;
                const image = new Image();
                image.onload = () => {
                    resolve(image);
                };
                image.src = dataUrl;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Extracts a 16 colour native system palette from an image.
     * @param {HTMLImageElement} image - Input image.
     * @param {string} system - Target system, either 'ms' or 'gg'.
     * @returns {ColourMatch[]}
     */
    static async extractNativePaletteFromImageAsync(image, system) {
        return await new Promise((resolve, reject) => {
            const matchedColours = ImageUtil.extractNativePaletteFromImage(image, system);
            resolve(matchedColours);
        });
    }

    /**
     * Extracts a 16 colour native system palette from an image.
     * @param {HTMLImageElement} image - Input image.
     * @param {string} system - Target system, either 'ms' or 'gg'.
     * @returns {ColourMatch[]}
     */
    static extractNativePaletteFromImage(image, system) {

        const foundImageColoursDict = extractUniqueColours(image);
        let foundImageColours = Object.values(foundImageColoursDict).sort((a, b) => a.count < b.count);

        /** @type {ColourMapping} */
        let matchedColours;

        const targetSystemPalette = system === 'gg' ?
            ColourUtil.getFullGameGearPalette() :
            ColourUtil.getFullMasterSystemPalette();
        matchedColours = matchColours(targetSystemPalette, foundImageColours);

        console.log('extractNativePaletteFromImage, matched colours', matchedColours);

        if (system === 'ms') {
            // When matching for the Master System, create the palette using the most used colours
            if (matchedColours.matches.length > 16) {
                /** @type {Colour[]} */
                const mostUsedColours = matchedColours.matches.sort((a, b) => b.count > a.count).slice(0, 16).map(c => {
                    return { r: c.r, g: c.g, b: c.b, hex: c.hex };
                });
                matchedColours = matchColours(mostUsedColours, matchedColours.matches);
            }
        } else {
            // When matching for the Game Gear, use standard palette colour reduction
            // Reduce the matched colours to a 16 colour palette
            let matchRangeFactor = 0;
            while (matchedColours.matches.length > 16) {
                matchRangeFactor += 16;
                matchedColours = groupSimilarColours2(matchedColours.matches, matchRangeFactor);
            }
        }

        console.log('extractNativePaletteFromImage, reduced colours', matchedColours);

        return matchedColours.matches;
    }


}



/**
 * Matches an array colours to a list of source colours.
 * @param {Colour[]} sourceList - Array of colour values to match the list to.
 * @param {ColourMatch[]} coloursToMatch - Array of colours to match to similar ones in the source list.
 * @param {number} rangeFactor 
 * @returns {ColourMapping}
 */
function matchColours(sourceList, coloursToMatch) {
    /** @type {ColourMapping} */
    const matched = { hexLookup: {}, matches: [] };

    /** @type {ColourMatch[]} */
    let sourceColours = JSON.parse(JSON.stringify(
        sourceList.map(p => convertToColourMatch(p))
    ));
    /** @type {ColourMatch[]} */
    let matchColours = JSON.parse(JSON.stringify(coloursToMatch));

    // Loop till all colours added or our similarity range is at maxiumum
    let range = 0;
    while (matchColours.length > 0 && range < 255) {
        range += 2;
        // Check each palette colour for matching image colours
        sourceColours.forEach(sourceC => {
            const paletteColourRange = createMatchRange(sourceC, range);
            // With each image colour check to see if it is similar to the palette colour
            /** @type {ColourMatch[]} */
            const nextBatchOfImageColoursToScan = [];
            matchColours.forEach(matchC => {
                if (isSimilar(matchC, paletteColourRange)) {
                    // Make sure the palette colour itself is in the lookup list
                    if (!matched.hexLookup[sourceC.hex]) {
                        matched.hexLookup[sourceC.hex] = sourceC.hex;
                        sourceC.matchedColours.forEach(m => matched.hexLookup[m] = sourceC.hex);
                        matched.matches.push(sourceC);
                    }
                    // Associate this colour with the palette colour in the lookup and transfer ownership of any children 
                    matched.hexLookup[matchC.hex] = sourceC.hex;
                    matchC.matchedColours.forEach(m => matched.hexLookup[m] = sourceC.hex);
                    sourceC.matchedColours.push(matchC.hex);
                    sourceC.matchedColours = sourceC.matchedColours.concat(matchC.matchedColours);
                    // Append this colour's count and hex as a child of the base colour 
                    sourceC.count += matchC.count;
                } else {
                    nextBatchOfImageColoursToScan.push(matchC);
                }
            });
            matchColours = nextBatchOfImageColoursToScan;
        });
    }
    return matched;
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
    const coloursMostUsedToLeast = coloursToGroup.map(c => JSON.parse(JSON.stringify(c))).sort((a, b) => b.count > a.count);

    for (let a = coloursMostUsedToLeast.length; a > 0; a--) {
        const lessPopularColour = coloursMostUsedToLeast[a - 1];
        if (!result.hexLookup[lessPopularColour.hex]) {

            // Attempt to match this colour to a more popular one, loop backwards, 
            // starting with most popular and checking lesser and lesser colours
            // Also quit looping if the colour in question appears in the hex lookup
            const matchRange = createMatchRange(lessPopularColour, matchRangeFactor);
            for (let i = 0; !result.hexLookup[lessPopularColour.hex] && i < coloursMostUsedToLeast.length; i++) {
                const morePopularColour = coloursMostUsedToLeast[i];

                // If we're not comparing the same colour, and this base colour is similar, then merge 
                // the compare colour with the base colour
                if (morePopularColour.hex !== lessPopularColour.hex) {
                    if (isSimilar(morePopularColour, matchRange)) {
                        // Found a better match, merge this colour with the more popular colour
                        if (!result.hexLookup[morePopularColour.hex]) {
                            result.hexLookup[morePopularColour.hex] = morePopularColour.hex;
                            morePopularColour.matchedColours.forEach(m => result.hexLookup[m] = morePopularColour.hex);
                            result.matches.push(morePopularColour);
                        }
                        result.hexLookup[lessPopularColour.hex] = morePopularColour.hex;
                        lessPopularColour.matchedColours.forEach(m => result.hexLookup[m] = morePopularColour.hex);
                        morePopularColour.count += lessPopularColour.count;
                        morePopularColour.matchedColours = morePopularColour.matchedColours.concat(lessPopularColour.matchedColours);
                    }
                }

            }
            // If the colour wasn't matched to any more popular colour, 
            // then it survives and is added to the result
            if (!result.hexLookup[lessPopularColour.hex]) {
                result.hexLookup[lessPopularColour.hex] = lessPopularColour.hex;
                lessPopularColour.matchedColours.forEach(m => result.hexLookup[m] = lessPopularColour.hex);
                result.matches.push(lessPopularColour);
            }
        }

    }

    return result;
}

/**
 * Takes an input list of colour matches and reduces by grouping colours with other similar colours.
 * @param {ColourMatch[]} coloursToGroup - Input list of colours to match.
 * @param {number} matchRangeFactor - Match sensitivity, value between 1 and 255, colours with an R, G, and B value that all fall withing this range will be grouped.
 * @returns {ColourMapping}
 */
function groupSimilarColours2(coloursToGroup, matchRangeFactor) {
    /** @type {ColourMapping} */
    const result = { hexLookup: {}, matches: [] };

    /** @type {ColourMatch[]} */
    const baseColours = coloursToGroup.map(c => JSON.parse(JSON.stringify(c))).sort((a, b) => b.count > a.count);
    /** @type {ColourMatch[]} */
    const compareColours = coloursToGroup.map(c => JSON.parse(JSON.stringify(c))).sort((a, b) => a.count < b.count);

    baseColours.forEach(baseColour => {

        // Only if the colour isn't in the lookup table
        if (!result.hexLookup[baseColour.hex]) {

            // By default add this base colour to the lookup table
            result.hexLookup[baseColour.hex] = baseColour.hex;
            baseColour.matchedColours.forEach(m => result.hexLookup[m] = baseColour.hex);
            result.matches.push(baseColour);

            const range = createMatchRange(baseColour, matchRangeFactor);
            compareColours.forEach(compareColour => {
                // If comparison colour isn't in lookup table and is similar to the current base colour
                if (result.hexLookup[compareColour.hex]) return;
                if (isSimilar(compareColour, range)) {
                    // Associate this colour with the base colour in the lookup and transfer owership of any children 
                    result.hexLookup[compareColour.hex] = baseColour.hex;
                    compareColour.matchedColours.forEach(m => {
                        result.hexLookup[m] = baseColour.hex;
                        baseColour.matchedColours.push(m);
                    });
                    // Append this colours count and hex as a child of the base colour 
                    baseColour.count += compareColour.count;
                    baseColour.matchedColours.push(compareColour.hex);
                }
            });

        }

    });

    return result;
}

// /**
//  * Eliminates colours with the lowest count.
//  * @param {ColourMapping} input - List to process.
//  * @param {ColourMapping} input - List to process.
//  * @returns {ColourMapping}
//  */
// eliminateColoursWithLowCount(input, minAmount) {
//     /** @type {ColourMapping} */
//     const result = { hexLookup: {}, matches: [] };

//     /** @type {ColourMatch[]} */
//     const culledColours = [];

//     input.matches.forEach(c => {
//         if (c.count < minAmount) {
//             culledColours.push(culledColours);
//         }
//     });
// }








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
                r: pxColour.r, g: pxColour.g, b: pxColour.b,
                hex: pxColour.hex,
                count: 1, matchedColours: []
            };
        } else {
            uniqueColours[pxColour.hex].count++;
        }
    }
    return uniqueColours;
}

/**
 * Converts a colour object to a unique colour object.
 * @param {Colour} colour 
 * @returns {ColourMatch}
 */
function convertToColourMatch(colour) {
    return {
        r: colour.r, g: colour.g, b: colour.b,
        count: 0, hex: ColourUtil.toHex(colour.r, colour.g, colour.b),
        matchedColours: []
    };
}

/**
 * @param {Uint8ClampedArray} imageData 
 * @param {number} index 
 * @returns {Colour}
 */
function getPixelValue(imageData, index) {
    return {
        r: imageData[index + 0],
        g: imageData[index + 1],
        b: imageData[index + 2],
        s: imageData[index + 3],
        hex: ColourUtil.toHex(imageData[index + 0], imageData[index + 1], imageData[index + 2])
    };
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
    // TODO - This is horribly slow and I don't know why
    return (colour.r >= range.rLow && colour.r <= range.rHigh) &&
        (colour.g >= range.gLow && colour.g <= range.gHigh) &&
        (colour.b >= range.bLow && colour.b <= range.bHigh)
        ;
    // if (colour.r < range.rLow || colour.r > range.rHigh) return false;
    // if (colour.g < range.gLow || colour.g > range.gHigh) return false;
    // if (colour.b < range.bLow || colour.b > range.bHigh) return false;
    return true;
    // return colour.r >= range.rLow && colour.r <= range.rHigh &&
    //     colour.g >= range.gLow && colour.g <= range.gHigh &&
    //     colour.b >= range.bLow && colour.b <= range.bHigh;
}

/**
 * @param {ColourMatch} colour 
 * @param {ColourRange} range 
 * @returns {number}
 */
function getSimilaritry(colour, range) {
    if (!isSimilar(colour, range)) return 0;
    let score = 0;
    ['r', 'g', 'b'].forEach(c => {
        const distance = Math.max(colour[c], range[c]) - Math.min(colour[c], range[c]);
        const halfRange = range.rangeFactor / 2;
        score += (1 / halfRange) * (halfRange - distance);
    });
    return score / 3;
}

/** 
 * @typedef {object} Colour 
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @property {string} hex - HEX value for this colour.
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
 * @typedef {Object.<string, colourMatch>} ColourMatchDictionary
 */
/** 
 * @typedef {object} ColourRange 
 * @property {number} rLow
 * @property {number} gLow
 * @property {number} bLow
 * @property {number} rHigh
 * @property {number} gHigh
 * @property {number} bHigh
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} rangeFactor
*/
/**
 * @typedef {object} ColourMapping
 * @property {ColourMatch[]} matches
 * @property {Object.<string, string>} hexLookup
 */