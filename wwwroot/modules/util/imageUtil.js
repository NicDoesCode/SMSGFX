import Palette from "../models/palette.js";
import Project from "../models/project.js";
import PaletteFactory from "../factory/paletteFactory.js";
import ProjectFactory from "../factory/projectFactory.js";
import ColourUtil from "./colourUtil.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";

export default class ImageUtil {


    /**
     * Displays an image on a canvas element.
     * @param {HTMLCanvasElement} canvas - Canvas element to display the image on.
     * @param {HTMLImageElement} image - Image to display.
     * @param {ImageDisplayParams?} params - Optional parameters.
     */
    static displayImageOnCanvas(canvas, image, params) {
        if (!canvas) throw new Error('Canvas must be set.');
        const context = canvas.getContext('2d');

        // Determine preview image scale W & H
        let drawScale, drawW, drawH;
        drawScale = params?.scale ?? 1;
        drawW = image.width * drawScale;
        drawH = image.height * drawScale;

        // Fill background
        context.fillStyle = '#DDDDDD';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Background blank area lines
        context.strokeStyle = '#CCCCCC';
        context.beginPath();
        const largestDimension = Math.max(canvas.width, canvas.height);
        for (let t = 0; t <= largestDimension; t += 4) {
            context.moveTo(t, 0);
            context.lineTo(0, t);
            context.moveTo(largestDimension, largestDimension - t);
            context.lineTo(largestDimension - t, largestDimension);
        }
        context.stroke();

        // Draw image image with a border
        let drawX = (canvas.width - drawW) / 2;
        let drawY = (canvas.height - drawH) / 2;
        context.strokeStyle = '#555555';
        context.strokeRect(drawX - 1, drawY - 1, drawW + 2, drawH + 2);
        context.imageSmoothingEnabled = false;
        context.drawImage(image, drawX, drawY, drawW, drawH);

        // Draw tile spec?
        if (params?.tiles) {
            const tileWidth = 8 * drawScale;
            const tiles = params.tiles;
            let tileOffsetX = drawX + (tiles.offsetX * drawScale);
            let tileOffsetY = drawY + (tiles.offsetY * drawScale);
            for (let y = 0; y < tiles.tilesHigh; y++) {
                const thisTileOffsetY = tileOffsetY + (y * tileWidth);
                for (let x = 0; x < tiles.tilesWide; x++) {
                    const thisTileOffsetX = tileOffsetX + (x * tileWidth);
                    context.strokeStyle = 'rgba(0, 0, 0, 0.25)';
                    context.strokeRect(thisTileOffsetX, thisTileOffsetY, tileWidth, tileWidth);
                    context.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                    context.strokeRect(thisTileOffsetX + 1, thisTileOffsetY + 1, tileWidth, tileWidth);
                }
            }
        }
    }

    /**
     * Gets a new image using a colour palette.
     * @param {ColourMatch} palette - Palette of colours.
     * @param {HTMLImageElement} image - Image to display.
     * @returns {HTMLImageElement}
     */
    static async resizeImageAsync(image, width, height) {
        return await new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 0, 0, width, height);

            resolve(await canvasToImageAsync(canvas));
        });
    }

    /**
     * Gets a new image using a colour palette.
     * @param {ColourMatch} palette - Palette of colours.
     * @param {HTMLImageElement} image - Image to display.
     * @returns {HTMLImageElement}
     */
    static async getImageFromPaletteAsync(palette, image) {
        return await new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d');

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

            // console.log('getImageFromPalette palette', palette);
            // console.log('getImageFromPalette hexLookup', hexLookup);

            let x = 0, y = -1;
            for (let i = 0; i < imageData.data.length; i += 4) {

                // Move to next vertical line at end of horizontal line 
                if (x % canvas.width === 0) {
                    x = 0;
                    y++;
                }

                // Fill the pixel based on image in hex lookup
                const pixel = getPixelValue(imageData.data, i);
                if (hexLookup[pixel.hex]) {
                    context.fillStyle = hexLookup[pixel.hex];
                } else {
                    context.fillStyle = 'yellow';
                }
                context.fillRect(x, y, 1, 1);

                x++;
            }

            resolve(await canvasToImageAsync(canvas));
        });
    }

    /**
     * Creates a tile preview image data object from a canvas element.
     * @param {HTMLImageElement} image - Source image to create the preview from.
     * @returns {ImageData}
     */
    static async createTilePreviewImageAsync(image) {
        return new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = 8 * Math.ceil(image.width / 8);
            canvas.height = 8 * Math.ceil(image.height / 8);

            const context = canvas.getContext('2d');
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 0, 0);

            context.strokeStyle = '#AAAAAA';
            for (let w = 0; w < image.width; w += 8) {
                context.moveTo(w, 0);
                context.lineTo(w, image.height);
            }
            for (let h = 0; h < image.height; h += 8) {
                context.moveTo(0, h);
                context.lineTo(image.width, h);
            }
            context.stroke();

            resolve(await canvasToImageAsync(canvas));
            // return context.getImageData(0, 0, canvas.width, canvas.height);
        });
    }

    /**
     * Creates a tile preview image data object from a canvas element.
     * @param {HTMLImageElement} image - Source image to create the preview from.
     * @returns {ImageData}
     */
    static async drawPreviewToCanvas(image) {
        return new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = 8 * Math.ceil(image.width / 8);
            canvas.height = 8 * Math.ceil(image.height / 8);

            const context = canvas.getContext('2d');
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 0, 0);

            context.strokeStyle = '#AAAAAA';
            for (let w = 0; w < image.width; w += 8) {
                context.moveTo(w, 0);
                context.lineTo(w, image.height);
            }
            for (let h = 0; h < image.height; h += 8) {
                context.moveTo(0, h);
                context.lineTo(image.width, h);
            }
            context.stroke();

            resolve(await canvasToImageAsync(canvas));
            // return context.getImageData(0, 0, canvas.width, canvas.height);
        });
    }

    /**
     * Creates a tile preview image data object from a canvas element.
     * @param {HTMLImageElement} image - Source image to create the preview from.
     * @returns {ImageData}
     */
    static async drawPreviewOntoCanvasAsync(image, outputCanvas) {
        const canvas = document.createElement('canvas');
        canvas.width = 8 * Math.ceil(image.width / 8);
        canvas.height = 8 * Math.ceil(image.height / 8);

        const context = canvas.getContext('2d');
        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0);

        context.strokeStyle = '#AAAAAA';
        for (let w = 0; w < image.width; w += 8) {
            context.strokeRect(w, 0, w, image.height);
        }
        for (let h = 0; h < image.height; h += 8) {
            context.strokeRect(h, 0, h, image.width);
        }

        return context.getImageData(0, 0, canvas.width, canvas.height);
    }

    /**
     * Creates an image data object from a canvas element.
     * @param {HTMLImageElement} image - Input image.
     * @returns {globalThis.ImageData}
     */
    static extractImageData(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        context.imageSmoothingEnabled = false;
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
        return await this.fileToImageAsync(fileInput.files[0]);
    }

    /**
     * Reads an image from a file.
     * @param {File} file - The file to read.
     * @returns {HTMLImageElement}
     */
    static async fileToImageAsync(file) {
        if (!file) throw new Error('File must be set.');
        return await new Promise((resolve, reject) => {
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
     * Matches colours to a given Palette.
     * @param {HTMLImageElement} image - Input image.
     * @param {Palette} palette - Palette containing the colours.
     * @returns {ColourMatch[]}
     */
    static async matchToPaletteAsync(image, palette) {
        return await new Promise((resolve, reject) => {
            const matchedColours = ImageUtil.matchToPalette(image, palette);
            resolve(matchedColours);
        });
    }

    /**
     * Matches colours to a given Palette.
     * @param {HTMLImageElement} image - Input image.
     * @param {Palette} palette - Palette containing the colours.
     * @returns {ColourMatch[]}
     */
    static matchToPalette(image, palette) {

        /** @type {Colour[]} */
        const colours = [];
        palette.getColours().forEach(paletteColour => {
            colours.push({
                r: paletteColour.r, g: paletteColour.g, b: paletteColour.b,
                hex: ColourUtil.toHex(paletteColour.r, paletteColour.g, paletteColour.b)
            });
        });

        const foundImageColoursDict = extractUniqueColours(image);
        const foundImageColours = Object.values(foundImageColoursDict).sort((a, b) => a.count > b.count);

        const matchedColours = matchColours(colours, foundImageColours);
        return matchedColours.matches;
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
        const startTime = Date.now(); // TMP
        let lastTime = Date.now(); // TMP
        console.log(`extractNativePaletteFromImage: start.`); // TMP 

        const foundImageColoursDict = extractUniqueColours(image);
        let foundImageColours = Object.values(foundImageColoursDict).sort((a, b) => a.count < b.count);

        console.log(`extractNativePaletteFromImage: extractUniqueColours took: ${(Date.now() - lastTime)}ms, total: ${(Date.now() - startTime)}ms.`); // TMP 
        lastTime = Date.now(); // TMP 

        /** @type {ColourMapping} */
        let matchedColours;

        const targetSystemPalette = system === 'gg' ?
            ColourUtil.getFullGameGearPalette() :
            ColourUtil.getFullMasterSystemPalette();
        matchedColours = matchColours(targetSystemPalette, foundImageColours);

        console.log(`extractNativePaletteFromImage: matchColours took: ${(Date.now() - lastTime)}ms, total: ${(Date.now() - startTime)}ms.`); // TMP 
        lastTime = Date.now(); // TMP 

        // console.log('extractNativePaletteFromImage, matched colours', matchedColours);

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
                matchedColours = groupSimilarColours(matchedColours.matches, matchRangeFactor);
            }
        }

        console.log(`extractNativePaletteFromImage: create palette took: ${(Date.now() - lastTime)}ms, total: ${(Date.now() - startTime)}ms.`); // TMP 
        lastTime = Date.now(); // TMP 

        // console.log('extractNativePaletteFromImage, reduced colours', matchedColours);

        console.log(`extractNativePaletteFromImage: end: ${(Date.now() - lastTime)}ms, total: ${(Date.now() - startTime)}ms.`); // TMP 
        lastTime = Date.now(); // TMP 

        return matchedColours.matches;
    }


    /**
     * Matches all colours on an image to the closest one in a array of colours.
     * @param {HTMLImageElement} image - Input image.
     * @param {Colour[]} colours - Array of colours to match to.
     * @returns {ColourMatch[]}
     */
    static reduceImageColoursToList(image, colours) {

        const foundImageColoursDict = extractUniqueColours(image);
        const foundImageColours = Object.values(foundImageColoursDict).sort((a, b) => a.count < b.count);
        let matchedColours = matchColours(colours, foundImageColours);

        // console.log('extractNativePaletteFromImage, matched colours', matchedColours);

        // Reduce the matched colours to a 16 colour palette
        let matchRangeFactor = 0;
        while (matchedColours.matches.length > 16) {
            matchRangeFactor += 4;
            matchedColours = groupSimilarColours(matchedColours.matches, matchRangeFactor);
        }

        // console.log('extractNativePaletteFromImage, reduced colours', matchedColours);

        return matchedColours.matches;
    }


    /**
     * Converts an image and palette to a new project.
     * @param {HTMLImageElement} image - Image to convert.
     * @param {ColourMatch[]} palette - Palette of colours to use.
     * @param {ImageImportParams} params - Parameters.
     * @returns {Project}
     */
    static imageToProject(image, palette, params) {

        const paletteToIndex = {};
        palette.forEach((p, index) => {
            paletteToIndex[p.hex] = index;
        });

        /** @type {TileSpec} */
        const tiles = params?.tiles ?? {
            offsetX: 0, offsetY: 0,
            tilesWide: Math.ceil(image.width / 8),
            tilesHigh: Math.ceil(image.height / 8)
        };

        // Get virtual array
        const width = tiles.tilesWide * 8;
        const height = tiles.tilesHigh * 8;
        const virtualData = new Uint8ClampedArray(width * height);
        const imageData = this.extractImageData(image);

        const emptyStartPixels = tiles.offsetX < 0 ? tiles.offsetX : 0;
        const emptyEndPixels = tiles.offsetX + width > image.width ? (tiles.offsetX + width) - image.width : 0;
        const neededXPixelsFromImage = width - emptyStartPixels - emptyEndPixels;

        let virtualY = 0;
        for (let y = tiles.offsetY; y < height; y++) {
            // Is y inside image?
            if (y >= 0 && y < image.height) {
                const imageDataOffset = y * image.width;
                const imageDataData = imageData.data.slice(imageDataOffset * 4, (imageDataOffset + neededXPixelsFromImage) * 4);
                let virtualX = emptyStartPixels;
                let virtualOffset = (virtualY * width) + virtualX;
                for (let offset = 0; offset < imageDataData.length; offset += 4) {

                    const pixelValue = getPixelValue(imageDataData, offset);
                    const matchedPaletteIndex = paletteToIndex[pixelValue.hex];

                    const tileRow = Math.floor(virtualY / 8);
                    const tileCol = Math.floor(virtualX / 8);
                    const tileNum = (tileRow * tiles.tilesWide) + tileCol;
                    const tileOffset = tileNum * 64;

                    const thisTileRow = virtualY % 8;
                    const thisTileCol = virtualX % 8;
                    const thisTileOffset = (thisTileRow * 8) + thisTileCol;

                    const tileMapVirtualOffset = tileOffset + thisTileOffset;

                    virtualData[tileMapVirtualOffset] = matchedPaletteIndex;
                    virtualX++;
                    virtualOffset++;
                }
            }
            virtualY++;
        }
        const tileSet = TileSetFactory.fromArray(virtualData);
        tileSet.tileWidth = tiles.tilesWide;

        // Write tiles
        const system = params?.system ?? 'ms';
        const projectPalette = PaletteFactory.create('Imported palette', system);
        palette.forEach((p, index) => {
            projectPalette.setColour(index, {
                r: p.r, g: p.g, b: p.b
            })
        });
        for (let i = 0; i < 16; i++) {
            if (!projectPalette.getColour(i)) {
                projectPalette.setColour(i, { r: 0, g: 0, b: 0 });
            }
        }
        const paletteList = PaletteListFactory.create([projectPalette]);

        const projectName = params?.projectName ?? 'Imported image';

        const project = ProjectFactory.create(projectName, tileSet, paletteList);
        return project;
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

// /**
//  * Takes an input list of colour matches and reduces by grouping colours with other similar colours.
//  * @param {ColourMatch[]} coloursToGroup - Input list of colours to match.
//  * @param {number} matchRangeFactor - Match sensitivity, value between 1 and 255, colours with an R, G, and B value that all fall withing this range will be grouped.
//  * @returns {ColourMapping}
//  */
// function groupSimilarColours(coloursToGroup, matchRangeFactor) {
//     /** @type {ColourMapping} */
//     const result = { hexLookup: {}, matches: [] };

//     /** @type {ColourMatch[]} */
//     const coloursMostUsedToLeast = coloursToGroup.map(c => JSON.parse(JSON.stringify(c))).sort((a, b) => b.count > a.count);

//     for (let a = coloursMostUsedToLeast.length; a > 0; a--) {
//         const lessPopularColour = coloursMostUsedToLeast[a - 1];
//         if (!result.hexLookup[lessPopularColour.hex]) {

//             // Attempt to match this colour to a more popular one, loop backwards, 
//             // starting with most popular and checking lesser and lesser colours
//             // Also quit looping if the colour in question appears in the hex lookup
//             const matchRange = createMatchRange(lessPopularColour, matchRangeFactor);
//             for (let i = 0; !result.hexLookup[lessPopularColour.hex] && i < coloursMostUsedToLeast.length; i++) {
//                 const morePopularColour = coloursMostUsedToLeast[i];

//                 // If we're not comparing the same colour, and this base colour is similar, then merge 
//                 // the compare colour with the base colour
//                 if (morePopularColour.hex !== lessPopularColour.hex) {
//                     if (isSimilar(morePopularColour, matchRange)) {
//                         // Found a better match, merge this colour with the more popular colour
//                         if (!result.hexLookup[morePopularColour.hex]) {
//                             result.hexLookup[morePopularColour.hex] = morePopularColour.hex;
//                             morePopularColour.matchedColours.forEach(m => result.hexLookup[m] = morePopularColour.hex);
//                             result.matches.push(morePopularColour);
//                         }
//                         result.hexLookup[lessPopularColour.hex] = morePopularColour.hex;
//                         lessPopularColour.matchedColours.forEach(m => result.hexLookup[m] = morePopularColour.hex);
//                         morePopularColour.count += lessPopularColour.count;
//                         morePopularColour.matchedColours = morePopularColour.matchedColours.concat(lessPopularColour.matchedColours);
//                     }
//                 }

//             }
//             // If the colour wasn't matched to any more popular colour, 
//             // then it survives and is added to the result
//             if (!result.hexLookup[lessPopularColour.hex]) {
//                 result.hexLookup[lessPopularColour.hex] = lessPopularColour.hex;
//                 lessPopularColour.matchedColours.forEach(m => result.hexLookup[m] = lessPopularColour.hex);
//                 result.matches.push(lessPopularColour);
//             }
//         }

//     }

//     return result;
// }

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


/**
 * Creates an image from a canvas object.
 * @param {HTMLCanvasElement} canvas - Inoput canvas to make the image from.
 * @returns {HTMLImageElement}
 */
async function canvasToImageAsync(canvas) {
    return new Promise((resolve, reject) => {
        const dataUrl = canvas.toDataURL();
        const result = new Image();
        result.onload = () => {
            resolve(result);
        };
        result.src = dataUrl;
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

const allowedValueLookups = {};
const colourNames = ['r', 'g', 'b'];

/**
 * @param {ColourMatch} colour 
 * @param {number} range 
 * @returns {ColourRange}
 */
function createMatchRange(colour, rangeFactor) {
    // if (!allowedValueLookups[rangeFactor]) allowedValueLookups[rangeFactor] = {};
    // for (let i = 0; i < colourNames.length; i++) {
    //     const colourName = colourNames[i];
    //     const colourValue = colour[colourName];
    //     if (!allowedValueLookups[rangeFactor][colourValue]) {
    //         allowedValueLookups[rangeFactor][colourValue] = {};
    //         const minColourValue = Math.max(colourValue - rangeFactor / 2, 0);
    //         const maxColourValue = Math.min(colourValue + rangeFactor / 2, 255);
    //         for (let thisColourValue = minColourValue; thisColourValue <= maxColourValue; thisColourValue++) {
    //             allowedValueLookups[rangeFactor][colourValue][thisColourValue] = true;
    //         }
    //         // console.log(`Added range [${rangeFactor}][${colourValue}]`, allowedValueLookups[rangeFactor][colourValue]); // TMP 
    //     }
    // }
    // const a = new Uint8ClampedArray(6);
    // a[0] = Math.max(colour.r - rangeFactor / 2, 0);
    // a[1] = Math.min(colour.r + rangeFactor / 2, 255);
    // a[2] = Math.max(colour.g - rangeFactor / 2, 0);
    // a[3] = Math.min(colour.g + rangeFactor / 2, 255);
    // a[4] = Math.max(colour.b - rangeFactor / 2, 0);
    // a[5] = Math.min(colour.b + rangeFactor / 2, 255);
    return {
        // a: a,
        // lookupR: allowedValueLookups[rangeFactor][colour.r],
        // lookupG: allowedValueLookups[rangeFactor][colour.g],
        // lookupB: allowedValueLookups[rangeFactor][colour.b],
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
    // return true;
    // return range.lookupR[colour.r] && range.lookupG[colour.g] && range.lookupB[colour.b];
    // const a = range.a;
    // return (colour.r >= a[0] && colour.r <= a[1]) &&
    //     (colour.g >= a[2] && colour.g <= a[3]) &&
    //     (colour.b >= a[4] && colour.b <= a[5])
    //     ;
    // TODO - This is horribly slow and I don't know why
    return (colour.r >= range.rLow && colour.r <= range.rHigh) &&
        (colour.g >= range.gLow && colour.g <= range.gHigh) &&
        (colour.b >= range.bLow && colour.b <= range.bHigh)
        ;
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
 * @typedef {object} ImageDisplayParams
 * @property {TileSpec?} tiles
 * @property {number?} scale
 */

/**
 * @typedef {object} ImageImportParams
 * @property {TileSpec?} tiles
 * @property {string?} projectName
 * @property {string?} system
 */

/**
 * @typedef {object} TileSpec
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {number} tilesWide
 * @property {number} tilesHigh
 */

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