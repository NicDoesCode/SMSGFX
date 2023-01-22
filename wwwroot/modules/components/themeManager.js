import EventDispatcher from './eventDispatcher.js';

const EVENT_OnEvent = 'EVENT_OnEvent';

const events = {
    themeChange: 'themeChange'
}

export default class ThemeManager {


    static get Events() {
        return events;
    }


    #dispatcher;


    constructor() {
        this.#dispatcher = new EventDispatcher();
    }


    /**
     * Register a callback for when a command is invoked.
     * @param {ThemeManagerOnEventCallback} callback - Callback that will receive the command.
     */
    addHandlerOnEvent(callback) {
        this.#dispatcher.on(EVENT_OnEvent, callback);
    }


    /**
     * Sets the theme.
     * @param {string} lightOrDark - Theme to use, either 'light' or 'dark'.
     */
    setTheme(lightOrDark) {
        if (['light', 'dark'].includes(lightOrDark)) {
            const antiThemeSelector = `data-smsgfx-theme-${lightOrDark === 'light' ? 'dark' : 'light'}`;
            document.querySelector('html').setAttribute('data-bs-theme', lightOrDark);
            document.querySelectorAll(antiThemeSelector).forEach((element) => {
                if (element.hasAttribute(antiThemeSelector)) {
                    element.getAttribute(antiThemeSelector).split(' ').forEach((cssClass) => {
                        element.classList.remove(cssClass);
                    });
                }
            });
            const themeSelector = `data-smsgfx-theme-${lightOrDark}`;
            document.querySelectorAll(`[${themeSelector}]`).forEach((element) => {
                if (element.hasAttribute(themeSelector)) {
                    element.getAttribute(themeSelector).split(' ').forEach((cssClass) => {
                        element.classList.add(cssClass);
                    });
                }
            });
            // Raise event
            this.#dispatcher.dispatch(EVENT_OnEvent, {
                event: events.themeChange,
                theme: lightOrDark
            });
        } else {
            throw new Error(`Theme must be either 'light' or 'dark'.`);
        }
    }


}

/**
 * Callback for when an event occurs.
 * @callback ThemeManagerOnEventCallback
 * @argument {ThemeManagerOnEventEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} ThemeManagerOnEventEventArgs
 * @property {string} event - The event that was raised.
 * @property {string} theme - Theme that was chosen, either 'light' or 'dark'.
 * @exports
 */