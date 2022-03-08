export default class ModalDialogue {


    /**
     * This event fires immediately when the show instance method is called. If caused by a click, the clicked element is available as the relatedTarget property of the event.
     */
    get onShow() {
        return this.#onShowCallback;
    }
    set onShow(value) {
        if (value && typeof value === 'function') {
            this.#onShowCallback = value;
        } else {
            this.#onShowCallback = () => { };
        }
    }

    /** @type {DialogueCallback} */
    #onShowCallback = () => { };

    /**
     * This event is fired when the modal has been made visible to the user (will wait for CSS transitions to complete). If caused by a click, the clicked element is available as the relatedTarget property of the event.
     */
    get onShown() {
        return this.#onShownCallback;
    }
    set onShown(value) {
        if (value && typeof value === 'function') {
            this.#onShownCallback = value;
        } else {
            this.#onShownCallback = () => { };
        }
    }

    /** @type {DialogueCallback} */
    #onShownCallback = () => { };

    /**
     * This event is fired immediately when the hide instance method has been called.
     */
    get onHide() {
        return this.#onHideCallback;
    }
    set onHide(value) {
        if (value && typeof value === 'function') {
            this.#onHideCallback = value;
        } else {
            this.#onHideCallback = () => { };
        }
    }

    /** @type {DialogueCallback} */
    #onHideCallback = () => { };

    /**
     * This event is fired when the modal has finished being hidden from the user (will wait for CSS transitions to complete).
     */
    get onHidden() {
        return this.#onHiddenCallback;
    }
    set onHidden(value) {
        if (value && typeof value === 'function') {
            this.#onHiddenCallback = value;
        } else {
            this.#onHiddenCallback = () => { };
        }
    }

    /** @type {DialogueCallback} */
    #onHiddenCallback = () => { };

    /**
     * Event is called when the dialogue is confirmed (for example user clicks the OK button).
     */
    get onConfirm() {
        return this.#onConfirmCallback;
    }
    set onConfirm(value) {
        if (value && typeof value === 'function') {
            this.#onConfirmCallback = value;
        } else {
            this.#onConfirmCallback = () => { };
        }
    }

    /** @type {DialogueCallback} */
    #onConfirmCallback = () => { };


    /** @type {HTMLDivElement} */
    #element;
    #bootstrapModal = null;


    /**
     * Initialises a new instance of the ModelDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        this.#element = element;
        this.#bootstrapModal = bootstrap.Modal.getOrCreateInstance(this.#element);

        const confirmButtons = this.#element.querySelectorAll('[data-button-type="confirm"]');
        confirmButtons.forEach(confirmButton => {
            confirmButton.onclick = () => this.#onConfirmCallback(this, {});
        });

        this.#element.addEventListener('show.bs.modal', (event) => this.onShow(this, {}));
        this.#element.addEventListener('shown.bs.modal', (event) => this.onShown(this, {}));
        this.#element.addEventListener('hide.bs.modal', (event) => this.onHide(this, {}));
        this.#element.addEventListener('hidden.bs.modal', (event) => this.onHidden(this, {}));
    }


    show() {
        this.#bootstrapModal.show();
    }

    hide() {
        this.#bootstrapModal.hide();
    }


}


/**
 * Event callback.
 * @callback DialogueCallback
 * @param {ModalDialogue} sender - Originating modal dialogue.
 * @param {object} e - Event args.
 * @exports
 */