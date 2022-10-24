import ProjectUtil from "../util/projectUtil.js";
import Palette from "../models/palette.js";
import PaletteList from "../models/paletteList.js";
import ImageUtil from "../util/imageUtil.js";
import ModalDialogue from "./modalDialogue.js";

export default class ImportImageModalDialogue extends ModalDialogue {


    get #aspectRatioLocked() {
        return this.#tbImportRatioLock.checked;
    }


    /** @type {HTMLButtonElement} */
    #btnImportFile;
    /** @type {HTMLInputElement} */
    #tbImportFile;
    /** @type {HTMLButtonElement} */
    #btnImportClipboard;
    /** @type {HTMLSelectElement} */
    #tbImportPaletteSelect;
    /** @type {HTMLInputElement} */
    #tbImportWidth;
    /** @type {HTMLInputElement} */
    #tbImportWidthPercent;
    /** @type {HTMLSelectElement} */
    #tbImportWidthUnit;
    /** @type {HTMLInputElement} */
    #tbImportHeight;
    /** @type {HTMLInputElement} */
    #tbImportHeightPercent;
    /** @type {HTMLSelectElement} */
    #tbImportHeightUnit;
    /** @type {HTMLInputElement} */
    #tbImportRatioLock;
    /** @type {HTMLInputElement} */
    #tbOffsetTop;
    /** @type {HTMLInputElement} */
    #tbOffsetLeft;
    /** @type {HTMLInputElement} */
    #tbTilesWide;
    /** @type {HTMLInputElement} */
    #tbTilesHigh;
    /** @type {HTMLInputElement} */
    #tbPreviewTileDisplay;
    /** @type {HTMLSelectElement} */
    #tbPreviewScale;
    /** @type {HTMLButtonElement} */
    #btnPreview;
    /** @type {HTMLButtonElement} */
    #btnImport;
    /** @type {HTMLElement} */
    #lblOriginalDimensons;
    /** @type {HTMLElement} */
    #lblTotalTiles;
    /** @type {HTMLCanvasElement} */
    #tbCanvasOriginal;
    /** @type {HTMLCanvasElement} */
    #tbCanvasPreview;

    /** @type {PaletteList} */
    #paletteList = null;
    /** @type {HTMLImageElement} */
    #originalImage = null;
    /** @type {HTMLImageElement} */
    #previewImage = null;


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);

        this.#btnImportFile = element.querySelector('[data-smsgfx-id=import-file-button]');
        this.#btnImportFile.onclick = () => this.#tbImportFile.click();

        this.#tbImportFile = element.querySelector('[data-smsgfx-id=import-file]');
        this.#tbImportFile.onchange = () => this.#handleFileInputChangeEvent();

        this.#btnImportClipboard = element.querySelector('[data-smsgfx-id=import-clipboard-button]');

        this.#tbImportPaletteSelect = element.querySelector('[data-smsgfx-id=import-palette-select]');

        this.#tbImportWidth = element.querySelector('[data-smsgfx-id=import-width]');
        this.#tbImportWidth.onchange = () => this.#handleDimensionPxChange('w');
        this.#tbImportWidthPercent = element.querySelector('[data-smsgfx-id=import-width-percent]');
        this.#tbImportWidthPercent.onchange = () => this.#handleDimensionPercentChange('w');
        this.#tbImportWidthUnit = element.querySelector('[data-smsgfx-id=import-unit-width]');
        this.#tbImportWidthUnit.onchange = () => this.#handleDimensionUnitChange('w');

        this.#tbImportHeight = element.querySelector('[data-smsgfx-id=import-height]');
        this.#tbImportHeight.onchange = () => this.#handleDimensionPxChange('h');
        this.#tbImportHeightPercent = element.querySelector('[data-smsgfx-id=import-height-percent]');
        this.#tbImportHeightPercent.onchange = () => this.#handleDimensionPercentChange('h');
        this.#tbImportHeightUnit = element.querySelector('[data-smsgfx-id=import-unit-height]');
        this.#tbImportHeightUnit.onchange = () => this.#handleDimensionUnitChange('h');

        this.#tbImportRatioLock = element.querySelector('[data-smsgfx-id=import-ratio-lock]');

        this.#tbOffsetTop = element.querySelector('[data-smsgfx-id=offset-top]');
        this.#tbOffsetTop.onchange = () => this.#handleOffsetOrTileChange(this.#tbOffsetTop);
        this.#tbOffsetLeft = element.querySelector('[data-smsgfx-id=offset-left]');
        this.#tbOffsetLeft.onchange = () => this.#handleOffsetOrTileChange(this.#tbOffsetLeft);
        this.#tbTilesWide = element.querySelector('[data-smsgfx-id=tiles-wide]');
        this.#tbTilesWide.onchange = () => this.#handleOffsetOrTileChange(this.#tbTilesWide);
        this.#tbTilesHigh = element.querySelector('[data-smsgfx-id=tiles-high]');
        this.#tbTilesHigh.onchange = () => this.#handleOffsetOrTileChange(this.#tbTilesHigh);

        this.#tbPreviewTileDisplay = element.querySelector('[data-smsgfx-id=preview-display-tiles]');
        this.#tbPreviewTileDisplay.onchange = () => this.#handlePreviewTileDisplayChange(this.#tbPreviewTileDisplay);

        this.#tbPreviewScale = element.querySelector('[data-smsgfx-id=preview-scale]');
        this.#tbPreviewScale.onchange = () => this.#handlePreviewScaleChange(this.#tbPreviewScale);

        this.#btnPreview = element.querySelector('[data-smsgfx-id=preview-button]');
        this.#btnPreview.onclick = async () => await this.#handlePreviewClick();

        this.#btnImport = element.querySelector('[data-smsgfx-id=import-button]');
        this.#btnImport.onclick = async () => await this.#handleImportClick();

        this.#lblOriginalDimensons = element.querySelector('[data-smsgfx-id=label-original-dimensions]');

        this.#lblTotalTiles = element.querySelector('[data-smsgfx-id=label-total-tiles]');

        this.#tbCanvasOriginal = element.querySelector('[data-smsgfx-id=import-original]');

        this.#tbCanvasPreview = element.querySelector('[data-smsgfx-id=import-preview]');
    }


    /**
     * Sets the state of the object.
     * @param {ImportImageModalState} state - State to set.
     */
    setState(state) {
        if (state?.paletteList) {
            this.#paletteList = state.paletteList;
            const options = this.#tbImportPaletteSelect.querySelectorAll('option');
            options.forEach(option => {
                if (option.value.startsWith('palette-')) {
                    option.remove();
                }
            });
            this.#paletteList.getPalettes().forEach((palette, index) => {
                const option = document.createElement('option');
                option.value = `palette-${index}`;
                option.innerText = `${palette.title} (${(palette.system === 'ms' ? 'Master System' : 'Game Gear')})`;
                option.setAttribute('data-smsgft-palette-index', index);
                this.#tbImportPaletteSelect.options.add(option);
            });
            if (this.#tbImportPaletteSelect.selectedIndex === -1) {
                this.#tbImportPaletteSelect.selectedIndex = 0;
                this.#tbImportPaletteSelect.onchange();
            }
        }
    }


    show() {
        super.show();
        this.reset();
    }

    reset() {
        this.#lblOriginalDimensons.innerText = `...`;
        this.#lblTotalTiles.innerText = `...`;
        this.#tbImportFile.value = null;
        resetCanvas(this.#tbCanvasOriginal);
        resetCanvas(this.#tbCanvasPreview);
    }

    resetPreview() {

    }


    #handleDimensionPxChange(dimension) {
        if (!dimension || !['w', 'h'].includes(dimension)) throw new Error('Invalid dimension.');
        if (!this.#originalImage) throw new Error('No image loaded.');

        const inputPx = dimension === 'w' ? this.#tbImportWidth : this.#tbImportHeight;
        const inputPercent = dimension === 'w' ? this.#tbImportWidthPercent : this.#tbImportHeightPercent;

        // Error check
        inputPx.classList.remove('is-invalid');
        inputPercent.classList.remove('is-invalid');

        const value = parseInt(inputPx.value);

        if (isNaN(value) || value < 1 || value > 10000) {
            inputPx.classList.add('is-invalid');
            inputPercent.classList.add('is-invalid');
            throw new Error('Invalid pixel dimension entered.');
        }

        // Set percentage value
        const percentage = (1 / this.#originalImage.width) * value;
        inputPercent.value = Math.round(percentage * 100);

        // Set other value if aspect locked
        if (this.#tbImportRatioLock.checked) {
            const antiInputPx = dimension === 'w' ? this.#tbImportHeight : this.#tbImportWidth;
            const antiInputPercent = dimension === 'w' ? this.#tbImportHeightPercent : this.#tbImportWidthPercent;
            const antiInputAxisPx = dimension === 'w' ? this.#originalImage.height : this.#originalImage.width;

            antiInputPx.value = Math.round(antiInputAxisPx * percentage);
            antiInputPercent.value = Math.round(percentage * 100);
        }

        this.#updateOriginalImageDisplayAsync();
    }

    #handleDimensionPercentChange(dimension) {
        if (!dimension || !['w', 'h'].includes(dimension)) throw new Error('Invalid dimension.');
        if (!this.#originalImage) throw new Error('No image loaded.');

        const inputPx = dimension === 'w' ? this.#tbImportWidth : this.#tbImportHeight;
        const inputPercent = dimension === 'w' ? this.#tbImportWidthPercent : this.#tbImportHeightPercent;

        // Error check
        inputPx.classList.remove('is-invalid');
        inputPercent.classList.remove('is-invalid');

        const value = parseInt(inputPercent.value);

        if (isNaN(value) || value < 1 || value > 1000) {
            inputPx.classList.add('is-invalid');
            inputPercent.classList.add('is-invalid');
            throw new Error('Invalid percentage entered.');
        }

        // Set px value
        const percentage = 1 / 100 * value;
        const axisPx = dimension === 'w' ? this.#originalImage.width : this.#originalImage.height;
        inputPx.value = Math.round(axisPx * percentage);

        // Set other value if aspect locked
        if (this.#tbImportRatioLock.checked) {
            const antiInputPx = dimension === 'w' ? this.#tbImportHeight : this.#tbImportWidth;
            const antiInputPercent = dimension === 'w' ? this.#tbImportHeightPercent : this.#tbImportWidthPercent;
            const antiAxisPx = dimension === 'w' ? this.#originalImage.height : this.#originalImage.width;

            antiInputPx.value = Math.round(antiAxisPx * percentage);
            antiInputPercent.value = value;
        }

        this.#updateOriginalImageDisplayAsync();
    }

    #handleDimensionUnitChange(dimension) {
        const widthUnit = dimension === 'w' ? this.#tbImportWidthUnit : this.#tbImportHeightUnit;
        const px = dimension === 'w' ? this.#tbImportWidth : this.#tbImportHeight;
        const percent = dimension === 'w' ? this.#tbImportWidthPercent : this.#tbImportHeightPercent;

        if (widthUnit.value === 'px') {
            px.classList.remove('visually-hidden');
            percent.classList.add('visually-hidden');
        } else {
            px.classList.add('visually-hidden');
            percent.classList.remove('visually-hidden');
        }
    }

    #handleOffsetOrTileChange(sender) {
        const top = parseInt(this.#tbOffsetTop.value);
        const left = parseInt(this.#tbOffsetLeft.value);
        const wide = parseInt(this.#tbTilesWide.value);
        const high = parseInt(this.#tbTilesHigh.value);

        const inputs = [this.#tbOffsetTop, this.#tbOffsetLeft, this.#tbTilesWide, this.#tbTilesHigh];

        inputs.forEach(input => input.classList.remove('is-invalid'));

        if (isNaN(top) || isNaN(left) || isNaN(wide) || isNaN(high)) {
            inputs.forEach(input => input.classList.add('is-invalid'));
            return;
        }
        if (wide < 1 || high < 1) {
            inputs.forEach(input => input.classList.add('is-invalid'));
            return;
        }

        this.#updateOriginalImageDisplayAsync();
    }

    #handlePreviewTileDisplayChange(sender) {
        this.#updateOriginalImageDisplayAsync();
    }

    #handlePreviewScaleChange(sender) {
        this.#updateOriginalImageDisplayAsync();
    }

    async #handleFileInputChangeEvent() {
        if (this.#tbImportFile.files.length > 0) {
            this.#tbImportFile.setAttribute('disabled', '');
            this.#btnPreview.setAttribute('disabled', '');

            this.#originalImage = await ImageUtil.fileInputToImageAsync(this.#tbImportFile);
            // ImageUtil.displayImageOnCanvas(this.#tbCanvasOriginal, this.#originalImage);

            this.#lblOriginalDimensons.innerText = `${this.#originalImage.width}x${this.#originalImage.height}`;

            const wTiles = Math.ceil(this.#originalImage.width / 8);
            const hTiles = Math.ceil(this.#originalImage.height / 8);
            const totalTiles = wTiles * hTiles;

            this.#tbImportWidth.value = this.#originalImage.width;
            this.#tbImportWidthPercent.value = 100;
            this.#tbImportHeight.value = this.#originalImage.height;
            this.#tbImportHeightPercent.value = 100;

            this.#tbOffsetTop.value = 0;
            this.#tbOffsetLeft.value = 0;
            this.#tbTilesWide.value = wTiles;
            this.#tbTilesHigh.value = hTiles;

            this.#lblTotalTiles.innerText = totalTiles;
            resetCanvas(this.#tbCanvasPreview);

            this.#updateOriginalImageDisplayAsync();
            this.#previewImage = new Image(this.#originalImage.width, this.#originalImage.height);
            ImageUtil.displayImageOnCanvas(this.#tbCanvasPreview, this.#previewImage);

            this.#btnPreview.removeAttribute('disabled');
            this.#tbImportFile.removeAttribute('disabled');
        }
    }

    async #handlePreviewClick() {
        if (this.#tbImportFile.files.length > 0) {
            this.#tbImportFile.setAttribute('disabled', '');
            this.#btnPreview.setAttribute('disabled', '');

            const width = parseInt(this.#tbImportWidth.value);
            const height = parseInt(this.#tbImportHeight.value);
            const scale = parseInt(this.#tbPreviewScale.value);
            const previewTiles = this.#tbPreviewTileDisplay.checked;

            const originalImage = await ImageUtil.resizeImageAsync(this.#originalImage, width, height);
            // const originalImage = await ImageUtil.fileInputToImageAsync(this.#tbImportFile);

            /** @type {ColourMatch[]} */
            let importColours;
            const selectedImportColours = this.#tbImportPaletteSelect.value;
            if (['ms', 'gg'].includes(selectedImportColours)) {
                importColours = await ImageUtil.extractNativePaletteFromImageAsync(originalImage, selectedImportColours);
            } else {
                const option = this.#tbImportPaletteSelect.selectedOptions.item(0);
                const paletteIndex = parseInt(option.getAttribute('data-smsgft-palette-index'));
                const palette = this.#paletteList.getPalette(paletteIndex);
                importColours = await ImageUtil.matchToPaletteAsync(originalImage, palette);
            }

            // const newPalette = await ImageUtil.extractNativePaletteFromImageAsync(originalImage, selectedImportColours);
            const colourReducedImage = await ImageUtil.getImageFromPaletteAsync(importColours, originalImage);
            const previewImage = colourReducedImage;
            // const previewImage = await ImageUtil.createTilePreviewImageAsync(colourReducedImage);

            // ImageUtil.displayImageOnCanvas(this.#tbCanvasPreview, previewImage);

            /** @type {import("../util/imageUtil.js").ImageDisplayParams} */
            const tiles = {
                offsetX: parseInt(this.#tbOffsetLeft.value),
                offsetY: parseInt(this.#tbOffsetTop.value),
                tilesWide: parseInt(this.#tbTilesWide.value),
                tilesHigh: parseInt(this.#tbTilesHigh.value)
            };

            ImageUtil.displayImageOnCanvas(this.#tbCanvasPreview, previewImage, {
                scale: scale,
                tiles: previewTiles ? tiles : null
            });

            this.#btnPreview.removeAttribute('disabled');
            this.#tbImportFile.removeAttribute('disabled');
        }
    }


    async #handleImportClick() {
        if (this.#tbImportFile.files.length > 0) {
            this.#tbImportFile.setAttribute('disabled', '');
            this.#btnPreview.setAttribute('disabled', '');

            const width = parseInt(this.#tbImportWidth.value);
            const height = parseInt(this.#tbImportHeight.value);

            const originalImage = await ImageUtil.resizeImageAsync(this.#originalImage, width, height);
            let system = 'ms';

            /** @type {ColourMatch[]} */
            let importColours;
            const selectedImportColours = this.#tbImportPaletteSelect.value;
            if (['ms', 'gg'].includes(selectedImportColours)) {
                system = selectedImportColours;
                importColours = await ImageUtil.extractNativePaletteFromImageAsync(originalImage, selectedImportColours);
            } else {
                const option = this.#tbImportPaletteSelect.selectedOptions.item(0);
                const paletteIndex = parseInt(option.getAttribute('data-smsgft-palette-index'));
                const palette = this.#paletteList.getPalette(paletteIndex);
                system = palette.system;
                importColours = await ImageUtil.matchToPaletteAsync(originalImage, palette);
            }

            const colourReducedImage = await ImageUtil.getImageFromPaletteAsync(importColours, originalImage);

            /** @type {import("../util/imageUtil.js").ImageImportParams} */
            const params = {
                projectName: this.#tbImportFile.files[0].name,
                system: system,
                tiles: {
                    offsetX: parseInt(this.#tbOffsetLeft.value),
                    offsetY: parseInt(this.#tbOffsetTop.value),
                    tilesWide: parseInt(this.#tbTilesWide.value),
                    tilesHigh: parseInt(this.#tbTilesHigh.value)
                }
            };

            const project = ImageUtil.imageToProject(colourReducedImage, importColours, params);
            ProjectUtil.saveToFile(project);

            console.log(project);

            this.#btnPreview.removeAttribute('disabled');
            this.#tbImportFile.removeAttribute('disabled');
        }
    }


    async #updateOriginalImageDisplayAsync() {

        const width = parseInt(this.#tbImportWidth.value);
        const height = parseInt(this.#tbImportHeight.value);
        const scale = parseInt(this.#tbPreviewScale.value);
        const previewTiles = this.#tbPreviewTileDisplay.checked;

        const resizedImage = await ImageUtil.resizeImageAsync(this.#originalImage, width, height);

        /** @type {import("../util/imageUtil.js").ImageDisplayParams} */
        const tiles = {
            offsetX: parseInt(this.#tbOffsetLeft.value),
            offsetY: parseInt(this.#tbOffsetTop.value),
            tilesWide: parseInt(this.#tbTilesWide.value),
            tilesHigh: parseInt(this.#tbTilesHigh.value)
        };

        ImageUtil.displayImageOnCanvas(this.#tbCanvasOriginal, resizedImage, {
            scale: scale,
            tiles: previewTiles ? tiles : null
        });
    }


}

function resetCanvas(canvas) {
    // canvas.width = 10;
    // canvas.height = 10;
    canvas.getContext('2d').fillStyle = 'white';
    canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
}


/**
 * Import image modal state object.
 * @typedef {object} ImportImageModalState
 * @property {PaletteList?} paletteList - List of palettes to make available for import.
 */

