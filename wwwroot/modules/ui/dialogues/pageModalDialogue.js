import ModalDialogue from "./../modalDialogue.js";
import TemplateUtil from "../../util/templateUtil.js";

export default class PageModalDialogue extends ModalDialogue {


    /** @type {HTMLElement} */
    #pnlHeader;
    /** @type {HTMLElement} */
    #lblTitle;
    /** @type {HTMLIFrameElement} */
    #iframe;
    /** @type {HTMLElement} */
    #element;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#pnlHeader = document.querySelector('[data-smsgfx-id=header]');
        this.#lblTitle = document.querySelector('[data-smsgfx-id=title]');
        this.#iframe = document.querySelector('[data-smsgfx-id=iframe]');
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<PageModalDialogue>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/pageModalDialogue', element);
        return new PageModalDialogue(componentElement);
    }


    /**
     * Sets the state.
     * @param {PageModalDialogueState} state - State object.
     */
    setState(state) {
        if (typeof state.title === 'string' || state.title === null) {
            this.#lblTitle.innerText = state.title ?? '';
        }
        if (typeof state.showHeader === 'boolean') {
            this.#pnlHeader.classList.remove('visually-hidden');
            if (!state.showHeader) {
                this.#pnlHeader.classList.add('visually-hidden');
            }
        }
        if (typeof state.pageUrl === 'string' || state.pageUrl === null) {
            this.#changeIFrameSrc(state.pageUrl);
        }
    }


    /**
     * @param {PageModalDialogueStateConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            callback({});
        });
    }


    /**
     * Searches for and wires up pages to display in a popup.
     * @param {HTMLElement} element - HTML element to search for popups for.
     * @param {PageModalDialogue} dialogue - Modal dialogue object to open links up in.
     */
    static async wireUpElementsAsync(element, dialogue) {
        if (!element || !element.querySelectorAll) return;

        dialogue = await createDialogueIfNullAsync(dialogue);

        element.querySelectorAll('[data-smsgfx-dialogue]').forEach((elm) => {
            elm.addEventListener('click', (ev) => {
                let url = elm.getAttribute('data-url') ?? elm.getAttribute('href');
                if (url) {
                    const lightDark = document.querySelector('html').getAttribute('data-bs-theme');
                    const showHeader = !elm.hasAttribute('data-show-header') || elm.getAttribute('data-show-header').toLowerCase() !== 'false';
                    const title = elm.getAttribute('data-title') ?? '';
                    if (lightDark !== null) {
                        url += `${(url.includes('?') ? '&' : '?')}smsgfxTheme=${encodeURIComponent(lightDark)}`;
                    }
                    dialogue.setState({
                        showHeader: showHeader,
                        title: title,
                        pageUrl: url
                    });
                    dialogue.show();
                    ev.preventDefault();
                }

            });
        });
    }


    #changeIFrameSrc(newUrl) {
        let onLoad = () => {
            this.#iframe.removeEventListener('load', onLoad);
            this.#iframe.src = newUrl;
        }
        this.#iframe.addEventListener('load', onLoad);
        this.#iframe.src = 'about:blank';
    }


}


/**
 * Privacy dialogue state object.
 * @typedef {object} PageModalDialogueState
 * @property {string?} [pageUrl] - URL of the page to be loaded into the iframe.
 * @property {string?} [title] - Text to display in the page header.
 * @property {boolean?} [showHeader] - Should the dialogue header be displayed.
 */

/**
 * Privacy dialogue confirm callback.
 * @callback PageModalDialogueStateConfirmCallback
 * @argument {PageModalDialogueStateConfirmEventArgs} data - Arguments.
 * @exports
 */
/**
 * Privacy dialogue confirm args.
 * @typedef {object} PageModalDialogueStateConfirmEventArgs
 * @exports
 */


/**
 * @param {PageModalDialogue} dialogue - Modal dialogue object to open links up in.
 */
async function createDialogueIfNullAsync(dialogue) {
    if (dialogue instanceof PageModalDialogue) {
        return dialogue;
    } else {
        const container = document.createElement('div');
        document.body.append(container);
        return PageModalDialogue.loadIntoAsync(container);
    }
}
