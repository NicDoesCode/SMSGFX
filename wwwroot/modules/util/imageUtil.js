import ColourUtil from "./colourUtil.js";

export default class ImageUtil {

    /**
     * @returns {Promise.<ColourMatch[]>}
     */
    async doIt() {
        const p = new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.style.position = 'absolute';
            input.style.zIndex = '199';
            input.style.top = '0px';
            input.style.left = '0px';
            input.type = 'file';
            input.multiple = false;
            // input.style.display = 'none';
            input.onchange = () => {
                if (input.files.length > 0) {
                    const file = input.files[0];
                    const reader = new FileReader();
                    reader.onload = () => {
                        const dataUrl = reader.result;
                        const image = new Image();
                        image.onload = () => {
                            const colours = this.readImage(image);
                            resolve(colours);
                        };
                        image.src = dataUrl;
                    };
                    reader.readAsDataURL(file);
                }
                document.body.removeChild(input);
            };
            document.body.append(input);
            // input.click();
        });
        return p;
    }

    /**
     * 
     * @param {HTMLImageElement} image
     */
    readImage(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '200';
        document.body.append(canvas);

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        /** @type {Colour[]} */
        const output = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
            output.push(getPixelValue(imageData.data, i));
        }
        /** @type {Object.<string, ColourMatch>} */
        const matchedColours = {};
        output.forEach(colour => {
            if (!matchedColours[colour.hex]) {
                matchedColours[colour.hex] = {
                    r: colour.r, g: colour.g, b: colour.b,
                    hex: colour.hex,
                    count: 1, matchedColours: []
                };
            } else {
                matchedColours[colour.hex].count++;
            }
        });
        console.log(output);
        console.log(matchedColours);

        // Colours by similarity
        let matchedColourArray = [];
        for (const uc in matchedColours) {
            matchedColourArray.push(matchedColours[uc]);
        }
        matchedColourArray = matchedColourArray.sort((a, b) => a.count < b.count);
        console.log('uniqueColourArray', matchedColourArray);


        // MS or GG colours 

        let similar = [];

        const msColours = ColourUtil.getMasterSystemPalette();
        const ggColours = ColourUtil.getGameGearPalette();
        const paletteMatch = this.findPaletteColours2(ggColours, matchedColourArray);
        matchedColourArray = paletteMatch.matches.sort((a, b) => a.count < b.count);
        similar = paletteMatch;

        console.log('paletteMatch', paletteMatch);

        let range = 4;
        similar = this.findSimilarColours(matchedColourArray, range);
        while (similar.matches.length > 16) {
            range += 4;
            similar = this.findSimilarColours(paletteMatch.matches, range);
        }
        console.log('similar', similar);


        // MNatch all colours

        // let range = 4;
        // let similar = this.findSimilarColours(uniqueColourArray, range);
        // while (similar.matches.length > 32) {
        //     range += 4;
        //     similar = this.findSimilarColours(uniqueColourArray, range);
        // }
        // console.log('similar', similar);


        // Redraw the canvas with found colours
        const canvas2 = document.createElement('canvas');
        canvas2.width = image.width;
        canvas2.height = image.height;
        canvas2.style.position = 'absolute';
        canvas2.style.zIndex = '200';
        canvas2.style.left = `${canvas.width}px`;
        document.body.append(canvas2);

        const ctx2 = canvas2.getContext('2d');
        let x = 0, y = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {

            if (x % canvas.width === 0) {
                x = 0;
                y++;
            }

            const pixel = getPixelValue(imageData.data, i);
            if (similar.hexLookup[pixel.hex]) {
                ctx2.fillStyle = similar.hexLookup[pixel.hex];
            } else {
                ctx2.fillStyle = 'blue';
            }
            ctx2.fillRect(x, y, 1, 1);

            x++;
        }








        return similar;
    }

    /**
     * @param {ColourMatch[]} colours 
     * @param {number} rangeFactor 
     * @returns {ColourMapping}
     */
    findSimilarColours(colours, rangeFactor) {
        /** @type {ColourMapping} */
        const result = { hexLookup: {}, matches: [] };

        /** @type {ColourMatch[]} */
        const baseColours = colours.map(c => JSON.parse(JSON.stringify(c)));
        /** @type {ColourMatch[]} */
        const compareColours = colours.map(c => JSON.parse(JSON.stringify(c)));

        baseColours.forEach(baseColour => {
            // Only if the colour isn't in the lookup table
            if (!result.hexLookup[baseColour.hex]) {
                // By default add this base colour to the lookup table
                result.hexLookup[baseColour.hex] = baseColour.hex;
                baseColour.matchedColours.forEach(m => result.hexLookup[m] = baseColour.hex);
                result.matches.push(baseColour);

                const range = createColourRange(baseColour, rangeFactor);
                compareColours.forEach(compareColour => {
                    // If comparison colour isn't in lookup table and is similar to the current base colour
                    if (!result.hexLookup[compareColour.hex] && isSimilar(compareColour, range)) {
                        // Associate this colour with the base colour in the lookup and transfer owership of any children 
                        result.hexLookup[compareColour.hex] = baseColour.hex;
                        compareColour.matchedColours.forEach(m => result.hexLookup[m] = baseColour.hex);
                        // Append this colours count and hex as a child of the base colour 
                        baseColour.count += compareColour.count;
                        baseColour.matchedColours.push(compareColour.hex);
                    }
                });
            }
        });

        return result;
    }

    /**
     * Matches given colours to a palette till all are matched.
     * @param {Colour[]} paletteColours 
     * @param {ColourMatch[]} imageColours 
     * @param {number} rangeFactor 
     * @returns {ColourMapping}
     */
    findPaletteColours(paletteColours, imageColours) {
        /** @type {ColourMapping} */
        const result = { hexLookup: {}, matches: [] };

        const palleteColourMatches = paletteColours.map(p => convertToColourMatch(p));

        // For each image colour find matching palette colours, then choose the closest matching one

        imageColours.forEach(imageColour => {
            let range = 4;
            let found = null;
            while (!found && range < 255) {
                const colourRange = createColourRange(imageColour, range);
                const matches = palleteColourMatches.map(paletteMatch => {
                    return {
                        paletteColour: paletteMatch,
                        score: getSimilaritry(paletteMatch, colourRange)
                    }
                }).filter(c => c.score > 0).sort((c1, c2) => c1.score - c2.score);
                if (matches.length > 0) {
                    found = matches[0];
                }
                range += 4;
            }
            // Add palette colour to the result
            if (found) {
                // Make sure the palette colour itself is in the lookup list
                if (!result.hexLookup[found.paletteColour.hex]) {
                    result.hexLookup[found.paletteColour.hex] = found.paletteColour.hex;
                    result.matches.push(found.paletteColour);
                }
                // Associate this colour with the palette colour in the lookup and transfer owership of any children 
                result.hexLookup[imageColour.hex] = found.paletteColour.hex;
                imageColour.matchedColours.forEach(m => result.hexLookup[m] = found.paletteColour.hex);
                // Append this colours count and hex as a child of the base colour 
                found.paletteColour.count += imageColour.count;
                found.paletteColour.matchedColours.push(imageColour.hex);
            }
        });

        return result;
    }

    /**
     * Matches given colours to a palette till all are matched.
     * @param {Colour[]} paletteColours 
     * @param {ColourMatch[]} imageColours 
     * @param {number} rangeFactor 
     * @returns {ColourMapping}
     */
    findPaletteColours2(paletteColours, imageColours) {
        /** @type {ColourMapping} */
        const result = { hexLookup: {}, matches: [] };
        const palleteColourMatches = paletteColours.map(p => convertToColourMatch(p));

        /** @type {ColourMatch[]} */
        const paletteColoursCopy = JSON.parse(JSON.stringify(palleteColourMatches));
        /** @type {ColourMatch[]} */
        let imageColoursCopy = JSON.parse(JSON.stringify(imageColours));

        // Loop till all colours added or our similarity range is at maxiumum
        let range = 0;
        while (imageColoursCopy.length > 0 && range < 255) {
            range += 4;
            // Check each palette colour for matching image colours
            paletteColoursCopy.forEach(paletteColour => {
                const paletteColourRange = createColourRange(paletteColour, range);
                // With each image colour check to see if it is similar to the palette colour
                /** @type {ColourMatch[]} */
                const nextBatchOfImageColoursToScan = [];
                imageColoursCopy.forEach(imageColour => {
                    if (isSimilar(imageColour, paletteColourRange)) {
                        // Make sure the palette colour itself is in the lookup list
                        if (!result.hexLookup[paletteColour.hex]) {
                            result.hexLookup[paletteColour.hex] = paletteColour.hex;
                            result.matches.push(paletteColour);
                        }
                        // Associate this colour with the palette colour in the lookup and transfer ownership of any children 
                        result.hexLookup[imageColour.hex] = paletteColour.hex;
                        imageColour.matchedColours.forEach(m => result.hexLookup[m] = paletteColour.hex);
                        // Append this colour's count and hex as a child of the base colour 
                        paletteColour.count += imageColour.count;
                        paletteColour.matchedColours.push(imageColour.hex);
                    } else {
                        nextBatchOfImageColoursToScan.push(imageColour);
                    }
                });
                imageColoursCopy = nextBatchOfImageColoursToScan;
            });
        }

        console.log('findPaletteColours2 range', range); // TMP 

        return result;
    }

    /**
     * @param {ColourMatch[]} colours 
     * @param {number} rangeFactor 
     * @returns {ColourMapping}
     */
    findDitherColours(colours, rangeFactor) {
        /** @type {ColourMapping} */
        const result = { hexLookup: {}, matches: [] };

        /** @type {ColourMatch[]} */
        const baseColours = colours.map(c => JSON.parse(JSON.stringify(c)));
        /** @type {ColourMatch[]} */
        const compareColours = colours.map(c => JSON.parse(JSON.stringify(c)));

        baseColours.forEach(baseColour => {
            if (result.hexLookup[baseColour.hex]) return;

            result.hexLookup[baseColour.hex] = baseColour.hex;
            result.matches.push(baseColour);

            const range = createColourRange(baseColour, rangeFactor);
            compareColours.forEach(compareColour => {
                if (result.hexLookup[compareColour.hex]) return;

                if (isSimilar(compareColour, range)) {
                    baseColour.count += compareColour.count;
                    result.hexLookup[compareColour.hex] = baseColour.hex;
                }
            });
        });

        return result;
    }

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
function createColourRange(colour, rangeFactor) {
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
    return colour.r >= range.rLow && colour.r <= range.rHigh &&
        colour.g >= range.gLow && colour.g <= range.gHigh &&
        colour.b >= range.bLow && colour.b <= range.bHigh;
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
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {string} hex
 */
/** 
 * @typedef {object} ColourMatch
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {string} hex
 * @property {number} count
 * @property {string[]} matchedColours
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