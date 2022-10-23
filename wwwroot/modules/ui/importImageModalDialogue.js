import ImageUtil from "../util/imageUtil.js";
import ModalDialogue from "./modalDialogue.js";

export default class ImportImageModalDialogue extends ModalDialogue {


    /** @type {HTMLInputElement} */
    #tbFileInput;
    /** @type {HTMLSelectElement} */
    #tbSystem;
    /** @type {HTMLButtonElement} */
    #btnPreview;
    /** @type {HTMLCanvasElement} */
    #tbOriginal;
    /** @type {HTMLCanvasElement} */
    #tbPreview;


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);

        this.#tbFileInput = element.querySelector('[data-smsgfx-id=file-input]');
        this.#tbFileInput.onchange = async () => await this.#handleFileInputChangeEvent();

        this.#tbSystem = element.querySelector('[data-smsgfx-id=selected-system]');

        this.#btnPreview = element.querySelector('[data-smsgfx-id=preview]');
        this.#btnPreview.onclick = async () => await this.#handlePreviewClick();

        this.#tbOriginal = element.querySelector('[data-smsgfx-id=import-original]');

        this.#tbPreview = element.querySelector('[data-smsgfx-id=import-preview]');
    }


    show() {
        this.#tbFileInput.value = null;
        super.show();
    }


    async #handleFileInputChangeEvent() {
        if (this.#tbFileInput.files.length > 0) {
            this.#tbFileInput.setAttribute('disabled', '');
            this.#btnPreview.setAttribute('disabled', '');

            const originalImage = await ImageUtil.fileInputToImageAsync(this.#tbFileInput);
            ImageUtil.displayImageOnCanvas(this.#tbOriginal, originalImage);

            this.#tbPreview.width = 10;
            this.#tbPreview.height = 10;
            this.#tbPreview.getContext('2d').fillStyle = 'white';
            this.#tbPreview.getContext('2d').fillRect(0, 0, this.#tbPreview.width, this.#tbPreview.height);

            this.#btnPreview.removeAttribute('disabled');
            this.#tbFileInput.removeAttribute('disabled');
        }
    }

    async #handlePreviewClick() {
        if (this.#tbFileInput.files.length > 0) {
            this.#tbFileInput.setAttribute('disabled', '');
            this.#btnPreview.setAttribute('disabled', '');

            const system = this.#tbSystem.value;

            const originalImage = await ImageUtil.fileInputToImageAsync(this.#tbFileInput);

            const newPalette = await ImageUtil.extractNativePaletteFromImageAsync(originalImage, system);
            const previewImage = await ImageUtil.getImageFromPaletteAsync(newPalette, originalImage);
            ImageUtil.displayImageOnCanvas(this.#tbPreview, previewImage);

            this.#btnPreview.removeAttribute('disabled');
            this.#tbFileInput.removeAttribute('disabled');
        }
    }


}