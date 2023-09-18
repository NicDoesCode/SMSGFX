import PaletteList from "../../models/paletteList.js";
import ImageUtil from "../../util/imageUtil.js";
import ModalDialogue from "./../modalDialogue.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import TileSet from "../../models/tileSet.js";
import TemplateUtil from "../../util/templateUtil.js";
import PaletteFactory from "../../factory/paletteFactory.js";

const EVENT_SourceImageUpdated = 'EVENT_SourceImageUpdated';
const EVENT_PreviewImageUpdated = 'EVENT_PreviewImageUpdated';

const MAX_INITIAL_IMPORT_WIDTH = 256;

export default class ImportImageModalDialogue extends ModalDialogue {

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
    /** @type {HTMLButtonElement} */
    #btnImportWidthRevert;
    /** @type {HTMLInputElement} */
    #tbImportHeight;
    /** @type {HTMLInputElement} */
    #tbImportHeightPercent;
    /** @type {HTMLSelectElement} */
    #tbImportHeightUnit;
    /** @type {HTMLButtonElement} */
    #btnImportHeightRevert;
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
    #btnImportAsNew;
    /** @type {HTMLButtonElement} */
    #btnImportIntoExisting;
    /** @type {HTMLCanvasElement} */
    #tbCanvasSource;
    /** @type {HTMLCanvasElement} */
    #tbCanvasPreview;

    /** @type {PaletteList} */
    #paletteList = null;
    /** @type {HTMLImageElement} */
    #sourceImage = null;
    /** @type {HTMLImageElement} */
    #previewImage = null;
    /** @type {import("../util/imageUtil.js").ColourMatch[]} */
    #previewColours = null;
    /** @type {string} */
    #fileName = null;

    /** @type {HTMLElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();
        this.#dispatcher.on(EVENT_SourceImageUpdated, () => this.#handleSourceImageUpdatedAsync());
        this.#dispatcher.on(EVENT_PreviewImageUpdated, () => this.#handlePreviewImageUpdatedAsync());

        this.#btnImportFile = element.querySelector('[data-smsgfx-id=import-file-button]');
        this.#btnImportFile.onclick = () => this.#tbImportFile.click();

        this.#tbImportFile = element.querySelector('[data-smsgfx-id=import-file]');
        this.#tbImportFile.onchange = async () => await this.#handleFileInputChangeEvent();

        this.#btnImportClipboard = element.querySelector('[data-smsgfx-id=import-clipboard-button]');
        this.#btnImportClipboard.onclick = () => this.#handleImportClipboardClick();

        this.#tbImportPaletteSelect = element.querySelector('[data-smsgfx-id=import-palette-select]');
        this.#tbImportPaletteSelect.onchange = () => this.#handleImportPaletteSelectChange();

        this.#tbImportWidth = element.querySelector('[data-smsgfx-id=import-width]');
        this.#tbImportWidth.onchange = () => this.#handleDimensionPxChange('w');
        this.#tbImportWidthPercent = element.querySelector('[data-smsgfx-id=import-width-percent]');
        this.#tbImportWidthPercent.onchange = () => this.#handleDimensionPercentChange('w');
        this.#tbImportWidthUnit = element.querySelector('[data-smsgfx-id=import-unit-width]');
        this.#tbImportWidthUnit.onchange = () => this.#handleDimensionUnitChange('w');
        this.#btnImportWidthRevert = element.querySelector('[data-smsgfx-id=import-width-revert]');
        this.#btnImportWidthRevert.onclick = () => this.#handleDimensionRevert('w');

        this.#tbImportHeight = element.querySelector('[data-smsgfx-id=import-height]');
        this.#tbImportHeight.onchange = () => this.#handleDimensionPxChange('h');
        this.#tbImportHeightPercent = element.querySelector('[data-smsgfx-id=import-height-percent]');
        this.#tbImportHeightPercent.onchange = () => this.#handleDimensionPercentChange('h');
        this.#tbImportHeightUnit = element.querySelector('[data-smsgfx-id=import-unit-height]');
        this.#tbImportHeightUnit.onchange = () => this.#handleDimensionUnitChange('h');
        this.#btnImportHeightRevert = element.querySelector('[data-smsgfx-id=import-height-revert]');
        this.#btnImportHeightRevert.onclick = () => this.#handleDimensionRevert('h');

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

        this.#btnImportAsNew = element.querySelector('[data-smsgfx-id=button-import-as-new-project]');
        this.#btnImportAsNew.onclick = async () => await this.#handleImportClick('new');

        this.#btnImportIntoExisting = element.querySelector('[data-smsgfx-id=button-import-into-existing-project]');
        this.#btnImportIntoExisting.onclick = async () => await this.#handleImportClick('existing');

        this.#tbCanvasSource = element.querySelector('[data-smsgfx-id=canvas-source]');

        this.#tbCanvasPreview = element.querySelector('[data-smsgfx-id=canvas-preview]');

        this.#wireUpTabs();
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<ImportImageModalDialogue>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/importImageModalDialogue', element);
        return new ImportImageModalDialogue(componentElement);
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
                option.innerText = `${palette.title} (${(palette.system === 'ms' ? 'Master System' : palette.system === 'gg' ? 'Game Gear' : 'Game Boy')})`;
                option.setAttribute('data-smsgfx-palette-index', index);
                this.#tbImportPaletteSelect.options.add(option);
            });
            if (this.#tbImportPaletteSelect.selectedIndex === -1) {
                this.#tbImportPaletteSelect.selectedIndex = 0;
                this.#tbImportPaletteSelect.onchange();
            }
        }
        if (state?.file) {
            this.#loadSourceImageFileAsync(state?.file);
        }

        this.#updateInputEnabledState();
    }


    show() {
        super.show();
        this.#reset();
    }


    /**
     * Callback for when the dialogue is confirmed.
     * @param {ImportProjectModelConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        this.#dispatcher.on(super.events.onConfirm, callback);
    }


    /**
     * Triggers the on confirm event.
     * @param {ImportProjectModelConfirmEventArgs} args - Arguments.
     */
    #triggerOnConfirm(args) {
        this.#dispatcher.dispatch(super.events.onConfirm, args);
    }


    #reset() {
        this.#resetSource();
        this.#resetPreviewImage();
        resetCanvas(this.#tbCanvasSource);
        resetCanvas(this.#tbCanvasPreview);
        this.#updateInputEnabledState();
    }

    #resetSource() {
        this.#sourceImage = null;
        this.#tbImportWidth.value = '';
        this.#tbImportHeight.value = '';
    }

    #resetPreviewImage() {
        this.#previewImage = null;
        this.#previewColours = null;
    }

    #updateInputEnabledState() {
        const disabledState = !this.#sourceImageIsSet();
        this.#tbImportPaletteSelect.disabled = disabledState;
        this.#tbImportWidth.disabled = disabledState;
        this.#tbImportWidthPercent.disabled = disabledState;
        this.#tbImportWidthUnit.disabled = disabledState;
        this.#btnImportWidthRevert.disabled = disabledState;
        this.#tbImportHeight.disabled = disabledState;
        this.#tbImportHeightPercent.disabled = disabledState;
        this.#tbImportHeightUnit.disabled = disabledState;
        this.#btnImportHeightRevert.disabled = disabledState;
        this.#tbImportRatioLock.disabled = disabledState;
        this.#tbOffsetTop.disabled = disabledState;
        this.#tbOffsetLeft.disabled = disabledState;
        this.#tbTilesHigh.disabled = disabledState;
        this.#tbTilesWide.disabled = disabledState;
        this.#tbPreviewTileDisplay.disabled = disabledState;
        this.#tbPreviewScale.disabled = disabledState;

        const previewDisabledState = !this.#sourceImageIsSet() || !this.#previewImageIsSet();
        this.#btnImportAsNew.disabled = previewDisabledState;
        this.#btnImportIntoExisting.disabled = previewDisabledState;

        this.#tbImportWidth.classList.remove('text-bg-warning');
        this.#tbImportHeight.classList.remove('text-bg-warning');
        this.#tbImportWidthPercent.classList.remove('text-bg-warning');
        this.#tbImportHeightPercent.classList.remove('text-bg-warning');
        if (parseInt(this.#tbImportWidth.value) > 128 || parseInt(this.#tbImportHeight.value) > 128) {
            this.#tbImportWidth.classList.add('text-bg-warning');
            this.#tbImportHeight.classList.add('text-bg-warning');
            this.#tbImportWidthPercent.classList.add('text-bg-warning');
            this.#tbImportHeightPercent.classList.add('text-bg-warning');
        }
    }

    #recalculateTileAndOriginInputs(width, height) {
        if (this.#sourceImageIsSet()) {
            const wTiles = Math.ceil(width / 8);
            const hTiles = Math.ceil(height / 8);

            this.#tbImportWidth.value = width;
            this.#tbImportWidthPercent.value = 100;
            this.#tbImportWidthUnit.selectedIndex = 0;
            this.#tbImportHeight.value = height;
            this.#tbImportHeightPercent.value = 100;
            this.#tbImportHeightUnit.selectedIndex = 0;

            this.#tbOffsetTop.value = 0;
            this.#tbOffsetLeft.value = 0;
            this.#tbTilesWide.value = wTiles;
            this.#tbTilesHigh.value = hTiles;
        }
    }


    #wireUpTabs() {
        const pnlSource = this.#element.querySelector('[data-smsgfx-id=container-canvas-source]');
        const pnlPreview = this.#element.querySelector('[data-smsgfx-id=container-canvas-preview]');
        const tabs = this.#element.querySelectorAll('[data-smsgfx-type=preview-tab]');
        tabs.forEach(tab => {
            const value = tab.getAttribute('data-smsgfx-value');
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                [pnlSource, pnlPreview].forEach(p => p.classList.remove('visually-hidden'));
                if (value === 'preview-mode-original') {
                    this.#tbCanvasSource.width = 800;
                    this.#tbCanvasPreview.width = 800;
                    pnlSource.classList.remove('visually-hidden');
                    pnlPreview.classList.add('visually-hidden');
                } else if (value === 'preview-mode-preview') {
                    this.#tbCanvasSource.width = 800;
                    this.#tbCanvasPreview.width = 800;
                    pnlSource.classList.add('visually-hidden');
                    pnlPreview.classList.remove('visually-hidden');
                } else if (value === 'preview-mode-split') {
                    this.#tbCanvasSource.width = 395;
                    this.#tbCanvasPreview.width = 395;
                    pnlSource.classList.remove('visually-hidden');
                    pnlPreview.classList.remove('visually-hidden');
                }
                this.#renderSourceImageAsync();
                this.#renderPreviewImageAsync();
            };
        });
        this.#element.querySelector('[data-smsgfx-type=preview-tab][data-smsgfx-value=preview-mode-split]').click();
    }


    async #handleImportPaletteSelectChange() {
        if (this.#sourceImageIsSet()) {
            this.#resetPreviewImage();
            await this.#updatePreviewImageAsync();
        }
    }

    async #handleDimensionPxChange(dimension) {
        if (this.#sourceImageIsSet()) {
            this.#showImageSizeWarning(false);

            if (!dimension || !['w', 'h'].includes(dimension)) throw new Error('Invalid dimension.');
            if (!this.#sourceImage) throw new Error('No image loaded.');

            this.#previewImage = null;

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
            const percentage = (1 / this.#sourceImage.width) * value;
            inputPercent.value = Math.round(percentage * 100);

            // Set other value if aspect locked
            if (this.#tbImportRatioLock.checked) {
                const antiInputPx = dimension === 'w' ? this.#tbImportHeight : this.#tbImportWidth;
                const antiInputPercent = dimension === 'w' ? this.#tbImportHeightPercent : this.#tbImportWidthPercent;
                const antiInputAxisPx = dimension === 'w' ? this.#sourceImage.height : this.#sourceImage.width;

                antiInputPx.value = Math.round(antiInputAxisPx * percentage);
                antiInputPercent.value = Math.round(percentage * 100);
            }

            const width = parseInt(this.#tbImportWidth.value);
            const height = parseInt(this.#tbImportHeight.value);
            this.#recalculateTileAndOriginInputs(width, height);

            this.#resetPreviewImage();
            await this.#renderSourceImageAsync();
            await this.#updatePreviewImageAsync();
        }
    }

    async #handleDimensionPercentChange(dimension) {
        if (this.#sourceImageIsSet()) {
            this.#showImageSizeWarning(false);

            if (!dimension || !['w', 'h'].includes(dimension)) throw new Error('Invalid dimension.');
            if (!this.#sourceImage) throw new Error('No image loaded.');

            this.#previewImage = null;

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
            const axisPx = dimension === 'w' ? this.#sourceImage.width : this.#sourceImage.height;
            inputPx.value = Math.round(axisPx * percentage);

            // Set other value if aspect locked
            if (this.#tbImportRatioLock.checked) {
                const antiInputPx = dimension === 'w' ? this.#tbImportHeight : this.#tbImportWidth;
                const antiInputPercent = dimension === 'w' ? this.#tbImportHeightPercent : this.#tbImportWidthPercent;
                const antiAxisPx = dimension === 'w' ? this.#sourceImage.height : this.#sourceImage.width;

                antiInputPx.value = Math.round(antiAxisPx * percentage);
                antiInputPercent.value = value;
            }

            const width = parseInt(this.#tbImportWidth.value);
            const height = parseInt(this.#tbImportHeight.value);
            this.#recalculateTileAndOriginInputs(width, height);

            this.#resetPreviewImage();
            await this.#renderSourceImageAsync();
            await this.#updatePreviewImageAsync();
        }
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

    async #handleDimensionRevert(dimension) {
        const percent = dimension === 'w' ? this.#tbImportWidthPercent : this.#tbImportHeightPercent;
        percent.value = 100;
        await this.#handleDimensionPercentChange(dimension);
    }

    async #handleOffsetOrTileChange(sender) {
        if (this.#sourceImageIsSet()) {
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

            await this.#renderSourceImageAsync();
            await this.#renderPreviewImageAsync();
        }
    }

    async #handlePreviewTileDisplayChange(sender) {
        if (this.#sourceImageIsSet()) {
            await this.#renderSourceImageAsync();
            await this.#renderPreviewImageAsync();
        }
    }

    async #handlePreviewScaleChange(sender) {
        if (this.#sourceImageIsSet()) {
            await this.#renderSourceImageAsync();
            await this.#renderPreviewImageAsync();
        }
    }

    // /**
    //  * Handles when a user pastes a file.
    //  * @param {ClipboardEvent} clipboardEvent - Clipboard event that occurred.
    //  */
    // async #handleFilePasteEvent(clipboardEvent) {
    //     if (clipboardEvent?.clipboardData?.files.length > 0) {
    //         this.#tbImportFile.setAttribute('disabled', '');
    //         this.#btnPreview.setAttribute('disabled', '');

    //         const file = clipboardEvent?.clipboardData?.files[0];
    //         await this.#loadSourceImageFileAsync(file);
    //         this.#fileName = file.name;

    //         this.#btnPreview.removeAttribute('disabled');
    //         this.#tbImportFile.removeAttribute('disabled');
    //     }
    // }

    async #handleFileInputChangeEvent() {
        if (this.#tbImportFile.files.length > 0) {
            this.#reset();
            this.#updateInputEnabledState();
            await this.#loadSourceImageFileAsync(this.#tbImportFile.files[0]);
            await this.#updatePreviewImageAsync();
        }
    }

    async #handleImportClipboardClick() {
        // TODO - Only works outside Firefox
        // const data = await navigator.clipboard.read();
        // console.log(data);
    }


    /**
     * Handle the import button click.
     * @param {string?} mode - Import mode, either 'new' or 'existing', when omitted, new is assumed.
     */
    async #handleImportClick(mode) {
        if (this.#sourceImageIsSet() && this.#previewImageIsSet()) {

            const previewImage = this.#previewImage;
            const previewColours = this.#previewColours;

            let system = this.#tbImportPaletteSelect.value;
            if (!['ms', 'gg', 'gb', 'nes'].includes(system)) {
                const option = this.#tbImportPaletteSelect.selectedOptions.item(0);
                const paletteIndex = parseInt(option.getAttribute('data-smsgfx-palette-index'));
                const palette = this.#paletteList.getPalette(paletteIndex);
                system = palette.system;
            }

            const project = ImageUtil.imageToProject(previewImage, previewColours, {
                projectName: this.#fileName ?? 'Imported image',
                system: system,
                tiles: {
                    offsetX: parseInt(this.#tbOffsetLeft.value),
                    offsetY: parseInt(this.#tbOffsetTop.value),
                    tilesWide: parseInt(this.#tbTilesWide.value),
                    tilesHigh: parseInt(this.#tbTilesHigh.value)
                }
            });

            this.#triggerOnConfirm({
                createNew: mode === 'new',
                title: project.title,
                tileSet: project.tileSet,
                palette: project.paletteList.getPalette(0),
                systemType: project.systemType
            });
        }
    }


    /**
     * Loads a file into the canvas.
     * @param {File} file - File to load.
     */
    async #loadSourceImageFileAsync(file) {
        if (!file) throw new Error('There was no file.')

        this.#resetSource();
        this.#resetPreviewImage();

        this.#sourceImage = await ImageUtil.fileToImageAsync(file);
        this.#dispatcher.dispatch(EVENT_SourceImageUpdated, {});
        await this.#updatePreviewImageAsync();
    }

    /**
     * When the source image is updated display it and update the form accordinlgly.
     */
    async #handleSourceImageUpdatedAsync() {
        this.#showImageSizeWarning(false);

        if (this.#sourceImageIsSet()) {
            const max = MAX_INITIAL_IMPORT_WIDTH;
            let width = this.#sourceImage.width;
            let height = this.#sourceImage.height;

            if (width > max || height > max) {
                const widthGreaterThanHeight = width > height;
                if (widthGreaterThanHeight) {
                    let percent = 1 / width * max;
                    width = 256;
                    height = Math.round(height * percent);
                } else {
                    let percent = 1 / height * max;
                    width = Math.round(width * percent);
                    height = 256;
                }
                this.#showImageSizeWarning(true);
            }

            this.#recalculateTileAndOriginInputs(width, height);

            resetCanvas(this.#tbCanvasPreview);
            await this.#renderSourceImageAsync();
        }
        this.#updateInputEnabledState();
    }

    /**
     * When the preview image is updated display it and update the form accordinlgly.
     */
    async #handlePreviewImageUpdatedAsync() {
        await this.#renderPreviewImageAsync();
        this.#updateInputEnabledState();
    }


    #showImageSizeWarning(show) {
        const warningElm = this.#element.querySelector('[data-smsgfx-id=image-resize-warning]');
        if (warningElm) {
            if (show && warningElm.classList.contains('visually-hidden')) {
                while (warningElm.classList.contains('visually-hidden')) {
                    warningElm.classList.remove('visually-hidden');
                }
            } else if (!show && !warningElm.classList.contains('visually-hidden')) {
                warningElm.classList.add('visually-hidden');
            }
        }
    }


    #previewUpdateQueued = false;
    #previewIsUpdating = false;

    #sourceImageIsSet = () => this.#sourceImage ? true : false;
    #previewImageIsSet = () => this.#previewImage && this.#previewColours ? true : false;
    #previewImageRequiresUpdate = () => this.#previewUpdateQueued || !this.#previewImageIsSet() ? true : false;

    async #updatePreviewImageAsync() {
        if (this.#previewIsUpdating) {
            this.#previewUpdateQueued = true;
            return;
        }
        while (this.#sourceImageIsSet && this.#previewImageRequiresUpdate()) {
            this.#previewIsUpdating = true;
            this.#previewUpdateQueued = false;

            const width = parseInt(this.#tbImportWidth.value);
            const height = parseInt(this.#tbImportHeight.value);

            const sourceImage = await ImageUtil.resizeImageAsync(this.#sourceImage, width, height);

            /** @type {ColourMatch[]} */
            let extractedColours;
            const selectedPalette = this.#tbImportPaletteSelect.value;
            if (['ms', 'gg'].includes(selectedPalette)) {
                extractedColours = await ImageUtil.extractNativePaletteFromImageAsync(sourceImage, selectedPalette);
            } else if (['nes'].includes(selectedPalette)) {
                const palette = PaletteFactory.createNewStandardColourPalette('NES palette', 'nes');
                extractedColours = await ImageUtil.matchToPaletteAsync(sourceImage, palette);
            } else if (['gb'].includes(selectedPalette)) {
                const palette = PaletteFactory.createNewStandardColourPalette('Game Boy palette', 'gb');
                extractedColours = await ImageUtil.matchToPaletteAsync(sourceImage, palette);
            } else {
                const option = this.#tbImportPaletteSelect.selectedOptions.item(0);
                const paletteIndex = parseInt(option.getAttribute('data-smsgfx-palette-index'));
                const palette = this.#paletteList.getPalette(paletteIndex);
                extractedColours = await ImageUtil.matchToPaletteAsync(sourceImage, palette);
            }

            this.#previewImage = await ImageUtil.renderImageFromPaletteAsync(extractedColours, sourceImage);
            this.#previewColours = extractedColours;

            this.#dispatcher.dispatch(EVENT_PreviewImageUpdated, {});
        }
        this.#previewIsUpdating = false;
    }

    async #renderSourceImageAsync() {
        if (this.#sourceImageIsSet()) {
            const width = parseInt(this.#tbImportWidth.value);
            const height = parseInt(this.#tbImportHeight.value);
            const scale = parseInt(this.#tbPreviewScale.value);
            const shouldDisplayTiles = this.#tbPreviewTileDisplay.checked;

            const resizedImage = await ImageUtil.resizeImageAsync(this.#sourceImage, width, height);

            /** @type {import("../util/imageUtil.js").TileSpec} */
            const params = shouldDisplayTiles ? {
                offsetX: parseInt(this.#tbOffsetLeft.value),
                offsetY: parseInt(this.#tbOffsetTop.value),
                tilesWide: parseInt(this.#tbTilesWide.value),
                tilesHigh: parseInt(this.#tbTilesHigh.value)
            } : null;

            ImageUtil.displayImageOnCanvas(this.#tbCanvasSource, resizedImage, { scale: scale, tiles: params });
        }
    }

    async #renderPreviewImageAsync() {
        if (this.#previewImageIsSet()) {
            const image = this.#previewImage;
            const scale = parseInt(this.#tbPreviewScale.value);
            const shouldDisplayTiles = this.#tbPreviewTileDisplay.checked;

            /** @type {import("../util/imageUtil.js").TileSpec} */
            const params = shouldDisplayTiles ? {
                offsetX: parseInt(this.#tbOffsetLeft.value),
                offsetY: parseInt(this.#tbOffsetTop.value),
                tilesWide: parseInt(this.#tbTilesWide.value),
                tilesHigh: parseInt(this.#tbTilesHigh.value)
            } : null;

            ImageUtil.displayImageOnCanvas(this.#tbCanvasPreview, image, { scale: scale, tiles: params });
        }
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
 * @typedef {Object} ImportImageModalState
 * @property {PaletteList?} paletteList - List of palettes to make available for import.
 * @property {File?} file - File containing an image to be shown.
 */


/**
 * Callback for when the user clicks one of the import buttons from the import modal.
 * @callback ImportProjectModelConfirmCallback
 * @param {ImportProjectModelConfirmEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} ImportProjectModelConfirmEventArgs
 * @property {boolean} createNew - When true we're creating a new project, otherwise we'll add to existing.
 * @property {string} title - Title of the project.
 * @property {TileSet} tileSet - Derrived tile set from the import operation.
 * @property {Palette} palette - Derrived colour palette from the import operation.
 * @property {string} systemType - Type of system, either 'smsgg' or 'gb'.
 * @exports 
 */
