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

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            const theme = event.matches ? "dark" : "light";
            this.setTheme(theme);
            this.#dispatcher.dispatch(EVENT_OnEvent, {
                event: events.themeChange,
                theme: theme
            });
        });
    }


    /**
     * Sets the theme.
     * @param {string} lightDarkOrSystem - Theme to use, either 'light', 'dark' or 'system'.
     */
    setTheme(lightDarkOrSystem) {
        if (lightDarkOrSystem === 'system') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.setTheme('dark');
            } else {
                this.setTheme('light');
            }
        } else if (['light', 'dark'].includes(lightDarkOrSystem)) {
            const antiThemeSelector = `data-smsgfx-theme-${lightDarkOrSystem === 'light' ? 'dark' : 'light'}`;
            document.querySelector('html').setAttribute('data-bs-theme', lightDarkOrSystem);
            document.querySelectorAll(antiThemeSelector).forEach((element) => {
                if (element.hasAttribute(antiThemeSelector)) {
                    element.getAttribute(antiThemeSelector).split(' ').forEach((cssClass) => {
                        element.classList.remove(cssClass);
                    });
                }
            });
            const themeSelector = `data-smsgfx-theme-${lightDarkOrSystem}`;
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
                theme: lightDarkOrSystem
            });
        } else {
            throw new Error(`Theme must be either 'light', 'dark' or 'system'.`);
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
 * @property {string} theme - Theme that was chosen, either 'light', 'dark' or 'system'.
 * @exports
 */