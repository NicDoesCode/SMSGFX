import ComponentBase from "./componentBase.js";
import EventDispatcher from "../components/eventDispatcher.js";

const events = {
    onShow: 'onShow',
    onShown: 'onShown',
    onHide: 'onHide',
    onHidden: 'onHidden',
    onConfirm: 'onConfirm',
    onCancel: 'onCancel'
};

export default class ModalDialogue extends ComponentBase {


    get events() {
        return events;
    }


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
        super(element);
        this.#element = element;
        this.#dispatcher = new EventDispatcher();
        this.#bootstrapModal = bootstrap.Modal.getOrCreateInstance(this.#element);

        this.#element.querySelectorAll('[data-button-type="confirm"]').forEach(button => {
            button.onclick = () => this.#dispatcher.dispatch(events.onConfirm, {});
        });

        this.#element.querySelectorAll('[data-button-type="cancel"]').forEach(button => {
            button.onclick = () => this.#dispatcher.dispatch(events.onCancel, {});
        });

        this.#element.addEventListener('show.bs.modal', () => this.#dispatcher.dispatch(events.onShow, {}));
        this.#element.addEventListener('shown.bs.modal', () => this.#dispatcher.dispatch(events.onShown, {}));
        this.#element.addEventListener('hide.bs.modal', () => this.#dispatcher.dispatch(events.onHide, {}));
        this.#element.addEventListener('hidden.bs.modal', () => this.#dispatcher.dispatch(events.onHidden, {}));
    }


    /**
     * Shows the dialogue.
     */
    show() {
        this.#bootstrapModal.show();
    }

    /**
     * Hides the dialogue.
     */
    hide() {
        this.#bootstrapModal.hide();
    }


    /**
     * This event fires immediately when the show instance method is called. If caused by a click, the clicked element is available as the relatedTarget property of the event.
     * @param {function} callback - Callback function to execute.
     */
    addHandlerOnShow(callback) {
        this.#dispatcher.on(events.onShow, callback)
    }

    /**
     * This event is fired when the modal has been made visible to the user (will wait for CSS transitions to complete). If caused by a click, the clicked element is available as the relatedTarget property of the event.
     * @param {function} callback - Callback function to execute.
     */
    addHandlerOnShown(callback) {
        this.#dispatcher.on(events.onShown, callback)
    }

    /**
     * This event is fired immediately when the hide instance method has been called.
     * @param {function} callback - Callback function to execute.
     */
    addHandlerOnHide(callback) {
        this.#dispatcher.on(events.onHide, callback)
    }

    /**
     * This event is fired when the modal has finished being hidden from the user (will wait for CSS transitions to complete).
     * @param {function} callback - Callback function to execute.
     */
    addHandlerOnHidden(callback) {
        this.#dispatcher.on(events.onHidden, callback)
    }

    /**
     * Event is called when the dialogue is confirmed (for example user clicks the OK button).
     * @param {function} callback - Callback function to execute.
     */
    addHandlerOnConfirm(callback) {
        this.#dispatcher.on(events.onConfirm, callback)
    }

    /**
     * Event is called when the dialogue is cancelled.
     * @param {function} callback - Callback function to execute.
     */
    addHandlerOnCancel(callback) {
        this.#dispatcher.on(events.onCancel, callback)
    }


}
