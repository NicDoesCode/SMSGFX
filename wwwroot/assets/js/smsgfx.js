$(() => {

    /** @type {HTMLTextAreaElement} */
    const tbLoadPaletteMS = document.getElementById('tbLoadPaletteMS');
    if (localStorage.getItem('lastPaletteMS')) {
        tbLoadPaletteMS.value = localStorage.getItem('lastPaletteMS');
    }
    /** @type {HTMLTextAreaElement} */
    const tbLoadPaletteGG = document.getElementById('tbLoadPaletteGG');
    if (localStorage.getItem('lastPaletteGG')) {
        tbLoadPaletteGG.value = localStorage.getItem('lastPaletteGG');
    }

    if (tbLoadPaletteMS.value.length > 0 || tbLoadPaletteMS.value.length > 0) {
        loadPalette();
    } else {
        updatePaletteButtons();
    }

});

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

/** @type {Array<palleteItem>} */
const palette = [...new Array(16)].map(() => { return { masterSystem: null, gameGear: null } });
// const palette = new Array(16).fill({ masterSystem: null, gameGear: null });

function loadPalette() {

    /** @type {HTMLTextAreaElement} */
    const tbLoadPaletteMS = document.getElementById('tbLoadPaletteMS');
    /** @type {HTMLTextAreaElement} */
    const tbLoadPaletteGG = document.getElementById('tbLoadPaletteGG');

    localStorage.setItem('lastPaletteMS', tbLoadPaletteMS.value);
    localStorage.setItem('lastPaletteGG', tbLoadPaletteGG.value);

    const contentMS = tbLoadPaletteMS.value.trim().toLowerCase();
    if (contentMS.startsWith('.db ')) {

        const colours = contentMS.split('$').splice(1);
        colours.forEach((colour, index) => {
            const colourValue = parseInt(colour.trim(), 16);
            var r = Math.round(255 / 3 * (parseInt('00000011', 2) & colourValue));
            var g = Math.round(255 / 3 * (parseInt('00001100', 2) & colourValue) >> 2);
            var b = Math.round(255 / 3 * (parseInt('00110000', 2) & colourValue) >> 4);
            palette[index].masterSystem = {
                index: index,
                nativeColour: colourValue,
                r, g, b,
                hex: `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
            };
        });

    }

    const contentGG = tbLoadPaletteGG.value.trim().toLowerCase();
    if (contentGG.startsWith('.dw ')) {

        const colours = contentGG.split('$').splice(1);
        colours.forEach((colour, index) => {
            const colourValue = parseInt(colour.trim(), 16);
            var r = Math.round(255 / 15 * (parseInt('0000000000001111', 2) & colourValue));
            var g = Math.round(255 / 15 * (parseInt('0000000011110000', 2) & colourValue) >> 4);
            var b = Math.round(255 / 15 * (parseInt('0000111100000000', 2) & colourValue) >> 8);
            palette[index].gameGear = {
                index: index,
                nativeColour: colourValue,
                r, g, b,
                hex: `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
            };
        });

    }

    console.log(palette);

    updatePaletteButtons();

    // var modalElement = document.getElementById('smsgfx-palette-modal');
    // var modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    // modal.hide();
}

function updatePaletteButtons() {

    /** @type {NodeListOf<HTMLButtonElement>} */
    const buttons = document.querySelectorAll(`button.smsgfx-palette-button`);
    buttons.forEach(button => {
        const buttonIndex = parseInt(button.getAttribute('data-colour-index'));
        if (!isNaN(buttonIndex) && buttonIndex >= 0 && buttonIndex < palette.length) {

            let system = button.getAttribute('data-system');
            if (system !== 'ms') system = 'gg';

            const paletteItem = palette[buttonIndex];
            if (system === 'gg' && paletteItem.gameGear) {
                button.style.backgroundColor = paletteItem.gameGear.hex;
            } else if (system === 'ms' && paletteItem.masterSystem) {
                button.style.backgroundColor = paletteItem.masterSystem.hex;
            } else {
                button.style.backgroundColor = '#000000';
            }
        }
    });

}