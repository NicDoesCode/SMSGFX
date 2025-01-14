export const Types = {};
export const DropPosition = {
    before: 'before',
    after: 'after'
}

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
 * @typedef {Object} Bounds
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 * @property {number} width - Width of the dimension.
 * @property {number} height - Height of the dimension.
 * @exports
 */

/**
 * @typedef {Object} Dimension
 * @property {number} width - Width of the dimension.
 * @property {number} height - Height of the dimension.
 * @exports
 */

/**
 * @typedef {Object} GridDimension
 * @property {number} rows - Amount of rows in the dimension.
 * @property {number} columns - Amount of columns in the dimension.
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
 * @typedef {Object} ColourInformation
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @exports
 */

/** Pattern definition that can be painted onto an image.
 * @typedef {Object} Pattern
 * @property {string} name - The pattern's name.
 * @property {number[]} pattern - The actual pattern, 2 dimensional array of numbers, 0 = transparent, 1 = first colour, 2 = second colour.
 * @exports
 */