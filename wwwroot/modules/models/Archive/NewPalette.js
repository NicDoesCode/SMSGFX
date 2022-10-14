// // /**
// //  * @typedef NewPalette
// //  * @type {object}
// //  * @property {string} name - Name of the palette.
// //  * @property {string} system - Master System or Game Gear ('ms' or 'gg', by default 'ms' is assumed).
// //  * @property {NewPaletteColour[]} colours - The colour palette.
// //  * @exports
// //  */

// import NewPaletteColour from "./NewPaletteColour.js";

// export default class NewPalette {

//     get name() { return this.#name; }
//     set name(value) {
//         if (!value) throw 'Invalid name provided.';
//         this.#name = value;
//     }

//     get system() { return this.#system; }
//     set system(value) {
//         if (!value && value !== 'ms' && value !== 'gg') throw 'Invalid system provided, must be "ms" or "gg".';
//         this.#system = value;
//     }

//     get colours() {
        
//     }

//     /** @type {string} */ #name;
//     /** @type {string} */ #system;
//     /** @type {NewPaletteColour[]} */ #colours = new Array(16);

//     constructor() {

//     }
// }