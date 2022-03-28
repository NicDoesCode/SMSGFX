export default class Palette {


    /**
     * Gets the colours for this palette.
     */
    get colours() {
        return this.#colours;
    }

    /**
     * Gets the system for this palette (either 'ms' or 'gg').
     */
    get system() {
        return this.#system;
    }
    set system(value) {
        if (value && (value === 'ms' || value === 'gg')) {
            this.#system = value;
        }
        throw new Error('System must be either "ms" or "gg".');
    }


    /** @type {number[]} */
    #colours = new Array(16);
    #system = '';


    /**
     * Create a new Palette class.
     * @param {number[]=} colours - Array of colours for the palette.
     * @param {string=} system - Either 'ms' or 'gg'.
     */
    constructor(colours, system) {
        if (!colours || typeof colours !== 'array') throw new Error('Invalid parameter value: colours.');
        if (!system || (system !== 'ms' && system !== 'gg')) throw new Error('Invalid parameter value: system.');
        this.#colours = colours.splice(0);
        this.#system = system;
    }


    /**
     * Serialises the palette object to a string.
     * @returns {string}
     */
    toJSON() {
        return {
            colours: this.#colours,
            system: this.#system
        };
    }

    static fromJSON(jsonString) {
        if (!jsonString || jsonString !== 'string') throw new Error('Please pass a JSON string.');
        const parsed = JSON.parse(jsonString);
        return new Palette(parsed.colours, parsed.system);
    }

    
}