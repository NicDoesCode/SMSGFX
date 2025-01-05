/**
 * Provides utility methods relating to target systems.
 */
export default class SystemUtil {


    /**
     * Gets the graphic capabilities for a system.
     * @param {string} systemType - Type of system to get capabilities of, either 'smsgg', 'nes', or 'gb'.
     * @throws When the system type is unknown.
     * @returns {GraphicsCapabilities}
     */
    static getGraphicsCapabilities(systemType) {
        switch (systemType) {
            case 'smsgg': return {
                background: {
                    horizontalFlip: true,
                    verticalFlip: true,
                    totalPaletteSlots: 2,
                    transparencyIndex: null,
                    lockedPaletteIndex: null
                },
                sprite: {
                    horizontalFlip: false,
                    verticalFlip: false,
                    totalPaletteSlots: 1,
                    transparencyIndex: 0,
                    lockedPaletteIndex: null
                }
            };
            case 'nes': return {
                background: {
                    horizontalFlip: false,
                    verticalFlip: false,
                    totalPaletteSlots: 4,
                    transparencyIndex: null,
                    lockedPaletteIndex: 0
                },
                sprite: {
                    horizontalFlip: true,
                    verticalFlip: true,
                    totalPaletteSlots: 4,
                    transparencyIndex: 0,
                    lockedPaletteIndex: 0
                }
            };
            case 'gb': return {
                background: {
                    horizontalFlip: false,
                    verticalFlip: false,
                    totalPaletteSlots: 1,
                    transparencyIndex: null,
                    lockedPaletteIndex: null
                },
                sprite: {
                    horizontalFlip: true,
                    verticalFlip: true,
                    totalPaletteSlots: 1,
                    transparencyIndex: 0,
                    lockedPaletteIndex: null
                }
            };
            default: throw new Error('Unknown system type.');
        }
    }


    /**
     * Gets a specific graphic capability for a system.
     * @param {string} systemType - Type of system to get capabilities of, either 'smsgg', 'nes', or 'gb'.
     * @param {string} capabilityType - Type of capability type to get, either 'sprite', 's', 'background', or 'b'.
     * @throws When the system type is unknown.
     * @throws When the capability type is unknown.
     * @returns {GraphicsCapability}
     */
    static getGraphicsCapability(systemType, capabilityType) {
        const systemCapability = this.getGraphicsCapabilities(systemType);
        switch (capabilityType) {
            case 'sprite':
            case 's':
                return systemCapability.sprite;
            case 'background':
            case 'back':
            case 'bg':
            case 'b':
                return systemCapability.background;
            default: throw new Error('Unknown capability type.');
        }
    }


}

/**
 * Defines a system capabilities.
 * @typedef {Object} GraphicsCapabilities
 * @property {GraphicsCapability} background - Background graphic capabilities.
 * @property {GraphicsCapability} sprite - Sprite graphic capabilities.
 * @exports
 */

/**
 * Defines a system capability.
 * @typedef {Object} GraphicsCapability
 * @property {boolean} horizontalFlip - Can the system flip tiles horizontally?
 * @property {boolean} verticalFlip - Can the system flip tiles vertically?
 * @property {boolean} totalPaletteSlots - How many palette slots are supported?
 * @property {number?} transparencyIndex - Palette index to render as transparent.
 * @property {number?} lockedPaletteIndex - Index of the palette entry that is not changable.
 * @exports
 */