$(() => {
    // makePaletteButtons();

    // restorePalette();
    // restoreTiles();

    // loadTiles();
});

// function makePaletteButtons() {

//     /** @type {HTMLTableElement} */
//     const table = document.getElementById('smsgfx-palette-selector');
//     /** @type {HTMLTableSectionElement} */
//     const body = table.querySelector('tbody');

//     for (let i = 0; i < 16; i++) {
//         const tr = document.createElement('tr');
//         tr.setAttribute('data-colour-index', i.toString());
//         // Number
//         const tdNum = document.createElement('td');
//         tdNum.innerHTML = i.toString();
//         tr.appendChild(tdNum);
//         // GG button
//         const tdGG = document.createElement('td');
//         const btnGG = document.createElement('button');
//         btnGG.classList.add('btn', 'btn-outline-secondary', 'smsgfx-palette-button');
//         btnGG.setAttribute('data-colour-index', i.toString());
//         btnGG.setAttribute('data-system', 'gg');
//         tdGG.appendChild(btnGG);
//         tr.appendChild(tdGG);
//         // SMS button
//         const tdSMS = document.createElement('td');
//         const btnSMS = document.createElement('button');
//         btnSMS.classList.add('btn', 'btn-outline-secondary', 'smsgfx-palette-button');
//         btnSMS.setAttribute('data-colour-index', i.toString());
//         btnSMS.setAttribute('data-system', 'ms');
//         tdSMS.appendChild(btnSMS);
//         tr.appendChild(tdSMS);

//         body.appendChild(tr);
//     }
// }

function restorePalette() {

    // /** @type {HTMLTextAreaElement} */
    // const tbLoadPaletteMS = document.getElementById('tbLoadPaletteMS');
    // if (localStorage.getItem('lastPaletteMS')) {
    //     tbLoadPaletteMS.value = localStorage.getItem('lastPaletteMS');
    // }
    // /** @type {HTMLTextAreaElement} */
    // const tbLoadPaletteGG = document.getElementById('tbLoadPaletteGG');
    // if (localStorage.getItem('lastPaletteGG')) {
    //     tbLoadPaletteGG.value = localStorage.getItem('lastPaletteGG');
    // }

    // if (tbLoadPaletteMS.value.length > 0 || tbLoadPaletteMS.value.length > 0) {
    //     loadPalette();
    // } else {
    //     updatePaletteButtons();
    // }

}

function restoreTiles() {

    /** @type {HTMLTextAreaElement} */
    const tbLoadTiles = document.getElementById('tbLoadTiles');
    if (localStorage.getItem('lastTiles')) {
        tbLoadTiles.value = localStorage.getItem('lastTiles');
    }

}

/** @type {string} */
let canvasImageData = null;
/** @type {Image} */
let canvasImage = null;

/** @type {Array<number>} */
let pixels = [];

/** @type {Array<palleteItem>} */
const palette = [...new Array(16)].map(() => { return { masterSystem: null, gameGear: null } });

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

    updatePaletteButtons();

    var modalElement = document.getElementById('smsgfx-palette-modal');
    var modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();
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

function loadTiles() {

    /** @type {HTMLTextAreaElement} */
    const tbLoadTiles = document.getElementById('tbLoadTiles');

    localStorage.setItem('lastTiles', tbLoadTiles.value);

    const tileBytes = new Array();
    const tilesRaw = tbLoadTiles.value.trim().toLowerCase();
    const tileLines = tilesRaw.replace('\r', '').split('\n').filter(v => v.startsWith('.db'));
    tileLines.forEach((tileLine, lineIndex) => {
        const lineBytes = tileLine.split('$').splice(1);
        lineBytes.forEach((lineByte, pixelIndex) => {
            let byte = parseInt(lineByte.trim(), 16);
            tileBytes.push(byte);
        });
    });

    const masks = [
        parseInt('10000000', 2),
        parseInt('01000000', 2),
        parseInt('00100000', 2),
        parseInt('00010000', 2),
        parseInt('00001000', 2),
        parseInt('00000100', 2),
        parseInt('00000010', 2),
        parseInt('00000001', 2)
    ];
    pixels = new Array();
    for (let i = 0; i < tileBytes.length; i++) {
        if (i % 4 === 0) {
            const byte0 = tileBytes[i + 0];
            const byte1 = tileBytes[i + 1];
            const byte2 = tileBytes[i + 2];
            const byte3 = tileBytes[i + 3];
            const px0 = ((byte0 & masks[0]) >> 7) | ((byte1 & masks[0]) >> 6) | ((byte2 & masks[0]) >> 5) | ((byte3 & masks[0]) >> 4);
            const px1 = ((byte0 & masks[1]) >> 6) | ((byte1 & masks[1]) >> 5) | ((byte2 & masks[1]) >> 4) | ((byte3 & masks[1]) >> 3);
            const px2 = ((byte0 & masks[2]) >> 5) | ((byte1 & masks[2]) >> 4) | ((byte2 & masks[2]) >> 3) | ((byte3 & masks[2]) >> 2);
            const px3 = ((byte0 & masks[3]) >> 4) | ((byte1 & masks[3]) >> 3) | ((byte2 & masks[3]) >> 2) | ((byte3 & masks[3]) >> 1);
            const px4 = ((byte0 & masks[4]) >> 3) | ((byte1 & masks[4]) >> 2) | ((byte2 & masks[4]) >> 1) | ((byte3 & masks[4]) >> 0);
            const px5 = ((byte0 & masks[5]) >> 2) | ((byte1 & masks[5]) >> 1) | ((byte2 & masks[5]) >> 0) | ((byte3 & masks[5]) << 1);
            const px6 = ((byte0 & masks[6]) >> 1) | ((byte1 & masks[6]) >> 0) | ((byte2 & masks[6]) << 1) | ((byte3 & masks[6]) << 2);
            const px7 = ((byte0 & masks[7]) >> 0) | ((byte1 & masks[7]) << 1) | ((byte2 & masks[7]) << 2) | ((byte3 & masks[7]) << 3);
            pixels.push(px0);
            pixels.push(px1);
            pixels.push(px2);
            pixels.push(px3);
            pixels.push(px4);
            pixels.push(px5);
            pixels.push(px6);
            pixels.push(px7);
        }
    }

    drawTiles();

}

function refreshImage() {
    canvasImageData = null;
    drawTiles();
}

function drawTiles() {

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('tbCanvas');
    const ctx = canvas.getContext('2d');

    if (canvasImageData === null) {

        const tiles = 6;
        let currentTileCol = 0;
        let currentTileRow = 0;
        let pixel = 0;
        for (let i = 0; i < pixels.length; i++) {
            if (i === 0) {
                currentTileRow = 0;
                currentTileCol = 0;
                pxRow = 0;
            } else if (i % 64 === 0) {
                if (currentTileCol >= tiles - 1) {
                    currentTileRow++;
                    currentTileCol = 0;
                    pxRow = 0;
                } else {
                    currentTileCol++;
                    pxRow = 0;
                }
            } else if (i % 8 === 0) {
                pxRow++;
            }
            pxCol = i % 8;
            let x = currentTileCol * 8 + pxCol;
            let y = currentTileRow * 8 + pxRow;

            /** @type {HTMLSelectElement} */
            const tbPaletteSystemSelect = document.getElementById('tbPaletteSystemSelect');
            const paletteSystemName = tbPaletteSystemSelect.value === 'gg' ? 'gameGear' : 'masterSystem';

            pixel = pixels[i];
            if (pixel < 16) {
                ctx.fillStyle = palette[pixel][paletteSystemName].hex;
            } else {
                ctx.fillStyle = 'yellow';
            }

            ctx.moveTo(0, 0);
            ctx.fillRect(x * 10, y * 10, 10, 10);
        }

        canvasImageData = canvas.toDataURL();

        canvasImage = new Image();
        canvasImage.src = canvasImageData;

    } else {

        canvasImage = new Image();
        canvasImage.onload = () => {
            ctx.drawImage(canvasImage, 0, 0);
        };
        canvasImage.src = canvasImageData;

    }

    return canvasImageData;

}

/**
 * @param {HTMLCanvasElement} canvas 
 * @param {MouseEvent} event 
 */
function canvasMouseMove(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    let coords = {
        x, y,
        pxX: x - (x % 10),
        pxY: y - (y % 10),
        tileX: x - (x % 80),
        tileY: y - (y % 80)
    }

    let ctx = canvas.getContext('2d');
    ctx.drawImage(canvasImage, 0, 0);
    ctx.moveTo(0, 0);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(coords.pxX, coords.pxY, 10, 10);
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(coords.tileX, coords.tileY, 80, 80);

    // Calculate pixel
    let fullRows = coords.tileY / 80;
    let fullCols = coords.tileX / 80;
    let rows = (coords.pxY / 10) % 8;
    let cols = (coords.pxX / 10) % 8;
    let index = (fullRows * 64 * 6) + (fullCols * 64) + (rows * 8) + cols;

    if (index >= 0 && index < pixels.length) {
        let pixel = pixels[index];
        let paletteItem = palette[pixel];
        let rows = document.querySelectorAll('#smsgfx-palette-selector table tr.table-secondary');
        rows.forEach(row => { row.classList.remove('table-secondary')});
        let row = document.querySelector(`#smsgfx-palette-selector table tr[data-colour-index="${pixel}"]`);
        row.classList.add('table-secondary');
    }

    console.log({ fullRows, fullCols, rows, cols, index });
}