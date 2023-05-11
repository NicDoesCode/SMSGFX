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

        let component = getComponent(componentName);

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

            const clonedComponent = component.cloneNode(true);
            clonedComponent.removeAttribute('data-smsgfx-component');
            element.after(clonedComponent);
            element.remove();
            return clonedComponent;
        } else {
            console.error(`Failed to load component '${componentName}'.`);
            return element;
        }
    }


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
            const url = `./modules/ui/ui.html`;
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
        const url = `./modules/ui/${componentName}.html`;
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