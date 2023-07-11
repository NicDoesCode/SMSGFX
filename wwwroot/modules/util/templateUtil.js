import GeneralUtil from "./generalUtil.js";

const componentRegex = /^[A-z\d_]+(\/[A-z\d_]+)*$/;
const componentCache = document.createElement('div');
let documentLoadAttempted = false;
let globalLoadAttempted = false;

export default class TemplateUtil {


    /**
     * Replaces a given element with the loaded markup for a component, 
     * first page embedded components are tried, 
     * if that fails global components will be searched, 
     * if that fails individual component file will be loaded.
     * @param {string} componentName - Name of the component to load, namespace with forward slash '/' (eg. toolbars/exportToolbar).
     * @param {HTMLElement} element - Element to load the content into (note, all child elements will be removed).
     * @returns {HTMLElement}
     */
    static async replaceElementWithComponentAsync(componentName, element) {
        if (!componentName) throw new Error('Must supply a component name.');
        if (!componentRegex.test(componentName)) throw new Error(`Component name '${componentName}' was not valid.`);

        let component = getUserDefinedTemplateAsComponent(componentName, element);

        if (!component) {
            component = getComponent(componentName);
        }

        if (!component) {
            ensureEmbeddedComponentsFromDocumentCached();
            component = getComponent(componentName);
        }

        if (!component) {
            await ensureGlobalComponentsCachedAsync();
            component = getComponent(componentName);
        }

        if (!component) {
            await attemptLoadComponentFromFileAsync(componentName);
            component = getComponent(componentName);
        }

        if (component) {
            addComponentGlobalScopedCss(componentName, component);

            /** @type {HTMLElement?} */
            let componentElement = component.cloneNode(true);
            element.classList.forEach((className) => {
                componentElement.classList.add(className);
            })
            element.removeAttribute('class');
            element.getAttributeNames().forEach((attrName) => {
                if (attrName !== 'data-smsgfx-component-id') {
                    componentElement.setAttribute(attrName, element.getAttribute(attrName));
                }
            });
            componentElement.removeAttribute('data-smsgfx-component');
            element.after(componentElement);
            element.remove();
            return componentElement;
        } else {
            console.error(`Failed to load component '${componentName}'.`);
            return element;
        }
    }


    /**
     * Wires up label elements to their form elements.
     * @param {HTMLElement} rootElement - Element to scan.
     */
    static wireUpLabels(rootElement) {
        rootElement.querySelectorAll('[data-labelled-by]').forEach(labelledElement => {
            const labelledBy = labelledElement.getAttribute('data-labelled-by');
            const labelElm = rootElement.querySelector(`label[for=${labelledBy}]`)
            if (labelElm) {
                const id = `smsgfx${GeneralUtil.generateRandomString(16)}`;
                labelElm.setAttribute('for', id);
                labelledElement.id = id;
            }
        });
    }

    /**
     * Wires up label auto events on their elements.
     * @param {HTMLElement} rootElement - Element to scan.
     * @param {TemplateCommandAutoEventCallback} callback - Event callback.
     */
    static wireUpCommandAutoEvents(rootElement, callback) {
        if (typeof callback !== 'function') return;

        rootElement.querySelectorAll('[data-command][data-auto-event]').forEach((elm) => {
            const command = elm.getAttribute('data-command');
            const autoEvent = elm.getAttribute('data-auto-event');
            if (autoEvent === 'click') elm.addEventListener('click', () => callback(elm, autoEvent, command));
            if (autoEvent === 'change') elm.addEventListener('change', () => callback(elm, autoEvent, command));
        });
    }


}


/**
 * Event callback.
 * @callback TemplateCommandAutoEventCallback
 * @argument {HTMLElement} sender - Element that initiated the event.
 * @argument {string} eventType - Type of event that occurred.
 * @argument {string} command - Associated command.
 * @exports
 */


/** 
 * @param {string} componentName
 * @param {HTMLElement} element 
 */
function getUserDefinedTemplateAsComponent(componentName, element) {
    const userDefinedTemplate = element.querySelector('template');
    if (userDefinedTemplate) {
        const componentInstanceId = `${componentName}/${GeneralUtil.generateRandomString(8)}`;
        addComponentGlobalScopedCss(componentInstanceId, userDefinedTemplate);
        const result = document.createElement(element.tagName);
        result.innerHTML = userDefinedTemplate.innerHTML;
        return result;
    }
    return null;
}


/** @param {string} componentName */
function getComponent(componentName) {
    return componentCache.querySelector(componentSelector(componentName));
}

function ensureEmbeddedComponentsFromDocumentCached() {
    if (!documentLoadAttempted) {
        documentLoadAttempted = true;
        const documentComponents = document.querySelectorAll('[data-smsgfx-component]');
        documentComponents.forEach(component => {
            addComponentToCacheIfNotAlreadyThere(component);
            documentComponents.remove();
        });
    }
}

async function ensureGlobalComponentsCachedAsync() {

    if (!globalLoadAttempted) {
        globalLoadAttempted = true;
        try {

            // Load the global file data
            const url = `./modules/ui/ui.html${getCacheBuster() ?? ''}`;
            const resp = await fetch(url);
            if (resp.ok) {
                const content = await resp.text();
                const tempElement = document.createElement('div');
                tempElement.innerHTML = content;

                // Extract components, add if not already cached
                const extractedComponents = tempElement.querySelectorAll('[data-smsgfx-component]');
                extractedComponents.forEach(component => {
                    addComponentToCacheIfNotAlreadyThere(component);
                });
            }

        } catch (ex) {
            console.error('Global components file load failed.', ex);
        }
    }
}

/** @param {string} componentName */
async function attemptLoadComponentFromFileAsync(componentName) {
    try {
        const url = `./modules/ui/${componentName}.html${getCacheBuster() ?? ''}`;
        const resp = await fetch(url);
        const content = await resp.text();

        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;

        const loadedComponent = tempElement.querySelector(componentSelector(componentName));
        addComponentToCacheIfNotAlreadyThere(loadedComponent);
    } catch (e) {
        console.error(`Failed to load component markup file '${componentName}'.`, e);
    }
}

/**
 * Add any global scoped CSS to the document.
 * @param {string} componentName - Namespaced identifier of the component.
 * @param {HTMLElement} elementToScan - Element to look for global scoped CSS.
 */
function addComponentGlobalScopedCss(componentName, elementToScan) {
    // Add any global scoped CSS to the document head
    const globalScopedCssNodes = elementToScan.querySelectorAll(`style[data-css-scope=global]`);;
    globalScopedCssNodes.forEach((/** @type {HTMLElement} */ cssNode) => {
        cssNode.remove();
        cssNode.setAttribute('data-smsgfx-component', componentName);
        document.head.appendChild(cssNode);
    });
}

function addComponentToCacheIfNotAlreadyThere(component) {
    const componentName = component.getAttribute('data-smsgfx-component');
    if (componentName) {
        const selector = componentSelector(componentName);
        const foundComponent = componentCache.querySelector(selector);
        if (!foundComponent) componentCache.appendChild(component);
    }
}

/** @param {string} componentName */
function componentSelector(componentName) {
    return `[data-smsgfx-component=${CSS.escape(componentName)}]`;
}

let cacheBuster;

function getCacheBuster() {
    if (typeof cacheBuster === 'undefined') {
        cacheBuster = null;
        const scriptTag = document.querySelector(`script[src*=${CSS.escape('/main.js?v=')}]`);
        if (scriptTag) {
            const query = scriptTag.getAttribute('src').split('?');
            if (query.length > 1) {
                const param = new URLSearchParams(query[1]);
                if (param.has('v')) {
                    cacheBuster = `?v=${CSS.escape(param.get('v'))}`;
                }
            }
        }
    }
    return cacheBuster;
}