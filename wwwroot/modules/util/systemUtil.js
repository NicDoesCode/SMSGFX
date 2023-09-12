/**
 * Provides utility methods relating to target systems.
 */
export default class SystemUtil {

    
    /**
     * Gets the system capabilities.
     * @param {string} systemType - Type of system to get capabilities of, either 'smsgg', 'nes', or 'gb'.
     * @throws When the system type is unknown.
     * @returns {SystemCapabilities}
     */
    static getSystemCapabilities(systemType) {
        switch (systemType) {
            case 'smsgg': return {
                tileMap: {
                    horizontalFlip: true,
                    verticalFlip: true,
                    paletteSlots: 2,
                    transparencyIndex: null
                },
                sprite: {
                    horizontalFlip: false,
                    verticalFlip: false,
                    paletteSlots: 1,
                    transparencyIndex: 0
                }
            };
            case 'nes': return {
                tileMap: {
                    horizontalFlip: false,
                    verticalFlip: false,
                    paletteSlots: 4,
                    transparencyIndex: null
                },
                sprite: {
                    horizontalFlip: true,
                    verticalFlip: true,
                    paletteSlots: 4,
                    transparencyIndex: 0
                }
            };
            case 'gb': return {
                tileMap: {
                    horizontalFlip: false,
                    verticalFlip: false,
                    paletteSlots: 1,
                    transparencyIndex: null
                },
                sprite: {
                    horizontalFlip: true,
                    verticalFlip: true,
                    paletteSlots: 1,
                    transparencyIndex: 0
                }
            };
            default: throw new Error('Unknown system type.');
        }
    }


}

/**
 * Defines a system capabilities.
 * @typedef {Object} SystemCapabilities
 * @property {SystemCapability} tileMap - Tile map capabilities.
 * @property {SystemCapability} sprite - Sprite capabilities.
 * @exports
 */

/**
 * Defines a system capability.
 * @typedef {Object} SystemCapability
 * @property {boolean} horizontalFlip - Can the system flip tiles horizontally?
 * @property {boolean} verticalFlip - Can the system flip tiles vertically?
 * @property {boolean} paletteSlots - How many palette slots are supported?
 * @property {number?} transparencyIndex - Palette index to render as transparent.
 * @exports
 */