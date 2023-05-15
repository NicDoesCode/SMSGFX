import Palette from "../models/palette.js";
import Project from "../models/project.js";
import PaletteFactory from "../factory/paletteFactory.js";
import ProjectFactory from "../factory/projectFactory.js";
import ColourUtil from "./colourUtil.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";
import GeneralUtil from "./generalUtil.js";

const imageMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];

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
     * @returns {Promise<HTMLImageElement>}
     */
    static async resizeImageAsync(image, width, height) {
        return await new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 0, 0, width, height);

            const result = await canvasToImageAsync(canvas);
            resolve(result);
        });
    }

    /**
     * Gets a new image using a colour palette.
     * @param {ColourMatch} colours - Palette of colours.
     * @param {HTMLImageElement} sourceImage - Image to display.
     * @returns {HTMLImageElement}
     */
    static async renderImageFromPaletteAsync(colours, sourceImage) {
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
     * Calculates an image size given a maxiumum width and height that respects aspect ratio.
     * @param {HTMLImageElement} sourceImage - Image to calculate the size of.
     * @param {number} maximumWidth - Maximum width of the image.
     * @param {number} maximumHeight - Maximum height of the image.
     * @returns {{width: number, height: number}}
     */
    static calculateAspectRatioDimensions(sourceImage, maximumWidth, maximumHeight) {
        let width = sourceImage.width;
        let height = sourceImage.height;
        if (width > maximumWidth || height > maximumHeight) {
            const widthGreaterThanHeight = width > height;
            if (widthGreaterThanHeight) {
                let percent = 1 / width * maximumWidth;
                width = maximumWidth;
                height = Math.round(height * percent);
            } else {
                let percent = 1 / height * maximumHeight;
                width = Math.round(width * percent);
                height = maximumHeight;
            }
        }
        return { width, height };
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
     * @param {Palette} targetPalette - Palette containing the colours that must be matched.
     * @returns {ColourMatch[]}
     */
    static matchToPalette(image, targetPalette) {

        /** @type {Colour[]} */
        const targetColours = [];
        targetPalette.getColours().forEach(colour => {
            targetColours.push({
                r: colour.r,
                g: colour.g,
                b: colour.b,
                hex: ColourUtil.toHex(colour.r, colour.g, colour.b)
            });
        });

        const foundImageColoursDict = extractUniqueColours(image);
        const foundImageColours = Object.values(foundImageColoursDict).sort((a, b) => a.count > b.count);

        const matchedColours = matchColours(targetColours, foundImageColours);
        return matchedColours.matches;
    }


    /**
     * Extracts a 16 colour native system palette from an image.
     * @param {HTMLImageElement} image - Input image.
     * @param {string} system - Target system, either 'ms', 'gg', 'nes' or 'gb'.
     * @returns {Promise<ColourMatch[]>}
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
     * @param {string} system - Target system, either 'ms', 'gg', 'nes' or 'gb'.
     * @returns {ColourMatch[]}
     */
    static extractNativePaletteFromImage(image, system) {

        let targetSystemPalette;
        switch (system) {
            case 'ms': targetSystemPalette = ColourUtil.getFullMasterSystemPalette(); break;
            case 'gg': targetSystemPalette = ColourUtil.getFullGameGearPalette(); break;
            case 'nes': targetSystemPalette = ColourUtil.getFullNESPalette(); break;
            case 'gb': targetSystemPalette = ColourUtil.getFullGameBoyPalette(); break;
            default: throw new Error('Unknown system.');
        }

        const foundImageColoursDict = extractUniqueColours(image);
        let foundImageColours = Object.values(foundImageColoursDict).sort((a, b) => a.count < b.count);
        let shortenedColours = groupSimilarColours(foundImageColours, 64);
        let matchedColours = matchColours(targetSystemPalette, shortenedColours.matches);

        if (system === 'ms') {
            // When matching for the Master System, create the palette using the most used colours
            if (matchedColours.matches.length > 16) {
                const mostUsedColours = matchedColours.matches.sort((a, b) => b.count > a.count).slice(0, 16);
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

        // Reduce the matched colours to a 16 colour palette
        let matchRangeFactor = 0;
        while (matchedColours.matches.length > 16) {
            matchRangeFactor += 4;
            matchedColours = groupSimilarColours(matchedColours.matches, matchRangeFactor);
        }

        return matchedColours.matches;
    }


    /**
     * Converts an image and palette to a new project.
     * @param {HTMLImageElement} image - Image to convert.
     * @param {ColourMatch[]} colourMatchPalette - Palette of colours to use.
     * @param {ImageImportParams} params - Parameters.
     * @returns {Project}
     */
    static imageToProject(image, colourMatchPalette, params) {

        const paletteToIndex = {};
        colourMatchPalette.forEach((p, index) => {
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

        // Write tiles
        const system = params?.system ?? 'ms';
        const projectPalette = PaletteFactory.create(null, 'Imported palette', system);
        colourMatchPalette.forEach((p, index) => {
            projectPalette.setColour(index, {
                r: p.r, g: p.g, b: p.b
            })
        });
        const colourCount = projectPalette.getColours().length;
        for (let i = 0; i < colourCount; i++) {
            if (!projectPalette.getColour(i)) {
                projectPalette.setColour(i, { r: 0, g: 0, b: 0 });
            }
        }

        const project = ProjectFactory.create({
            title: params?.projectName ?? 'Imported image',
            tileSet: TileSetFactory.fromArray(virtualData),
            paletteList: PaletteListFactory.create([projectPalette])
        });
        switch (system) {
            case 'nes': project.systemType = 'nes'; break;
            case 'gb': project.systemType = 'gb'; break;
            default: project.systemType = 'smsgg'; break;
        }
        project.tileSet.tileWidth = tiles.tilesWide;
        return project;
    }


}


/**
 * Takes an array of colours and matches them to the closest source colour.
 * @param {Colour[]} desiredColours - Array of colour values to match the list to.
 * @param {ColourMatch[]} coloursToMatch - Array of colours to match to similar ones in the source list.
 * @param {number} rangeFactor 
 * @returns {ColourMapping}
 */
function matchColours(desiredColours, coloursToMatch) {

    // Takes an array of colours and maps them to an array of source colours.
    // A loop takes a source colour and checks all match colours against it.
    // If there are any match colours that are similar to the source colour, then 
    // we add the source colour to the output, and map the match colour against it.

    // In the case that no match colours were similar to the source colour, then
    // the source colour is omitted from the result.

    /** @type {ColourMatch[]} */
    let coloursLeftToMatch = JSON.parse(JSON.stringify(coloursToMatch));

    /** @type {ColourMapping} */
    const desiredColoursMapping = {
        hexLookup: {},
        matches: desiredColours.map(c => convertToColourMatch(JSON.parse(JSON.stringify(c))))
    };
    desiredColours.forEach((desiredColour) => {
        desiredColoursMapping.hexLookup[desiredColour.hex] = desiredColour.hex;
    });

    // Loop till all colours added or our similarity range is at maxiumum
    const matchRangeStep = 16;
    let matchRangeFactor = matchRangeStep;
    while (coloursLeftToMatch.length > 0 && matchRangeFactor < 256) {

        // Check each source colour for colours to match to
        desiredColoursMapping.matches.forEach((desiredColour) => {

            const matchRange = createMatchRange(desiredColour, matchRangeFactor);
            const unmatchedColours = [];

            coloursLeftToMatch.forEach(colourToMatch => {

                if (isSimilar(colourToMatch, matchRange)) {

                    desiredColoursMapping.hexLookup[colourToMatch.hex] = desiredColour.hex;

                    if (!desiredColour.matchedColours.includes(colourToMatch.hex)) {
                        desiredColour.matchedColours.push(colourToMatch.hex);
                    }

                    colourToMatch.matchedColours.forEach((childColourHex) => {
                        desiredColoursMapping.hexLookup[childColourHex] = desiredColour.hex;
                        if (!desiredColour.matchedColours.includes(childColourHex)) {
                            desiredColour.matchedColours.push(childColourHex);
                        }
                    });

                    desiredColour.count += colourToMatch.count;

                } else {
                    unmatchedColours.push(colourToMatch);
                }

            });

            coloursLeftToMatch = unmatchedColours;

        });

        matchRangeFactor += matchRangeStep;
    }

    return desiredColoursMapping;
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
 * Creates an image from a canvas object.
 * @param {HTMLCanvasElement} canvas - Inoput canvas to make the image from.
 * @returns {Promise<HTMLImageElement>}
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
        hex: ColourUtil.toHex(colour.r, colour.g, colour.b),
        count: 0,
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
 * @typedef {Object.<string, ColourMatch>} ColourMatchDictionary
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