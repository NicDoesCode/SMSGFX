import EventDispatcher from "../eventDispatcher.js";

const EVENT_OnShow = 'EVENT_OnShow';
const EVENT_OnShown = 'EVENT_OnShown';
const EVENT_OnHide = 'EVENT_OnHide';
const EVENT_OnHidden = 'EVENT_OnHidden';
const EVENT_OnConfirm = 'EVENT_OnConfirm';
const EVENT_OnCancel = 'EVENT_OnCancel';

export default class ModalDialogue {


    /** @type {HTMLDivElement} */
    #element;
    #bootstrapModal = null;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * Initialises a new instance of the ModelDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();
        this.#bootstrapModal = bootstrap.Modal.getOrCreateInstance(this.#element);

        this.#element.querySelectorAll('[data-button-type="confirm"]').forEach(button => {
            button.onclick = () => this.#dispatcher.dispatch(EVENT_OnConfirm, {});
        });

        this.#element.querySelectorAll('[data-button-type="cancel"]').forEach(button => {
            button.onclick = () => this.#dispatcher.dispatch(EVENT_OnCancel, {});
        });

        this.#element.addEventListener('show.bs.modal', (event) => this.#dispatcher.dispatch(EVENT_OnShow, {}));
        this.#element.addEventListener('shown.bs.modal', (event) => this.#dispatcher.dispatch(EVENT_OnShown, {}));
        this.#element.addEventListener('hide.bs.modal', (event) => this.#dispatcher.dispatch(EVENT_OnHide, {}));
        this.#element.addEventListener('hidden.bs.modal', (event) => this.#dispatcher.dispatch(EVENT_OnHidden, {}));
    }


    show() {
        this.#bootstrapModal.show();
    }

    hide() {
        this.#bootstrapModal.hide();
    }


    /**
     * This event fires immediately when the show instance method is called. If caused by a click, the clicked element is available as the relatedTarget property of the event.
     * @param {function} callback - Callback function to execute.
     */
    addHandlerOnShow(callback) {
        this.#dispatcher.on(EVENT_OnShow, callback)
    }

    /**
     * This event is fired when the modal has been made visible to the user (will wait for CSS transitions to complete). If caused by a click, the clicked element is available as the relatedTarget property of the event.
     * @param {function} callback - Callback function to execute.
     */
     addHandlerOnShown(callback) {
        this.#dispatcher.on(EVENT_OnShown, callback)
    }

    /**
     * This event is fired immediately when the hide instance method has been called.
     * @param {function} callback - Callback function to execute.
     */
     addHandlerOnHide(callback) {
        this.#dispatcher.on(EVENT_OnHide, callback)
    }

    /**
     * This event is fired when the modal has finished being hidden from the user (will wait for CSS transitions to complete).
     * @param {function} callback - Callback function to execute.
     */
     addHandlerOnHidden(callback) {
        this.#dispatcher.on(EVENT_OnHidden, callback)
    }

    /**
     * Event is called when the dialogue is confirmed (for example user clicks the OK button).
     * @param {function} callback - Callback function to execute.
     */
     addHandlerOnConfirm(callback) {
        this.#dispatcher.on(EVENT_OnConfirm, callback)
    }

    /**
     * Event is called when the dialogue is cancelled.
     * @param {function} callback - Callback function to execute.
     */
     addHandlerOnCancel(callback) {
        this.#dispatcher.on(EVENT_OnCancel, callback)
    }


}
