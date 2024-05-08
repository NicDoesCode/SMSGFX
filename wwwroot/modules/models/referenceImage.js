import ImageUtil from "../util/imageUtil.js";

export default class ReferenceImage {


    /** @type {HTMLImageElement|null} */
    get image() {
        return this.#image;
    }
    set image(value) {
        this.setImage(value);
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


    /** @type {ImageBitmap?} */
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
     * @param {HTMLImageElement|HTMLCanvasElement|OffscreenCanvas|ImageBitmap} image - Image to draw.
     */
    setImage(image) {
        if (image instanceof ImageBitmap) {
            this.#image = image;
        } else if ((image?.tagName && image.tagName === 'IMG') || (image?.tagName && image.tagName === 'CANVAS') || image instanceof OffscreenCanvas) {
            this.#image = ImageUtil.toImageBitmap(image);
        } else if (image === null) {
            this.#image = null;
        } else {
            throw new Error('Invalid value for image.')
        }
    }

    /**
     * Gets whether or not an image is set.
     */
    hasImage() {
        return this.#image !== null;
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


    /**
     * Converts the reference image into an object that can be serialised.
     * @returns {ReferenceImageObject}
     */
    toObject() {
        const result = {};
        result.image = this.image;
        if (this.#bounds) {
            result.position = {
                x: this.positionX,
                y: this.positionY
            };
            result.dimensions = {
                width: this.drawWidth,
                height: this.drawHeight
            }
        } else {
            result.position = null;
            result.dimensions = null;
        }
        return result;
    }

    /**
     * Converts a serialisable reference image object back into a reference image.
     * @param {ReferenceImageObject} value - Input reference image object.
     * @returns {ReferenceImage}
     */
    static fromObject(value) {
        if (typeof value === 'object' && value !== null) {
            const result = new ReferenceImage();
            result.image = value.image;
            if (value.position && value.dimensions) {
                result.setBounds(value.position.x, value.position.y, value.dimensions.width, value.dimensions.height);
            }
            return result;
        }
    }


}


/**
 * @typedef {Object} ReferenceImageObject
 * @property {ImageBitmap} image
 * @property {import('./../types.js').Coordinate} position
 * @property {import('./../types.js').Dimension} dimensions
 * @exports
 */