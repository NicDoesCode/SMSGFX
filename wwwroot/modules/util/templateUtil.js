const componentRegex = /^[A-z\d]+$/;
const componentCache = document.createElement('div');
let documentLoadAttempted = false;
let globalLoadAttempted = false;

export default class TemplateUtil {

    
    /**
     * Loads a component into an element, 
     * first page embedded components are tried, 
     * if that fails global components will be searched, 
     * if that fails individual component file will be loaded.
     * @param {string} componentName - Name of the component to load.
     * @param {HTMLElement} element - Element to load the content into (note, all child elements will be removed).
     * @returns {HTMLElement}
     */
    static async injectComponentAsync(componentName, element) {
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
            const clonedComponent = component.cloneNode(true);
            element.after(clonedComponent);
            element.remove();
            return clonedComponent;
            // while (element.hasChildNodes()) {
            //     element.childNodes[0].remove();
            // }
            // element.appendChild(clonedComponent);
        } else {
            console.error(`Failed to load component '${componentName}'.`);
            return element;
        }
    }


}


function getComponent(componentName) {
    return componentCache.querySelector(`[data-smsgfx-component=${componentName}]`);
}

function ensureEmbeddedComponentsFromDocumentCached() {
    if (!documentLoadAttempted) {
        documentLoadAttempted = true;
        const documentComponents = document.querySelectorAll('[data-smsgfx-component]');
        documentComponents.forEach(component => {
            addComponentToCacheIfNotAlreadyThere(component);
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

async function attemptLoadComponentFromFileAsync(componentName) {
    try {
        const url = `./modules/ui/${componentName}.html`;
        const resp = await fetch(url);
        const content = await resp.text();

        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;

        const loadedComponent = tempElement.querySelector(`[data-smsgfx-component=${componentName}]`);
        addComponentToCacheIfNotAlreadyThere(loadedComponent);
    } catch (ex) {
        console.error(`Failed to load component markup file '${componentName}'.`, e);
    }
}

function addComponentToCacheIfNotAlreadyThere(component) {
    const componentName = component.getAttribute('data-smsgfx-component');
    if (componentName) {
        const foundComponent = componentCache.querySelector(`[data-smsgfx-component=${componentName}]`);
        if (!foundComponent) componentCache.appendChild(component);
    }
}
