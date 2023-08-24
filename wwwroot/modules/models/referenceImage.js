export default class ReferenceImage {


    /** @type {HTMLImageElement|null} */
    get image() {
        return this.#image;
    }
    set image(value) {
        this.#image = value;
    }

    get imageWidth() {
        return this.#image?.width ?? 0;
    }

    get imageHeight() {
        return this.#image?.height ?? 0;
    }

    get drawWidth() {
        return this.#bounds?.width ?? 0;
    }

    get drawHeight() {
        return this.#bounds?.height ?? 0;
    }

    get positionX() {
        return this.#bounds?.x ?? 0;
    }

    get positionY() {
        return this.#bounds?.y ?? 0;
    }


    /** @type {HTMLImageElement?} */
    #image;
    /** @type {DOMRect?} */
    #bounds;


    /**
     * Represents a reference image to draw.
     */
    constructor() {
        this.#image = null;
        this.#bounds = null;
    }


    /**
     * Sets the image.
     * @param {HTMLImageElement} image - Image to draw.
     */
    setImage(image) {
        this.#image = image;
    }

    /**
   * Clears the image.
   */
    clearImage() {
        this.#image = null;
        this.#bounds = null;
    }

    /**
     * Sets the display bounds of the image.
     * @param {number} positionX - X coordinate.
     * @param {number} poisitionY - Y coordinate.
     * @param {number} drawWidth - Drawing width.
     * @param {number} drawHeight - Drawing height.
     */
    setBounds(positionX, poisitionY, drawWidth, drawHeight) {
        this.#bounds = new DOMRect(positionX, poisitionY, drawWidth, drawHeight);
    }

    /**
     * Gets the image display bounds.
     * @returns {DOMRect}
     */
    getBounds() {
        return new DOMRect(this.positionX, this.positionY, this.drawWidth, this.drawHeight);
    }


}