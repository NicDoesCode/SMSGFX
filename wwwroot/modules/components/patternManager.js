export default class PatternManager {


    /**
     * Gets whether the pattern list been loaded.
     */
    get patternsLoaded() {
        return this.#patterns !== null;
    }


    /** @type {import("../types").Pattern[]?} */
    #patterns = null;


    /**
     * Initialises a new instance of the pattern manager.
     */
    constructor() {
    }


    /**
     * Asynchronously loads the list of patterns from the resource file.
     */
    async loadPatterns() {
        const path = './assets/patterns/patterns.json';
        const patternFetch = await fetch(path);
        const patternsJson = await patternFetch.json();
        this.#patterns = patternsJson;
    }

    /**
     * Gets a pattern from the list.
     * @param {number} index - Pattern index.
     */
    getPattern(index) {
        if (!this.patternsLoaded) throw new Error('Patterns have not yet been loaded.');
        if (index < 0 || index >= this.#patterns.length) throw new Error('Pattern index out of bounds.');
        return this.#patterns[index];
    }

    /**
     * Gets all patterns.
     */
    getAllPatterns() {
        return this.#patterns.slice();
    }


}