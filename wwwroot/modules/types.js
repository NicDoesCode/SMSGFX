/**
 * @typedef palleteItem
 * @type {object}
 * @property {paletteSystem} masterSystem - Sega Master System palette entry.
 * @property {paletteSystem} gameGear - Sega Game Gear palette entry.
 */

/**
 * @typedef paletteSystem
 * @type {object}
 * @property {string} nativeColour - The HEX encoded native colour.
 * @property {string} hex - Colour encoded in HEX format.
 * @property {number} r - Red value.
 * @property {number} g - Green value.
 * @property {number} b - Blue value.
 */


/** 
 * Represents a map of 8x8 tiles.
 * @typedef tileMap 
 * @type {object}
 * @property {Array<tile>} tiles
 * @property {number} tileWidth
 */

/**
 * Represents a single 8x8 tile.
 * @typedef tile
 * @type {Array<number>}
 */