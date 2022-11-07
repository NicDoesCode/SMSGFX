export default class ReferenceImage {


    /** @type {HTMLImageElement|null} */
    get image() {
        return this.#image;
    }
    set image(value) {
        this.#image = value;
    }

    get imageWidth() {
        return this.#image.width;
    }

    get imageHeight() {
        return this.#image.height;
    }

    get drawWidth() {
        return this.#bounds.width;
    }

    get drawHeight() {
        return this.#bounds.height;
    }

    get positionX() {
        return this.#bounds.x;
    }

    get positionY() {
        return this.#bounds.y;
    }


    /** @type {HTMLImageElement} */
    #image;
    /** @type {DOMRect} */
    #bounds;


    /**
     * Represents a reference image to draw.
     */
    constructor() {
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