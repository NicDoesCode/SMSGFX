import EventDispatcher from "../../components/eventDispatcher.js";
import { DropPosition } from "../../types.js";


const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    reorder: 'reorder'
}


/**
 * Manages the list re-ordering functions.
 */
export default class StackedListReorderHelper {


    /**
     * Gets a list of commands that this object can invoke.
     */
    static get Commands() {
        return commands;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {boolean} */
    #listMouseDown = false;
    /** @type {string?} */
    #originItemId = null;
    /** @type {number?} */
    #targetItemId = null;
    /** @type {string?} */
    #targetItemPosition = null;
    /** @type {string[]} */
    #itemIdList;
    /** @type {string} */
    #selectedItemId;
    /** @type {string} */
    #itemIdAttributeName = 'data-item-id';


    /**
     * @param {HTMLElement} element - HTML element that contains the stacked list that can be re-ordered.
     * @param {string} [itemIdAttributeNameOverride] - Overrides the attribute name that has the item ID.
     */
    constructor(element, itemIdAttributeNameOverride) {

        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        if (typeof itemIdAttributeNameOverride === 'string' && itemIdAttributeNameOverride !== null) {
            this.#itemIdAttributeName = itemIdAttributeNameOverride;
        }

        document.addEventListener('blur', () => this.#resetTrackingVariables());
        document.addEventListener('mouseup', () => this.#resetTrackingVariables());
        this.#wireUpListContainer(this.#element);
    }


    /**
     * Registers a handler for a command.
     * @param {StackedListReorderHelperCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    #resetTrackingVariables() {
        this.#listMouseDown = false;
        this.#originItemId = null;
        this.#targetItemId = null;
        this.#targetItemPosition = null;
    }


    /**
     * @param {HTMLElement} listContainer 
     */
    #wireUpListContainer(listContainer) {
        if (!listContainer?.addEventListener) return;

        listContainer.addEventListener('mouseup', (ev) => this.#handleListMouseUp(ev, listContainer));
        listContainer.addEventListener('mouseleave', (ev) => this.#handleListMouseLeave(ev, listContainer));
        listContainer.addEventListener('mousemove', (ev) => this.#handleListMouseMove(ev, listContainer));
    }

    wireUpItems() {
        this.#itemIdList = [];
        this.#element.querySelectorAll(`[data-list-item]`).forEach((/** @type {HTMLElement} */ itemContainer, index) => {

            const itemId = itemContainer.getAttribute(this.#itemIdAttributeName);
            this.#itemIdList.push(itemId);

            itemContainer.addEventListener('mousedown', (ev) => {
                const itemRect = itemContainer.getBoundingClientRect();
                const pixelsFromTop = ev.clientY - itemRect.top;
                if (itemRect.height < 50 || pixelsFromTop < 30) {
                    this.#listMouseDown = true;
                    this.#originItemId = itemId;
                }
            });

        });
    }


    /**
     * @param {MouseEvent} ev 
     * @param {HTMLElement} listContainer 
     */
    #handleListMouseUp(ev, listContainer) {
        if (this.#targetItemId === null || this.#originItemId === null) return;
        if (this.#targetItemId === this.#originItemId) return;

        /** @type {StackedListReorderHelperCommandEventArgs} */
        const args = {
            command: commands.reorder,
            originItemId: this.#originItemId,
            targetItemId: this.#targetItemId,
            targetItemPosition: this.#targetItemPosition
        };
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
    }

    /**
     * @param {MouseEvent} ev 
     * @param {HTMLElement} listContainer 
     */
    #handleListMouseLeave(ev, listContainer) {
        const rect = listContainer.getBoundingClientRect();
        if (ev.clientX <= rect.left || ev.clientX >= rect.right || ev.clientY <= rect.top || ev.clientY >= rect.bottom) {
            listContainer.querySelectorAll(`[data-list-item]`).forEach((container) => {
                container.classList.remove('list-insert-top', 'list-insert-bottom');
            });
        }
    }

    /**
     * @param {MouseEvent} ev 
     * @param {HTMLElement} listContainer 
     */
    #handleListMouseMove(ev, listContainer) {
        if (!this.#listMouseDown) return;

        this.#targetItemId = null;
        this.#targetItemPosition = null;

        // If the container was found, do our calculations to work out next item ID etc
        const itemContainer = this.#crawlParentsToFindItemContainer(ev.target);
        if (!itemContainer) return;

        const itemId = itemContainer.getAttribute(this.#itemIdAttributeName);

        const rect = itemContainer.getBoundingClientRect();
        const nearTop = (ev.clientY - rect.top) < 15;
        const nearBottom = (rect.bottom - ev.clientY) < 15;

        console.log(`nearbottom ? ${nearBottom}, ${rect.bottom}-${ev.clientY}=${(rect.bottom - ev.clientY)}`);

        if (!nearTop && !nearBottom) return;

        this.#targetItemId = itemId;
        this.#targetItemPosition = nearTop ? DropPosition.before : nearBottom ? DropPosition.after : null;

        this.#setDropIndicatorCSS(this.#targetItemId, this.#targetItemPosition);
    }

    /**
     * @param {HTMLElement} startingElement 
     */
    #crawlParentsToFindItemContainer(startingElement) {
        let result = startingElement;
        while (result && result !== this.#element) {
            if (result.hasAttribute('data-list-item')) return result;
            result = result.parentElement;
        }
        return null;
    }

    /**
     * @param {string} itemId 
     * @param {string} itemPosition - Either 'before' or 'after'.
     */
    #setDropIndicatorCSS(itemId, itemPosition) {

        /** @type {HTMLElement} */
        let itemContainerWithTopHighlighted = null;
        /** @type {HTMLElement} */
        let itemContainerWithBottomHighlighted = null;

        const itemIndex = this.#itemIdList.indexOf(itemId);

        if (itemPosition === DropPosition.before) {
            const itemIdBefore = (itemIndex - 1) >= 0 ? this.#itemIdList[itemIndex - 1] : null;
            itemContainerWithBottomHighlighted = this.#getListItemContainer(itemIdBefore);
            itemContainerWithTopHighlighted = this.#getListItemContainer(itemId);
        } else if (itemPosition === DropPosition.after) {
            const itemIdAfter = (itemIndex + 1) < this.#itemIdList.length ? this.#itemIdList[itemIndex + 1] : null;
            itemContainerWithTopHighlighted = this.#getListItemContainer(itemIdAfter);
            itemContainerWithBottomHighlighted = this.#getListItemContainer(itemId);
        }

        itemContainerWithTopHighlighted?.classList.add('list-insert-top');
        itemContainerWithBottomHighlighted?.classList.add('list-insert-bottom');

        // Reset CSS on all other containers
        this.#element.querySelectorAll(`[data-list-item]`).forEach((itemContainerToReset) => {
            if (itemContainerToReset !== itemContainerWithTopHighlighted) {
                itemContainerToReset.classList.remove('list-insert-top');
            }
            if (itemContainerToReset !== itemContainerWithBottomHighlighted) {
                itemContainerToReset.classList.remove('list-insert-bottom');
            }
        });
    }

    /**
     * @param {string?} itemId 
     * @returns {HTMLElement}
     */
    #getListItemContainer(itemId) {
        if (!itemId) return null;
        return this.#element.querySelector(`[data-list-item][${this.#itemIdAttributeName}=${CSS.escape(itemId)}]`);
    }


}


/**
 * Callback for when a command event is invoked.
 * @callback StackedListReorderHelperCommandCallback
 * @param {StackedListReorderHelperCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * Arguments for a command event.
 * @typedef {Object} StackedListReorderHelperCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string?} originItemId - Unique ID of the item that is to be moved.
 * @property {string?} targetItemId - Unique ID of the item that that the origin item is to be moved beside.
 * @property {string?} targetItemPosition - Either 'before' or 'after', indicates whether the origin item is to be placed before or after the target item.
 * @exports
 */
