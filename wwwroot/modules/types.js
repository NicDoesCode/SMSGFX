export const Types = {};

/**
 * @typedef {Object} SampleProject
 * @property {string?} sampleProjectId - Unique ID for the sample project.
 * @property {string?} title - Display name of the sample project.
 * @property {string?} system - System associated with the sample project.
 * @property {string?} url - Url to load the sample project from.
 * @property {string?} defaultTileMapId - Default tile map to load.
 * @exports
 */

/**
 * @typedef {Object} Coordinate
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 * @exports
 */

/**
 * @typedef {Object} SortEntry
 * @property {string} field - Name of the field.
 * @property {string} direction - Either 'asc' or 'desc'.
 * @exports
 */

/**
 * @typedef {Object} TileMapAttributes
 * @property {number?} transparencyIndex - Colour index that is to be rendered as transparent.
 * @property {number?} paletteSlots - Number of palette slots available to the tile map.
 * @property {number?} lockedIndex - Locked palette index, if this is set, this colour index will be repeated across all palettes.
 * @exports
 */
